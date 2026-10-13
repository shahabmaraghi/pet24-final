import type { Metadata } from "next";
import { NOINDEX } from "@/lib/site";

export const metadata: Metadata = {
  title: "پنل مدیریت",
  ...NOINDEX,
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
