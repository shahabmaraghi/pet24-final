import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
dotenv.config({ path: path.join(root, ".env") });
dotenv.config({ path: path.join(root, ".env.local"), override: true });

const BASE = "https://petabad.com";
const LIST = `${BASE}/shop/3623-Royal-Canin/`;
const OUT_JSON = path.join(root, "scripts", "petabad-royal-canin.json");
const IMPORT = process.argv.includes("--import");
const CONCURRENCY = 12;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "fa-IR,fa;q=0.9,en;q=0.8",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function decodeHtml(s) {
  return String(s || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#038;/g, "&")
    .replace(/&#8203;/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toAsciiDigits(text) {
  return String(text || "")
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
}

function parsePrice(text) {
  const digits = toAsciiDigits(text).replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

function pickMeta(html, prop) {
  const re1 = new RegExp(`<(?:meta)[^>]+(?:property|name)="${prop}"[^>]+content="([^"]*)"`, "i");
  const re2 = new RegExp(`content="([^"]*)"[^>]+(?:property|name)="${prop}"`, "i");
  const re3 = new RegExp(`<(?:meta)[^>]+(?:property|name)='${prop}'[^>]+content='([^']*)'`, "i");
  return decodeHtml((html.match(re1) || html.match(re2) || html.match(re3) || [])[1] || "");
}

function collectProductUrls(html) {
  return [
    ...new Set(
      [...html.matchAll(/https?:\/\/petabad\.com\/shop\/[^"'<\s]+\/P\d+-[^"'<\s]+\.html/g)].map((m) => m[0])
    ),
  ];
}

function maxPage(html) {
  let max = 1;
  for (const m of html.matchAll(/[?&]page=(\d+)/g)) max = Math.max(max, Number(m[1]));
  return max;
}

function guessCategoryId(url, name) {
  const u = `${url} ${name}`.toLowerCase();
  if (/bird|پرنده|قناری|طوطی|عروس|فنچ|مینا/.test(u)) return "birds";
  if (/fish|آکواریوم|ماهی|آبزی/.test(u)) return "fish";
  if (/rabbit|خرگوش|همستر|جونده|rodent|hamster/.test(u)) return "rodents";
  if (/kitten|cat-|\/cat|گربه/.test(u)) return "cat";
  if (/dog-|\/dog|سگ|puppy|توله/.test(u)) return "dog";
  if (/accessori|اسباب|قلاده|خاک|لوازم/.test(u)) return "accessories";
  if (/health|بهداشت|شامپو|ویتامین|مکمل/.test(u)) return "health";
  return "dog";
}

function parseProduct(html, url) {
  let name = pickMeta(html, "og:title") || decodeHtml(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || "");
  name = name.replace(/\s*\|\s*پت شاپ.*$/i, "").trim();
  const desc = pickMeta(html, "og:description") || pickMeta(html, "description");
  const images = [];
  const og = pickMeta(html, "og:image");
  if (og) images.push(og);
  for (const m of html.matchAll(/https?:\/\/petabad\.com\/uploads\/[a-f0-9]{20,}\.(?:jpg|jpeg|png|webp)/gi)) {
    const clean = m[0].replace(/\.(?:w_\d+,h_\d+,r_[a-z])+\./i, ".");
    if (!images.includes(clean) && images.length < 6) images.push(clean);
  }

  // Prefer main product price attribute
  let price = 0;
  let oldPrice;
  const main = html.match(/id=['"]wz-product-price['"][^>]*wz-data-product-price=['"](\d+)['"]/i)
    || html.match(/wz-data-product-price=['"](\d+)['"][^>]*id=['"]wz-product-price['"]/i);
  if (main) price = Number(main[1]);

  const oldAttr = html.match(/wz-shop-product-old-price(?![^>]*empty)[^>]*wz-data-product-price=['"](\d+)['"]/i);
  if (oldAttr) {
    const n = Number(oldAttr[1]);
    if (n > price) oldPrice = n;
  }

  if (!price) {
    const attrs = [...html.matchAll(/wz-data-product-price=['"](\d+)['"]/gi)].map((m) => Number(m[1])).filter((n) => n > 0);
    if (attrs.length) price = attrs[0];
  }

  const stock = /ناموجود|اتمام موجودی|out of stock/i.test(html) ? 0 : 100;
  const categoryId = guessCategoryId(url, name);

  return {
    sourceUrl: url,
    name,
    desc,
    price,
    oldPrice,
    badge: oldPrice && oldPrice > price ? "تخفیف" : undefined,
    images,
    stock,
    specs: [],
    type: "غذا و خوراک",
    categoryId,
  };
}

async function mapPool(items, limit, worker) {
  const results = new Array(items.length);
  let i = 0;
  async function run() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await worker(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

async function crawlAll() {
  const t0 = Date.now();
  console.log("Fetching brand listing pages...");
  const first = await fetchHtml(LIST);
  const pages = maxPage(first);
  const pageHtmls = [first];
  if (pages > 1) {
    const rest = await mapPool(
      Array.from({ length: pages - 1 }, (_, i) => i + 2),
      5,
      async (p) => fetchHtml(`${LIST}?page=${p}`)
    );
    pageHtmls.push(...rest);
  }

  const productUrls = [...new Set(pageHtmls.flatMap(collectProductUrls))];
  console.log(`${pages} pages → ${productUrls.length} products. Parallel x${CONCURRENCY}...`);

  let ok = 0;
  let fail = 0;
  const products = (
    await mapPool(productUrls, CONCURRENCY, async (url, idx) => {
      try {
        const html = await fetchHtml(url);
        const product = parseProduct(html, url);
        if (!product.name) {
          fail++;
          return null;
        }
        ok++;
        if ((idx + 1) % 25 === 0 || idx + 1 === productUrls.length) {
          console.log(`  ${idx + 1}/${productUrls.length} (${ok} ok, ${fail} fail)`);
        }
        return product;
      } catch {
        fail++;
        return null;
      }
    })
  ).filter(Boolean);

  fs.writeFileSync(OUT_JSON, JSON.stringify(products, null, 2), "utf8");
  console.log(`Saved ${products.length} in ${((Date.now() - t0) / 1000).toFixed(1)}s → ${OUT_JSON}`);
  return products;
}

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    categoryId: { type: String, required: true, index: true },
    brandId: { type: String, default: "", index: true },
    type: String,
    price: { type: Number, required: true },
    oldPrice: Number,
    badge: String,
    featured: { type: Boolean, default: false },
    desc: String,
    specs: [{ k: String, v: String, _id: false }],
    images: [String],
    stock: { type: Number, default: 100 },
  },
  { timestamps: true }
);

const BrandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    nameFa: { type: String, default: "" },
    logo: { type: String, default: "" },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

async function ensureRoyalCaninBrand() {
  const Brand = mongoose.models.Brand || mongoose.model("Brand", BrandSchema);
  let brand = await Brand.findOne({
    $or: [{ name: /royal\s*canin/i }, { nameFa: /رویال\s*کنین/ }],
  });
  if (!brand) {
    brand = await Brand.create({
      name: "Royal Canin",
      nameFa: "رویال کنین",
      logo: "/brands/royal-canin.svg",
      order: 1,
      active: true,
    });
    console.log("Created Royal Canin brand", brand._id.toString());
  } else {
    console.log("Using Royal Canin brand", brand._id.toString(), brand.name);
  }
  return brand;
}

async function importProducts(products) {
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!uri) throw new Error("MONGODB_URI missing in .env.local");
  await mongoose.connect(uri);
  const brand = await ensureRoyalCaninBrand();
  const brandId = String(brand._id);
  const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

  let inserted = 0;
  let updated = 0;
  for (const p of products) {
    const sourceSpec = { k: "منبع", v: p.sourceUrl };
    const specs = [...(p.specs || []).filter((s) => s.k !== "منبع"), sourceSpec];
    const existing = await Product.findOne({
      $or: [{ name: p.name }, { specs: { $elemMatch: { k: "منبع", v: p.sourceUrl } } }],
    });
    const payload = {
      name: p.name,
      categoryId: p.categoryId || "dog",
      brandId,
      type: p.type || "غذا و خوراک",
      price: Number(p.price) || 0,
      oldPrice: p.oldPrice,
      badge: p.badge,
      featured: false,
      desc: p.desc || "",
      specs,
      images: p.images || [],
      stock: p.stock ?? 100,
    };
    if (existing) {
      await Product.updateOne({ _id: existing._id }, { $set: payload });
      updated++;
    } else {
      await Product.create(payload);
      inserted++;
    }
  }
  console.log(`DB import: inserted=${inserted} updated=${updated} total=${products.length} brandId=${brandId}`);
  await mongoose.disconnect();
}

const products = await crawlAll();
if (IMPORT) await importProducts(products);
else console.log("Add --import to write into MongoDB.");
