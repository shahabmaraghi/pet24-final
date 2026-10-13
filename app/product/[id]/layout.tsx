import type { Metadata } from "next";
import { getStoreProduct } from "@/lib/get-store-products";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getStoreProduct(id).catch(() => null);
  if (!product) return { title: "محصول", robots: { index: false, follow: true } };
  return {
    title: product.name,
    description: product.desc || `${product.name} در فروشگاه Pet24`,
    alternates: { canonical: `/product/${product.id}` },
    openGraph: {
      title: product.name,
      description: product.desc || product.name,
      images: product.images?.[0] ? [{ url: product.images[0] }] : undefined,
    },
  };
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return children;
}
