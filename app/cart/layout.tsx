import type { Metadata } from "next";
import { NOINDEX } from "@/lib/site";

export const metadata: Metadata = {
  title: "سبد خرید",
  ...NOINDEX,
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
