import type { Metadata } from "next";
import { NOINDEX } from "@/lib/site";

export const metadata: Metadata = {
  title: "ثبت‌نام",
  ...NOINDEX,
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
