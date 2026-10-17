import { dbConnect, withMongoRetry } from "@/lib/db";
import Category from "@/lib/models/Category";
import { categoryLookupFilter } from "@/lib/category-id";
import { ensureCategories } from "@/lib/ensure-categories";
import { ACTIVE_CATEGORY_FILTER, serializeCategory, type StoreCategory } from "@/lib/store-category";

export type { StoreCategory };

export async function getStoreCategories(): Promise<StoreCategory[]> {
  return withMongoRetry(async () => {
    await ensureCategories();
    const items = await Category.collection.find(ACTIVE_CATEGORY_FILTER).sort({ order: 1, name: 1 }).toArray();
    return items.map(serializeCategory);
  });
}

export async function getStoreCategory(id: string): Promise<StoreCategory | undefined> {
  await dbConnect();
  await ensureCategories();
  const item = await Category.collection.findOne({ ...categoryLookupFilter(id), ...ACTIVE_CATEGORY_FILTER });
  return item ? serializeCategory(item) : undefined;
}
