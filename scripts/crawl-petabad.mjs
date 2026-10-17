import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
dotenv.config({ path: path.join(root, ".env") });
dotenv.config({ path: path.join(root, ".env.local"), override: true });

function arg(name, fallback = "") {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
}

const BASE = "https://petabad.com";
const LIST_PATH = arg("list", "/shop/2932-Cat-Products/");
const LIST = LIST_PATH.startsWith("http") ? LIST_PATH : `${BASE}${LIST_PATH.startsWith("/") ? "" : "/"}${LIST_PATH}`;
const CATEGORY_ID = arg("categoryId", "cat");
const FORCE_CATEGORY = process.argv.includes("--forceCategory") || Boolean(CATEGORY_ID);
const PRODUCT_TYPE = arg("type", "");
const BRAND_NAME = arg("brand", "");
const SLUG = LIST.replace(/\/$/, "").split("/").pop() || "petabad";
const OUT_JSON = path.join(root, "scripts", `petabad-${SLUG}.json`);
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

function guessType(url, name) {
  const u = `${url} ${name}`.toLowerCase();
  if (/toy|اسباب/.test(u)) return "اسباب‌بازی";
  if (/litter|خاک|بستر/.test(u)) return "بهداشت و دارو";
  if (/collar|قلاده|لباس|حوله|باکس|حمل|خانه|تخت|اسکرچ|درخت|ظرف/.test(u)) return "لباس و اکسسوری";
  if (/shampoo|شامپو|بهداشت|ناخن|مسواک|دستمال|برس|پد/.test(u)) return "بهداشت و دارو";
  if (/vitamin|مکمل|اسپری|قطره|کرم|سلامت/.test(u)) return "بهداشت و دارو";
  if (/treat|تشویقی|بستنی/.test(u)) return "غذا و خوراک";
  if (/wet|پوچ|کنسرو|dry|غذا|شیر/.test(u)) return "غذا و خوراک";
  return PRODUCT_TYPE || "عمومی";
}

function guessCategoryId(url, name) {
  if (FORCE_CATEGORY && CATEGORY_ID) return CATEGORY_ID;
  const u = `${url} ${name}`.toLowerCase();
  if (/kitten|cat-|\/cat|گربه/.test(u)) return "cat";
  if (/dog-|\/dog|سگ|puppy|توله/.test(u)) return "dog";
  if (/bird|پرنده/.test(u)) return "birds";
  if (/fish|ماهی|آکواریوم/.test(u)) return "fish";
  if (/rabbit|خرگوش|همستر|جونده/.test(u)) return "rodents";
  if (/accessori|اسباب|قلاده|خاک|لوازم/.test(u)) return "accessories";
  if (/health|بهداشت|شامپو|ویتامین|مکمل/.test(u)) return "health";
  return CATEGORY_ID || "cat";
}

/** Shared category/feature icons shown next to product galleries (dog/cat/rabbit/truck/etc). */
const PETABAD_ICON_HASHES = new Set([
  "d2a5d5a819164a70a929d34f622d7184",
  "d9805adbd1a64d1992351d92513cac29",
  "eb98692803b5422087bf4b3bc9a3f4e9",
  "ea5fff9ec57a413f8839254808d620b7",
  "9dac4ec500684026ae40502da4f3682e",
]);

function isPetabadProductImage(url) {
  const hash = (String(url).match(/uploads\/([a-f0-9]{20,})/i) || [])[1];
  return Boolean(hash) && !PETABAD_ICON_HASHES.has(hash.toLowerCase());
}

function parseProduct(html, url) {
  let name = pickMeta(html, "og:title") || decodeHtml(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || "");
  name = name.replace(/\s*\|\s*پت شاپ.*$/i, "").trim();
  const desc = pickMeta(html, "og:description") || pickMeta(html, "description");
  const images = [];
  const og = pickMeta(html, "og:image");
  if (og && isPetabadProductImage(og)) images.push(og);
  for (const m of html.matchAll(/https?:\/\/petabad\.com\/uploads\/[a-f0-9]{20,}\.(?:jpg|jpeg|png|webp)/gi)) {
    const clean = m[0].replace(/\.(?:w_\d+,h_\d+,r_[a-z])+\./i, ".");
    if (isPetabadProductImage(clean) && !images.includes(clean) && images.length < 6) images.push(clean);
  }

  let price = 0;
  let oldPrice;
  const main =
    html.match(/id=['"]wz-product-price['"][^>]*wz-data-product-price=['"](\d+)['"]/i) ||
    html.match(/wz-data-product-price=['"](\d+)['"][^>]*id=['"]wz-product-price['"]/i);
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
    type: guessType(url, name),
    categoryId: guessCategoryId(url, name),
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
  console.log(`Listing: ${LIST}`);
  console.log(`Target categoryId=${CATEGORY_ID}`);
  const first = await fetchHtml(LIST.endsWith("/") ? LIST : `${LIST}/`);
  const pages = maxPage(first);
  const pageHtmls = [first];
  if (pages > 1) {
    const rest = await mapPool(
      Array.from({ length: pages - 1 }, (_, i) => i + 2),
      5,
      async (p) => fetchHtml(`${LIST.replace(/\/?$/, "/")}?page=${p}`)
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

async function resolveBrandId() {
  if (!BRAND_NAME) return "";
  const Brand = mongoose.models.Brand || mongoose.model("Brand", BrandSchema);
  const brand = await Brand.findOne({
    $or: [{ name: new RegExp(BRAND_NAME, "i") }, { nameFa: new RegExp(BRAND_NAME, "i") }],
  });
  return brand ? String(brand._id) : "";
}

async function importProducts(products) {
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!uri) throw new Error("MONGODB_URI missing in .env.local");
  await mongoose.connect(uri);
  const brandId = await resolveBrandId();
  const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

  let inserted = 0;
  let updated = 0;
  for (const p of products) {
    const specs = (p.specs || []).filter((s) => s.k !== "منبع");
    const existing = await Product.findOne({
      $or: [{ name: p.name }, { specs: { $elemMatch: { k: "منبع", v: p.sourceUrl } } }],
    });
    const payload = {
      name: p.name,
      categoryId: CATEGORY_ID || p.categoryId || "cat",
      brandId: existing?.brandId || brandId || "",
      type: p.type || PRODUCT_TYPE || "عمومی",
      price: Number(p.price) || 0,
      oldPrice: p.oldPrice,
      badge: p.badge,
      featured: false,
      desc: p.desc || "",
      specs,
      images: p.images || [],
      stock: p.stock ?? 100,
    };
    // Keep existing brandId if product already linked (e.g. Royal Canin imports)
    if (existing?.brandId && !brandId) payload.brandId = existing.brandId;

    if (existing) {
      await Product.updateOne({ _id: existing._id }, { $set: payload });
      updated++;
    } else {
      await Product.create(payload);
      inserted++;
    }
  }
  console.log(`DB import: inserted=${inserted} updated=${updated} total=${products.length} categoryId=${CATEGORY_ID}`);
  await mongoose.disconnect();
}

const products = await crawlAll();
if (IMPORT) await importProducts(products);
else console.log("Add --import to write into MongoDB.");
