import type { Metadata } from "next";
import { AccountShell } from "@/components/account-shell";
import { NOINDEX } from "@/lib/site";

export const metadata: Metadata = {
  title: "حساب کاربری",
  ...NOINDEX,
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <AccountShell>{children}</AccountShell>;
}
