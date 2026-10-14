import Brand from "@/lib/models/Brand";
import { serializeBrand } from "@/lib/store-brand";
import { parseBrandId, serializeProduct, type ProductBrand, type StoreProduct } from "@/lib/store-product";

export async function attachProductBrands<T extends StoreProduct>(products: T[]): Promise<T[]> {
  const ids = [...new Set(products.map((item) => parseBrandId(item.brandId)).filter(Boolean))];
  if (!ids.length) return products;
  const docs = await Brand.find({ _id: { $in: ids } });
  const map = new Map<string, ProductBrand>(
    docs.map((doc) => {
      const brand = serializeBrand(doc);
      return [brand.id, { id: brand.id, name: brand.name, nameFa: brand.nameFa, logo: brand.logo }];
    })
  );
  return products.map((item) => {
    const brand = map.get(parseBrandId(item.brandId));
    return brand ? { ...item, brand } : { ...item, brand: undefined };
  });
}

export async function serializeProducts(docs: any[]): Promise<StoreProduct[]> {
  return attachProductBrands(docs.map(serializeProduct));
}

export async function serializeProductWithBrand(doc: any): Promise<StoreProduct> {
  const [item] = await serializeProducts([doc]);
  return item;
}
