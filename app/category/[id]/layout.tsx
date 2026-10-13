import type { Metadata } from "next";
import { getStoreCategory } from "@/lib/get-store-categories";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const category = await getStoreCategory(id).catch(() => undefined);
  if (!category) return { title: "دسته‌بندی", robots: { index: false, follow: true } };
  return {
    title: category.name,
    description: `خرید محصولات ${category.name} از فروشگاه Pet24`,
    alternates: { canonical: `/category/${category.id}` },
  };
}

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
