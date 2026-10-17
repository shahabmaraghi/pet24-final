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

const BASE = "https://tomojerry.com";
const KIND = arg("kind", "product-category"); // product-category | product-tag
const SLUG = arg("category", arg("tag", "cat-food"));
const CATEGORY_ID = arg("categoryId", "cat");
const PRODUCT_TYPE = arg("type", "غذا و خوراک");
const LIST_PATH = `/${KIND}/${SLUG}/`;
const OUT_JSON = path.join(root, "scripts", `tomojerry-${SLUG}.json`);
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
    .replace(/&#8211;/g, "–")
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

function collectProductUrls(html) {
  const urls = new Set();
  for (const m of html.matchAll(/href="(https?:\/\/tomojerry\.com\/product\/[^"#?]+)"/g)) {
    urls.add(m[1].replace(/\/$/, ""));
  }
  for (const m of html.matchAll(/href="(\/product\/[^"#?]+)"/g)) {
    urls.add(`${BASE}${m[1]}`.replace(/\/$/, ""));
  }
  return [...urls];
}

function maxPage(html) {
  let max = 1;
  const re = new RegExp(`${SLUG.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\/page\\/(\\d+)`, "g");
  for (const m of html.matchAll(re)) max = Math.max(max, Number(m[1]));
  return max;
}

function pickMeta(html, prop) {
  const re1 = new RegExp(`<(?:meta)[^>]+(?:property|name)="${prop}"[^>]+content="([^"]*)"`, "i");
  const re2 = new RegExp(`content="([^"]*)"[^>]+(?:property|name)="${prop}"`, "i");
  return decodeHtml((html.match(re1) || html.match(re2) || [])[1] || "");
}

function extractPrices(html) {
  const display = [];
  for (const m of html.matchAll(/woocommerce-Price-amount[^>]*>[\s\S]*?<bdi>([\s\S]*?)<\/bdi>/gi)) {
    const n = parsePrice(m[1]);
    if (n > 0) display.push(n);
  }
  if (display.length) return [...new Set(display)];

  const json = [];
  for (const m of html.matchAll(/"(?:price|display_price|regular_price|sale_price)"\s*:\s*"?([0-9.]+)"?/gi)) {
    const n = Math.round(Number(m[1]));
    if (n > 0) json.push(Math.round(n / 10));
  }
  return [...new Set(json)];
}

function parseProduct(html, url) {
  const name =
    pickMeta(html, "og:title") ||
    decodeHtml((html.match(/<h1[^>]*class="[^"]*product_title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || "").trim());

  const desc = pickMeta(html, "og:description") || pickMeta(html, "description");
  const images = [];
  const og = pickMeta(html, "og:image");
  if (og) images.push(og);
  for (const m of html.matchAll(/data-large_image="(https?:\/\/tomojerry\.com\/wp-content\/uploads\/[^"]+)"/g)) {
    if (!images.includes(m[1])) images.push(m[1]);
  }

  const prices = extractPrices(html);
  let price = 0;
  let oldPrice;
  if (prices.length >= 2) {
    oldPrice = Math.max(...prices);
    price = Math.min(...prices);
  } else if (prices.length === 1) {
    price = prices[0];
  }

  const sku = decodeHtml(html.match(/<span[^>]*class="[^"]*sku[^"]*"[^>]*>([\s\S]*?)<\/span>/i)?.[1] || "");
  const stock = /out-of-stock|ناموجود/i.test(html) ? 0 : 100;
  const specs = [];
  if (sku) specs.push({ k: "کد کالا", v: sku });
  for (const m of html.matchAll(
    /<th[^>]*class="[^"]*woocommerce-product-attributes-item__label[^"]*"[^>]*>([\s\S]*?)<\/th>[\s\S]*?<td[^>]*class="[^"]*woocommerce-product-attributes-item__value[^"]*"[^>]*>([\s\S]*?)<\/td>/gi
  )) {
    const k = decodeHtml(m[1]);
    const v = decodeHtml(m[2]);
    if (k && v) specs.push({ k, v });
  }

  return {
    sourceUrl: url,
    name,
    desc,
    price,
    oldPrice: oldPrice && oldPrice !== price ? oldPrice : undefined,
    badge: oldPrice && oldPrice > price ? "تخفیف" : undefined,
    images,
    stock,
    specs,
    type: PRODUCT_TYPE,
    categoryId: CATEGORY_ID,
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
  console.log(`${KIND}: ${SLUG} → categoryId=${CATEGORY_ID} type=${PRODUCT_TYPE}`);
  console.log("Fetching listing pages...");
  const first = await fetchHtml(`${BASE}${LIST_PATH}`);
  const pages = maxPage(first);
  const pageHtmls = [first];
  if (pages > 1) {
    const rest = await mapPool(
      Array.from({ length: pages - 1 }, (_, i) => i + 2),
      5,
      async (p) => fetchHtml(`${BASE}${LIST_PATH}page/${p}/`)
    );
    pageHtmls.push(...rest);
  }

  const productUrls = [...new Set(pageHtmls.flatMap(collectProductUrls))];
  console.log(`${pages} pages → ${productUrls.length} product URLs. Parallel x${CONCURRENCY}...`);

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
          console.log(`  ${idx + 1}/${productUrls.length} done (${ok} ok, ${fail} fail)`);
        }
        return product;
      } catch {
        fail++;
        return null;
      }
    })
  ).filter(Boolean);

  fs.writeFileSync(OUT_JSON, JSON.stringify(products, null, 2), "utf8");
  console.log(`Saved ${products.length} products in ${((Date.now() - t0) / 1000).toFixed(1)}s → ${OUT_JSON}`);
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

async function importProducts(products) {
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!uri) throw new Error("MONGODB_URI missing in .env.local");
  await mongoose.connect(uri);
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
      categoryId: CATEGORY_ID,
      brandId: "",
      type: p.type || PRODUCT_TYPE,
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
  console.log(`DB import: inserted=${inserted} updated=${updated} total=${products.length}`);
  await mongoose.disconnect();
}

const products = await crawlAll();
if (IMPORT) await importProducts(products);
else console.log("Add --import to write into MongoDB.");
