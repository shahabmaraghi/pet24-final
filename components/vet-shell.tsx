"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { CalendarClock, LayoutGrid, LogOut, Menu, MessageSquare, Stethoscope } from "lucide-react";
import { PawLogo } from "@/components/paw-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV = [
  { href: "/vet", label: "داشبورد", Icon: LayoutGrid },
  { href: "/vet/reservations", label: "نوبت‌ها", Icon: CalendarClock },
  { href: "/vet/contact", label: "پروفایل کلینیک", Icon: Stethoscope },
  { href: "/vet/comments", label: "نظرهای کلینیک", Icon: MessageSquare },
];

export function VetShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useSession();
  const [allowed, setAllowed] = React.useState<boolean | null>(null);
  const [navOpen, setNavOpen] = React.useState(false);

  React.useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  React.useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/vet/me", { cache: "no-store" })
      .then((res) => setAllowed(res.ok))
      .catch(() => setAllowed(false));
  }, [status]);

  if (status === "authenticated" && allowed === false) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="text-lg font-extrabold text-primary">این حساب به پنل دامپزشک وصل نیست.</div>
        <p className="max-w-md text-sm leading-7 text-muted-foreground">
          مدیر سایت باید ایمیل همین حساب را در بخش دامپزشکان پنل مدیریت، روی پروفایل کلینیک ثبت کند.
        </p>
        <Link href="/" className="text-sm font-bold text-primary">بازگشت به فروشگاه</Link>
      </div>
    );
  }

  if (status !== "authenticated" || allowed !== true) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">در حال بررسی پنل دامپزشک...</div>;
  }

  const links = (
    <div className="flex h-full min-h-0 flex-col gap-1">
      <div className="mb-4 flex items-center gap-2.5 px-1">
        <PawLogo size={36} />
        <div className="font-extrabold text-primary">پنل دامپزشک</div>
      </div>
      {NAV.map((item) => {
        const active = item.href === "/vet" ? pathname === "/vet" : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setNavOpen(false)}
            className={`flex items-center gap-2.5 rounded-[10px] px-3.5 py-3 text-sm font-semibold ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}
          >
            <item.Icon className="h-[17px] w-[17px]" />
            {item.label}
          </Link>
        );
      })}
      <div className="mt-auto flex flex-col gap-1 border-t pt-2">
        <div className="flex items-center justify-between px-3.5 py-2">
          <span className="text-[13px] text-muted-foreground">ظاهر</span>
          <ThemeToggle />
        </div>
        <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-2 rounded-[10px] px-3.5 py-3 text-sm font-semibold text-destructive">
          <LogOut className="h-4 w-4" />
          خروج
        </button>
        <Link href="/vets" className="px-3.5 py-3 text-[13px] text-muted-foreground">صفحه عمومی دامپزشکان</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-20 flex items-center gap-3 border-b bg-card px-4 py-3.5 md:hidden">
        <Sheet open={navOpen} onOpenChange={setNavOpen}>
          <SheetTrigger asChild>
            <button type="button" className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border" aria-label="منو">
              <Menu className="h-[18px] w-[18px] text-primary" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="flex flex-col p-5">{links}</SheetContent>
        </Sheet>
        <div className="text-[15px] font-extrabold text-primary">پنل دامپزشک</div>
      </div>
      <div className="flex min-h-[calc(100vh-57px)] md:min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-[230px] shrink-0 flex-col overflow-y-auto border-l bg-card p-5 md:flex">{links}</aside>
        <main className="min-w-0 flex-1 p-5 pb-16 md:p-8">{children}</main>
      </div>
    </div>
  );
}
