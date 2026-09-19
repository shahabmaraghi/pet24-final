import type { Product } from "@/lib/data";

export type StoreProduct = Product & { stock?: number };

export function serializeProduct(doc: any): StoreProduct {
  const obj = typeof doc?.toObject === "function" ? doc.toObject() : doc;
  return {
    id: String(obj._id ?? obj.id),
    name: String(obj.name ?? ""),
    categoryId: String(obj.categoryId ?? ""),
    type: String(obj.type ?? ""),
    price: Number(obj.price ?? 0),
    oldPrice: obj.oldPrice != null ? Number(obj.oldPrice) : undefined,
    badge: obj.badge,
    featured: Boolean(obj.featured),
    desc: String(obj.desc ?? ""),
    specs: Array.isArray(obj.specs) ? obj.specs.map((spec: { k?: string; v?: string }) => ({ k: String(spec.k ?? ""), v: String(spec.v ?? "") })) : [],
    stock: Number(obj.stock ?? 0),
    images: Array.isArray(obj.images) ? obj.images.map(String).filter(Boolean) : [],
  };
}
