import type { Metadata } from "next";
import { getStoreBrand } from "@/lib/get-store-brands";
import { brandDisplayName } from "@/lib/store-brand";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const brand = await getStoreBrand(id).catch(() => undefined);
  if (!brand) return { title: "برند", robots: { index: false, follow: true } };
  const name = brandDisplayName(brand);
  return {
    title: name,
    description: `خرید محصولات برند ${name} از فروشگاه Pet24`,
    alternates: { canonical: `/brand/${brand.id}` },
  };
}

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  return children;
}
