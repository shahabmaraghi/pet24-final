import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(root, ".env") });
dotenv.config({ path: path.join(root, ".env.local"), override: true });

/** Match longer / more specific patterns first */
const BRAND_PATTERNS = [
  { keys: ["royal canin", "royalcanin", "royal-canin", "رویال کنین", "رویالکنین"], name: "Royal Canin" },
  { keys: ["happy dog", "happydog", "هپی داگ", "هپی‌داگ", "هپیداگ"], name: "Happy Dog" },
  { keys: ["happy cat", "happycat", "هپی کت", "هپی‌کت", "هپیکت"], name: "Happy Cat" },
  { keys: ["pro plan", "proplan", "پرو پلن", "پروپلن"], name: "Pro Plan" },
  { keys: ["josera", "josi dog", "josidog", "جوسرا", "جوسی"], name: "Josera" },
  { keys: ["monolo", "monello", "مونلو", "مونولو"], name: "Monolo" },
  { keys: ["monge", "مونژه", "مونجه"], name: "Monge" },
  { keys: ["reflex plus", "reflex", "رفلکس"], name: "Reflex" },
  { keys: ["hill's", "hills", "هیلز"], name: "Hill's" },
  { keys: ["farmina", "فارمینا"], name: "Farmina" },
  { keys: ["whiskas", "ویسکاس"], name: "Whiskas" },
  { keys: ["pedigree", "پدیگری"], name: "Pedigree" },
  { keys: ["leonardo", "لئوناردو"], name: "Leonardo" },
  { keys: ["acana", "آکانا"], name: "Acana" },
  { keys: ["orijen", "اوریجن"], name: "Orijen" },
  { keys: ["sheba", "شیبا"], name: "Sheba" },
  { keys: ["animonda", "آنیموندا"], name: "Animonda" },
  { keys: ["trainer", "ترینر"], name: "Trainer" },
  { keys: ["bosch", "بوش"], name: "Bosch" },
  { keys: ["brit", "بریت"], name: "Brit" },
  // Extra brands commonly in imports — create if missing
  { keys: ["beaphar", "بیفار"], name: "Beaphar", nameFa: "بیفار" },
  { keys: ["wanpy", "ونپی"], name: "Wanpy", nameFa: "ونپی" },
  { keys: ["jerhigh", "جرهای", "جر های"], name: "JerHigh", nameFa: "جرهای" },
  { keys: ["gourmet", "گورمت"], name: "Gourmet", nameFa: "گورمت" },
  { keys: ["felix", "فلیکس"], name: "Felix", nameFa: "فلیکس" },
  { keys: ["winston", "وینستون"], name: "Winston", nameFa: "وینستون" },
  { keys: ["dreamies", "دریمیز"], name: "Dreamies", nameFa: "دریمیز" },
  { keys: ["meus", "مئوس"], name: "Meus", nameFa: "مئوس" },
  { keys: ["fidar", "فیدار"], name: "Fidar", nameFa: "فیدار" },
  { keys: ["orlando", "اورلاندو"], name: "Orlando", nameFa: "اورلاندو" },
  { keys: ["trm ", " trm", "تی آر ام", "تی ار ام", "تی‌آر‌ام", "تی‌ار‌ام"], name: "TRM", nameFa: "تی‌آر‌ام" },
  { keys: ["anivital", "آنتی ویتال", "آنی ویتال"], name: "Anivital", nameFa: "آنی‌ویتال" },
  { keys: ["veken", "ویکن"], name: "Veken", nameFa: "ویکن" },
  { keys: ["skudo", "اسکودو"], name: "Skudo", nameFa: "اسکودو" },
  { keys: ["els pet", "ال اس پت"], name: "Els Pet", nameFa: "الس‌پت" },
  { keys: ["love me", "لاومی"], name: "Love Me", nameFa: "لاومی" },
  { keys: ["mamamia", "مامامیا"], name: "Mamamia", nameFa: "مامامیا" },
  { keys: ["top 10", "top10", "تاپ تن"], name: "Top 10", nameFa: "تاپ‌تن" },
  { keys: ["bravecto", "براوکتو"], name: "Bravecto", nameFa: "براوکتو" },
  { keys: ["schesir", "شسیر", "سشیر"], name: "Schesir", nameFa: "شسیر" },
  { keys: ["friskies", "فریسکیز"], name: "Friskies", nameFa: "فریسکیز" },
  { keys: ["gimcat", "gim cat", "jimcat", "jim cat", "جیم کت", "جیمکت"], name: "GimCat", nameFa: "جیم‌کت" },
  { keys: ["dr.clauders", "dr.clauder", "dr clauders", "دکترکلادرز", "دکتر کلادرز", "دکترکلودرز"], name: "Dr.Clauder's", nameFa: "دکتر کلادرز" },
  { keys: ["trixie", "تریکسی"], name: "Trixie", nameFa: "تریکسی" },
  { keys: ["happy time", "هپی تایم", "هپیتایم"], name: "Happy Time", nameFa: "هپی‌تایم" },
  { keys: ["shire ", " shire", "شایر"], name: "Shire", nameFa: "شایر" },
  { keys: ["kitekat", "کچت"], name: "Kitekat", nameFa: "کچت" },
  { keys: ["din bestes", "dinbestes", "دین بستس"], name: "Din Bestes", nameFa: "دین بستس" },
  { keys: ["koshida", "کوشیدا"], name: "Koshida", nameFa: "کوشیدا" },
  { keys: ["pronature", "پرونیچر"], name: "Pronature", nameFa: "پرونیچر" },
  { keys: ["vet expert", "vetexpert", "وت اکسپرت", "وت‌اکسپرت"], name: "Vet Expert", nameFa: "وت اکسپرت" },
  { keys: ["cat pack", "کت پک", "کتپک"], name: "Cat Pack", nameFa: "کت پک" },
  { keys: ["goldpad", "gold pad", "گلد پد", "گلدپد"], name: "GoldPad", nameFa: "گلد پد" },
  { keys: ["petopia", "پتوپیا"], name: "Petopia", nameFa: "پتوپیا" },
  { keys: ["us pet", "uspet", "یو اس پت", "یواس پت"], name: "US Pet", nameFa: "یو اس پت" },
  { keys: ["vipet", "vi pet", "وی پت", "ویپت"], name: "Vipet", nameFa: "وی پت" },
  { keys: ["puller", "پولر"], name: "Puller", nameFa: "پولر" },
  { keys: ["dentalight", "دنتالایت"], name: "Dentalight", nameFa: "دنتالایت" },
  { keys: ["gnawlers", "گناولرز"], name: "Gnawlers", nameFa: "گناولرز" },
  { keys: ["neopet", "نئوپت"], name: "Neopet", nameFa: "نئوپت" },
  { keys: ["redspring", "رداسپرینگ"], name: "Redspring", nameFa: "رداسپرینگ" },
  { keys: ["celebon", "سلبن"], name: "Celebon", nameFa: "سلبن" },
  { keys: ["zarix", "زاریکس"], name: "Zarix", nameFa: "زاریکس" },
  { keys: ["dudoti", "دودوتی"], name: "Dudoti", nameFa: "دودوتی" },
  { keys: ["dougez", "دوگز"], name: "Dougez", nameFa: "دوگز" },
  { keys: ["nuby", "نوبی"], name: "Nuby", nameFa: "نوبی" },
  { keys: ["makian dam pars", "ماکیان دام پارس"], name: "Makian Dam Pars", nameFa: "ماکیان دام پارس" },
  { keys: ["ronix", "رونیکس"], name: "Ronix", nameFa: "رونیکس" },
  { keys: ["ninapet", "نیناپت"], name: "Ninapet", nameFa: "نیناپت" },
  { keys: ["idolpet", "آیدل پت"], name: "Idolpet", nameFa: "آیدل‌پت" },
  { keys: ["pet gravity", "petgravity", "پت گرویتی"], name: "Pet Gravity", nameFa: "پت گرویتی" },
  { keys: ["m-pets", "mpets", "ام پت", "ام‌پت"], name: "M-Pets", nameFa: "ام پت" },
  { keys: ["happy pet", "هپی پت", "هپی‌پت"], name: "Happy Pet", nameFa: "هپی پت" },
  { keys: ["adriana pet", "adrianapet", "آدریاناپت", "آدریانا پت"], name: "Adriana Pet", nameFa: "آدریاناپت" },
  { keys: ["asopet", "آسوپت"], name: "Asopet", nameFa: "آسوپت" },
  { keys: ["rose pet", "رز پت", "رزپت"], name: "Rose Pet", nameFa: "رز پت" },
  { keys: ["kerbl", "کربل"], name: "Kerbl", nameFa: "کربل" },
];

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/‌/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function detectBrand(name) {
  const n = normalize(name);
  for (const pattern of BRAND_PATTERNS) {
    if (pattern.keys.some((key) => n.includes(normalize(key)))) return pattern;
  }
  return null;
}

async function main() {
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!uri) throw new Error("MONGODB_URI missing");
  await mongoose.connect(uri);
  const products = mongoose.connection.collection("products");
  const brands = mongoose.connection.collection("brands");

  const brandDocs = await brands.find({}).toArray();
  const byName = new Map();
  for (const b of brandDocs) {
    byName.set(normalize(b.name), b);
    if (b.nameFa) byName.set(normalize(b.nameFa), b);
  }

  async function ensureBrand(pattern) {
    const existing = byName.get(normalize(pattern.name)) || (pattern.nameFa ? byName.get(normalize(pattern.nameFa)) : null);
    if (existing) return existing;
    const slug = pattern.name
      .toLowerCase()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const doc = {
      name: pattern.name,
      nameFa: pattern.nameFa || "",
      logo: slug ? `/brands/${slug}.png` : "",
      order: (await brands.countDocuments()) + 1,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const res = await brands.insertOne(doc);
    const created = { ...doc, _id: res.insertedId };
    byName.set(normalize(pattern.name), created);
    if (pattern.nameFa) byName.set(normalize(pattern.nameFa), created);
    console.log("Created brand:", pattern.name);
    return created;
  }

  const cursor = products.find({}, { projection: { name: 1, brandId: 1 } });
  let scanned = 0;
  let assigned = 0;
  let skipped = 0;
  let unmatched = 0;
  const unmatchedSamples = [];
  const counts = new Map();

  for await (const product of cursor) {
    scanned++;
    const match = detectBrand(product.name);
    if (!match) {
      unmatched++;
      if (unmatchedSamples.length < 20) unmatchedSamples.push(product.name);
      continue;
    }
    const brand = await ensureBrand(match);
    const brandId = String(brand._id);
    if (String(product.brandId || "") === brandId) {
      skipped++;
      continue;
    }
    await products.updateOne({ _id: product._id }, { $set: { brandId, updatedAt: new Date() } });
    assigned++;
    counts.set(match.name, (counts.get(match.name) || 0) + 1);
  }

  const total = await products.countDocuments();
  const withBrand = await products.countDocuments({ brandId: { $nin: ["", null] } });

  console.log({
    scanned,
    assigned,
    alreadyCorrect: skipped,
    unmatched,
    total,
    withBrand,
    withoutBrand: total - withBrand,
  });
  console.log("Assigned by brand:", Object.fromEntries([...counts.entries()].sort((a, b) => b[1] - a[1])));
  if (unmatchedSamples.length) {
    console.log("Unmatched samples:");
    for (const name of unmatchedSamples) console.log(" -", name);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
