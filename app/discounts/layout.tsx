import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تخفیف‌ها",
  description: "محصولات تخفیف‌دار حیوانات خانگی در فروشگاه Pet24.",
  alternates: { canonical: "/discounts" },
};

export default function DiscountsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
