import type { Metadata } from "next";
import { NOINDEX } from "@/lib/site";

export const metadata: Metadata = {
  title: "تسویه حساب",
  ...NOINDEX,
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
