import { dbConnect, withMongoRetry } from "@/lib/db";
import Product from "@/lib/models/Product";
import { serializeProductWithBrand, serializeProducts } from "@/lib/attach-product-brands";
import { categoryIdAliases } from "@/lib/category-id";
import type { StoreProduct } from "@/lib/store-product";

export async function getStoreProducts(filter: { categoryId?: string; brandId?: string; featured?: boolean; discounted?: boolean } = {}): Promise<StoreProduct[]> {
  return withMongoRetry(async () => {
    const query: Record<string, unknown> = {};
    if (filter.categoryId) {
      const aliases = categoryIdAliases(filter.categoryId);
      query.categoryId = aliases.length > 1 ? { $in: aliases } : aliases[0];
    }
    if (filter.brandId) query.brandId = filter.brandId;
    if (filter.featured) query.featured = true;
    if (filter.discounted) query.oldPrice = { $gt: 0 };
    const items = await Product.find(query).sort({ createdAt: -1 }).limit(48).maxTimeMS(8000);
    return await serializeProducts(items);
  });
}

export async function getStoreProduct(id: string): Promise<StoreProduct | null> {
  await dbConnect();
  if (!/^[a-fA-F0-9]{24}$/.test(id)) return null;
  const item = await Product.findById(id);
  return item ? await serializeProductWithBrand(item) : null;
}
