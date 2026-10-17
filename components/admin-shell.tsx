"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LogOut, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PawLogo } from "@/components/paw-logo";
import { ADMIN_NAV } from "@/lib/admin-nav";

function navActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div className="mb-5 flex items-center gap-2.5 px-1">
        <PawLogo size={36} />
        <div className="font-extrabold text-primary">پنل مدیریت</div>
      </div>
      {ADMIN_NAV.map((item) => {
        const active = navActive(pathname, item.href);
        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-2.5 rounded-[10px] px-3.5 py-3 text-sm font-semibold ${
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
            }`}
          >
            <item.Icon className="h-[17px] w-[17px] shrink-0" strokeWidth={1.8} />
            {item.label}
          </Link>
        );
      })}
      <div className="mt-auto flex flex-col gap-1">
        <div className="flex items-center justify-between px-3.5 py-2">
          <span className="text-[13px] text-muted-foreground">ظاهر</span>
          <ThemeToggle />
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2 rounded-[10px] px-3.5 py-3 text-sm font-semibold text-destructive"
        >
          <LogOut className="h-4 w-4" />
          خروج از حساب
        </button>
        <Link href="/" className="px-3.5 py-3 text-[13px] text-muted-foreground">
          بازگشت به فروشگاه
        </Link>
      </div>
    </>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [navOpen, setNavOpen] = React.useState(false);

  React.useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && session?.user?.role !== "admin")) {
      router.replace("/login");
    }
  }, [status, session, router]);

  if (status !== "authenticated" || session?.user?.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        در حال بررسی دسترسی...
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
            >
              <Menu className="h-[18px] w-[18px] text-primary" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="flex flex-col gap-1 p-5">
            <NavList onNavigate={() => setNavOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="text-[15px] font-extrabold text-primary">پنل مدیریت</div>
        <div className="ms-auto">
          <ThemeToggle />
        </div>
      </div>

      <div className="grid min-h-screen md:grid-cols-[230px_1fr]">
        <aside className="hidden flex-col gap-1 border-l bg-card p-3.5 md:flex">
          <NavList />
        </aside>
        <main className="p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
