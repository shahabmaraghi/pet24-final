import Category from "@/lib/models/Category";
import Product from "@/lib/models/Product";
import { CATEGORIES } from "@/lib/data";

export async function ensureCategories() {
  for (const [index, seed] of CATEGORIES.entries()) {
    const byName = await Category.collection.findOne({ name: seed.name });
    if (!byName) continue;
    const oldId = String(byName.id || "");
    if (oldId && oldId !== seed.id) {
      const clash = await Category.collection.findOne({ id: seed.id });
      if (clash && String(clash._id) !== String(byName._id)) {
        await Product.updateMany({ categoryId: oldId }, { $set: { categoryId: seed.id } });
        await Category.collection.deleteOne({ _id: byName._id });
      } else {
        await Category.collection.updateOne({ _id: byName._id }, { $set: { id: seed.id } });
        await Product.updateMany({ categoryId: oldId }, { $set: { categoryId: seed.id } });
      }
    }
    await Product.updateMany({ categoryId: seed.name }, { $set: { categoryId: seed.id } });
    if (byName.order == null) {
      await Category.collection.updateOne({ _id: byName._id }, { $set: { order: index } });
    }
  }

  const missingOrder = await Category.collection.find({ order: { $exists: false } }).toArray();
  if (missingOrder.length) {
    const maxDoc = await Category.collection.find({ order: { $exists: true } }).sort({ order: -1 }).limit(1).toArray();
    let next = Number(maxDoc[0]?.order ?? -1) + 1;
    for (const doc of missingOrder) {
      await Category.collection.updateOne({ _id: doc._id }, { $set: { order: next++ } });
    }
  }
}
