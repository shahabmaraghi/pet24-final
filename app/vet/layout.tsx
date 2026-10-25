import type { Metadata } from "next";
import { VetShell } from "@/components/vet-shell";
import { NOINDEX } from "@/lib/site";

export const metadata: Metadata = {
  title: "پنل دامپزشک",
  ...NOINDEX,
};

export default function VetLayout({ children }: { children: React.ReactNode }) {
  return <VetShell>{children}</VetShell>;
}
