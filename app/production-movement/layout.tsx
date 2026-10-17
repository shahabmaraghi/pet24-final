import type { Metadata } from "next";
import { NOINDEX } from "@/lib/site";

export const metadata: Metadata = {
  title: "انتقال تولید",
  ...NOINDEX,
};

export default function ProductionMovementLayout({ children }: { children: React.ReactNode }) {
  return children;
}
