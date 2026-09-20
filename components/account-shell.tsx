"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { User, MapPin, ClipboardList, CreditCard, Heart, History, LogOut, Menu } from "lucide-react";
import { PawLogo } from "@/components/paw-logo";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const ACCOUNT_NAV = [
  { href: "/account/profile", label: "پروفایل", Icon: User },
  { href: "/account/addresses", label: "آدرس‌ها", Icon: MapPin },
  { href: "/account/orders", label: "سفارشات", Icon: ClipboardList },
  { href: "/account/payments", label: "پرداخت‌ها", Icon: CreditCard },
  { href: "/account/wishlist", label: "علاقه‌مندی‌ها", Icon: Heart },
  { href: "/account/recent", label: "بازدیدهای اخیر", Icon: History },
] as const;

function AccountNavList({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="mb-5 flex items-center gap-2.5 px-1">
        <PawLogo size={36} />
        <div className="font-extrabold text-primary">حساب کاربری</div>
      </div>
      {ACCOUNT_NAV.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-2.5 rounded-[10px] px-3.5 py-3 text-sm font-semibold ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}
          >
            <item.Icon className="h-[17px] w-[17px] shrink-0" strokeWidth={1.8} />
            {item.label}
          </Link>
        );
      })}
      <div className="mt-auto flex flex-col gap-1">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2 rounded-[10px] px-3.5 py-3 text-sm font-semibold text-destructive"
        >
          <LogOut className="h-4 w-4" />خروج از حساب
        </button>
        <Link href="/" onClick={onNavigate} className="px-3.5 py-3 text-[13px] text-muted-foreground">
          بازگشت به فروشگاه
        </Link>
      </div>
    </>
  );
}

export function AccountShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [navOpen, setNavOpen] = React.useState(false);

  React.useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  React.useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  if (status !== "authenticated" || !session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        در حال بررسی ورود...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-20 flex items-center gap-3 border-b bg-card px-4 py-3.5 md:hidden">
        <Sheet open={navOpen} onOpenChange={setNavOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border"
              aria-label="منو"
            >
              <Menu className="h-[18px] w-[18px] text-primary" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="flex flex-col gap-1 p-5">
            <AccountNavList pathname={pathname} onNavigate={() => setNavOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="text-[15px] font-extrabold text-primary">حساب کاربری</div>
      </div>

      <div className="grid min-h-[calc(100vh-57px)] md:min-h-screen md:grid-cols-[230px_1fr]">
        <aside className="hidden flex-col gap-1 border-l bg-card p-3.5 md:flex md:p-5">
          <AccountNavList pathname={pathname} />
        </aside>
        <main className="p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
