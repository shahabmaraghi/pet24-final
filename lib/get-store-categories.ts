import { dbConnect } from "@/lib/db";
import Category from "@/lib/models/Category";
import { ACTIVE_CATEGORY_FILTER, serializeCategory, type StoreCategory } from "@/lib/store-category";

export type { StoreCategory };

export async function getStoreCategories(): Promise<StoreCategory[]> {
  await dbConnect();
  const items = await Category.collection.find(ACTIVE_CATEGORY_FILTER).sort({ name: 1 }).toArray();
  return items.map(serializeCategory);
}

export async function getStoreCategory(id: string): Promise<StoreCategory | undefined> {
  await dbConnect();
  const item = await Category.collection.findOne({ id, ...ACTIVE_CATEGORY_FILTER });
  return item ? serializeCategory(item) : undefined;
}
