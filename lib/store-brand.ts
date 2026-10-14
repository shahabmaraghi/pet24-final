export type StoreBrand = {
  id: string;
  name: string;
  nameFa: string;
  logo: string;
  order: number;
  active: boolean;
};

const BRAND_LOGO_EXT: Record<string, string> = {
  "royal-canin": "svg",
  josera: "png",
  "happy-cat": "webp",
  monolo: "jpg",
  monge: "svg",
  "happy-dog": "webp",
  reflex: "png",
  "pro-plan": "jpg",
  hills: "png",
  brit: "svg",
  farmina: "png",
  whiskas: "png",
  pedigree: "png",
  leonardo: "png",
  acana: "png",
  orijen: "png",
  sheba: "png",
  animonda: "svg",
  trainer: "svg",
  bosch: "webp",
};

export function brandSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function brandLogoPath(name: string) {
  const slug = brandSlug(name);
  if (!slug) return "";
  const ext = BRAND_LOGO_EXT[slug] || "png";
  return `/brands/${slug}.${ext}`;
}

const SEED_BRAND_NAMES: { name: string; nameFa: string }[] = [
  { name: "Royal Canin", nameFa: "رویال کنین" },
  { name: "Josera", nameFa: "جوسرا" },
  { name: "Happy Cat", nameFa: "هپی‌کت" },
  { name: "Monolo", nameFa: "مونولو" },
  { name: "Monge", nameFa: "مونژه" },
  { name: "Happy Dog", nameFa: "هپی‌داگ" },
  { name: "Reflex", nameFa: "رفلکس" },
  { name: "Pro Plan", nameFa: "پروپلن" },
  { name: "Hill's", nameFa: "هیلز" },
  { name: "Brit", nameFa: "بریت" },
  { name: "Farmina", nameFa: "فارمینا" },
  { name: "Whiskas", nameFa: "ویسکاس" },
  { name: "Pedigree", nameFa: "پدیگری" },
  { name: "Leonardo", nameFa: "لئوناردو" },
  { name: "Acana", nameFa: "آکانا" },
  { name: "Orijen", nameFa: "اوریجن" },
  { name: "Sheba", nameFa: "شیبا" },
  { name: "Animonda", nameFa: "آنیموندا" },
  { name: "Trainer", nameFa: "ترینر" },
  { name: "Bosch", nameFa: "بوش" },
];

export const SEED_BRANDS: Omit<StoreBrand, "id">[] = SEED_BRAND_NAMES.map((brand, index) => ({
  name: brand.name,
  nameFa: brand.nameFa,
  logo: brandLogoPath(brand.name),
  order: index + 1,
  active: true,
}));

export function serializeBrand(doc: any): StoreBrand {
  const obj = typeof doc?.toObject === "function" ? doc.toObject() : doc;
  return {
    id: String(obj._id ?? obj.id),
    name: String(obj.name ?? "").trim(),
    nameFa: String(obj.nameFa ?? "").trim(),
    logo: obj.logo ? String(obj.logo) : "",
    order: Number(obj.order || 0),
    active: obj.active !== false,
  };
}

export function brandDisplayName(brand?: Pick<StoreBrand, "name" | "nameFa"> | null) {
  if (!brand) return "";
  return brand.nameFa.trim() || brand.name.trim();
}

export function brandPath(brand: Pick<StoreBrand, "id"> | string) {
  const id = typeof brand === "string" ? brand.trim() : brand.id;
  return id ? `/brand/${id}` : "/";
}

export function brandUpdateFromBody(body: Record<string, unknown>) {
  const update: Record<string, unknown> = {};
  if (typeof body.name === "string") update.name = body.name.trim();
  if (typeof body.nameFa === "string") update.nameFa = body.nameFa.trim();
  if (typeof body.logo === "string") update.logo = body.logo.trim();
  if (body.order !== undefined) update.order = Number(body.order) || 0;
  if (typeof body.active === "boolean") update.active = body.active;
  return update;
}
