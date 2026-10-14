import type { Product } from "@/lib/data";
import type { StoreBrand } from "@/lib/store-brand";

export type ProductBrand = Pick<StoreBrand, "id" | "name" | "nameFa" | "logo">;
export type StoreProduct = Product & { stock?: number; brandId?: string; brand?: ProductBrand };

const OBJECT_ID = /^[a-fA-F0-9]{24}$/;

export function parseBrandId(value: unknown) {
  const id = typeof value === "string" ? value.trim() : "";
  return OBJECT_ID.test(id) ? id : "";
}

function pickBrand(obj: any, brandId: string): ProductBrand | undefined {
  const nested = obj?.brand;
  if (!nested || typeof nested !== "object") return undefined;
  const id = String(nested.id ?? nested._id ?? brandId ?? "").trim();
  const name = String(nested.name ?? "").trim();
  const nameFa = String(nested.nameFa ?? "").trim();
  const logo = nested.logo ? String(nested.logo) : "";
  if (!id && !name && !nameFa && !logo) return undefined;
  return { id, name, nameFa, logo };
}

export function serializeProduct(doc: any): StoreProduct {
  const obj = typeof doc?.toObject === "function" ? doc.toObject() : doc;
  const brandId = parseBrandId(obj.brandId);
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
    brandId,
    brand: pickBrand(obj, brandId),
  };
}
