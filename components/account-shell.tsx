"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { User, MapPin, ClipboardList, CreditCard, Heart, History, LogOut } from "lucide-react";
import { PawLogo } from "@/components/paw-logo";

export const ACCOUNT_NAV = [
  { href: "/account/profile", label: "پروفایل", Icon: User },
  { href: "/account/addresses", label: "آدرس‌ها", Icon: MapPin },
  { href: "/account/orders", label: "سفارشات", Icon: ClipboardList },
  { href: "/account/payments", label: "پرداخت‌ها", Icon: CreditCard },
  { href: "/account/wishlist", label: "علاقه‌مندی‌ها", Icon: Heart },
  { href: "/account/recent", label: "بازدیدهای اخیر", Icon: History },
] as const;

export function AccountShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  React.useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status !== "authenticated" || !session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        در حال بررسی ورود...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen md:grid-cols-[230px_1fr]">
        <aside className="flex gap-2 overflow-x-auto border-b bg-card p-3.5 md:flex-col md:overflow-visible md:border-b-0 md:border-l md:p-5">
          <div className="hidden items-center gap-2.5 px-1 pb-5 md:flex">
            <PawLogo size={36} />
            <div className="font-extrabold text-primary">حساب کاربری</div>
          </div>
          {ACCOUNT_NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-2.5 rounded-[10px] px-3.5 py-2.5 text-sm font-semibold md:px-3.5 md:py-3 ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}
              >
                <item.Icon className="h-[17px] w-[17px] shrink-0" strokeWidth={1.8} />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="hidden items-center gap-2 rounded-[10px] px-3.5 py-3 text-sm font-semibold text-destructive md:mt-auto md:flex"
          >
            <LogOut className="h-4 w-4" />خروج از حساب
          </button>
        </aside>
        <main className="p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
