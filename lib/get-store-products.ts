import { dbConnect, withMongoRetry } from "@/lib/db";
import Product from "@/lib/models/Product";
import { serializeProduct, type StoreProduct } from "@/lib/store-product";

export async function getStoreProducts(filter: { categoryId?: string; featured?: boolean } = {}): Promise<StoreProduct[]> {
  return withMongoRetry(async () => {
    const query: Record<string, unknown> = {};
    if (filter.categoryId) query.categoryId = filter.categoryId;
    if (filter.featured) query.featured = true;
    const items = await Product.find(query).sort({ createdAt: -1 }).limit(48).maxTimeMS(8000);
    return items.map(serializeProduct);
  });
}

export async function getStoreProduct(id: string): Promise<StoreProduct | null> {
  await dbConnect();
  if (!/^[a-fA-F0-9]{24}$/.test(id)) return null;
  const item = await Product.findById(id);
  return item ? serializeProduct(item) : null;
}
