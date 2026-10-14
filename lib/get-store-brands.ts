import { dbConnect, withMongoRetry } from "@/lib/db";
import Brand from "@/lib/models/Brand";
import { ensureBrands } from "@/lib/ensure-brands";
import { brandSlug, serializeBrand, type StoreBrand } from "@/lib/store-brand";

export type { StoreBrand };

const OBJECT_ID = /^[a-fA-F0-9]{24}$/;

function decodeBrandParam(value: string) {
  const raw = value.trim();
  try {
    return decodeURIComponent(raw).trim();
  } catch {
    return raw;
  }
}

export async function getStoreBrands(): Promise<StoreBrand[]> {
  return withMongoRetry(async () => {
    await ensureBrands();
    const items = await Brand.find({ active: { $ne: false } }).sort({ order: 1, name: 1 });
    return items.map(serializeBrand);
  });
}

export async function getStoreBrand(id: string): Promise<StoreBrand | undefined> {
  const raw = decodeBrandParam(id);
  if (!raw) return undefined;
  await dbConnect();
  await ensureBrands();
  if (OBJECT_ID.test(raw)) {
    const item = await Brand.findOne({ _id: raw, active: { $ne: false } });
    return item ? serializeBrand(item) : undefined;
  }
  const items = await Brand.find({ active: { $ne: false } });
  const slug = raw.toLowerCase();
  return items.map(serializeBrand).find(
    (brand) => brandSlug(brand.name) === slug || brand.name.toLowerCase() === slug || brand.nameFa === raw
  );
}
