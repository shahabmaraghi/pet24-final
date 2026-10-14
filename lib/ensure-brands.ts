import Brand from "@/lib/models/Brand";
import { SEED_BRANDS, brandSlug } from "@/lib/store-brand";

export async function ensureBrands() {
  const count = await Brand.countDocuments();
  if (count === 0) {
    await Brand.insertMany(SEED_BRANDS, { ordered: false }).catch(() => {});
    return;
  }
  for (const seed of SEED_BRANDS) {
    const slug = brandSlug(seed.name);
    if (seed.logo) {
      await Brand.updateOne(
        {
          name: seed.name,
          $or: [{ logo: "" }, { logo: { $exists: false } }, { logo: { $regex: `^/brands/${slug}\\.` } }],
        },
        { $set: { logo: seed.logo } }
      );
    }
    if (seed.nameFa) {
      await Brand.updateOne(
        { name: seed.name, $or: [{ nameFa: "" }, { nameFa: { $exists: false } }] },
        { $set: { nameFa: seed.nameFa } }
      );
    }
  }
}
