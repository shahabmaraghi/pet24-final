import type { Metadata } from "next";
import { NOINDEX } from "@/lib/site";

export const metadata: Metadata = {
  title: "ورود",
  ...NOINDEX,
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
