"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Menu, Search, User, ShoppingCart, Tag, PawPrint, HeartHandshake, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PawLogo } from "@/components/paw-logo";
import { CategoryIcon } from "@/components/category-icon";
import { ThemeToggle } from "@/components/theme-toggle";
import { useStoreCategories } from "@/lib/use-store-categories";
import { useCart } from "@/lib/cart-store";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const RECENT_SEARCHES = ["غذای گربه رویال کنین"];
const POPULAR_SEARCHES = ["غذای سگ", "خاک گربه", "اسباب بازی", "شامپو حیوانات"];

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { count } = useCart();
  const [open, setOpen] = React.useState(false);
  const [searchFocused, setSearchFocused] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [recent, setRecent] = React.useState(RECENT_SEARCHES);
  const categories = useStoreCategories();

  return (
    <>
      <div className="bg-primary py-2 text-center text-[13px] tracking-wide text-primary-foreground/90">
        ارسال رایگان برای خریدهای بالای ۵٬۰۰۰٬۰۰۰ تومان در سراسر ایران
      </div>
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-6 px-6 py-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="flex h-10 w-10 items-center justify-center rounded-[10px] border md:hidden" aria-label="منو">
                <Menu className="h-5 w-5 text-primary" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col gap-1 overflow-y-auto p-5">
              <SheetHeader className="mb-3 flex-row items-center justify-between space-y-0">
                <SheetTitle className="text-primary">دسته‌بندی‌ها</SheetTitle>
              </SheetHeader>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.id}`}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center gap-3 rounded-xl px-2.5 py-3.5 text-[15px] font-semibold"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]" style={{ background: cat.tint }}>
                    <CategoryIcon id={cat.id} size={18} />
                  </div>
                  {cat.name}
                </Link>
              ))}
              <Link href="/pets" onClick={() => setOpen(false)} className="mt-1.5 flex min-h-11 items-center gap-3 rounded-xl border-t px-2.5 py-3.5 pt-4 text-[15px] font-semibold text-primary">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-accent">
                  <PawPrint className="h-[18px] w-[18px]" strokeWidth={1.6} />
                </div>
                پروفایل‌ها
              </Link>
              <Link href="/vets" onClick={() => setOpen(false)} className="flex min-h-11 items-center gap-3 rounded-xl px-2.5 py-3.5 text-[15px] font-semibold">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-accent">
                  <Stethoscope className="h-[18px] w-[18px] text-primary" strokeWidth={1.6} />
                </div>
                دامپزشکان
              </Link>
              <Link href="/rehoming" onClick={() => setOpen(false)} className="flex min-h-11 items-center gap-3 rounded-xl px-2.5 py-3.5 text-[15px] font-semibold">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#f6ead8]">
                  <HeartHandshake className="h-[18px] w-[18px] text-[#8a4b12]" strokeWidth={1.6} />
                </div>
                واگذاری
              </Link>
              <Link href="/discounts" onClick={() => setOpen(false)} className="flex min-h-11 items-center gap-3 rounded-xl px-2.5 py-3.5 text-[15px] font-semibold">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[color-mix(in_oklab,var(--sale)_18%,transparent)]">
                  <Tag className="h-[18px] w-[18px] text-[var(--sale)]" strokeWidth={1.6} />
                </div>
                <span className="text-[var(--sale)]">تخفیف‌ها</span>
              </Link>
              <Link href="/about" onClick={() => setOpen(false)} className="flex min-h-11 items-center gap-3 rounded-xl px-2.5 py-3.5 text-[15px] font-semibold">
                درباره ما
              </Link>
              <Link href="/blog" onClick={() => setOpen(false)} className="flex min-h-11 items-center gap-3 rounded-xl px-2.5 py-3.5 text-[15px] font-semibold">
                بلاگ
              </Link>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2.5">
            <PawLogo size={40} />
            <Link href="/" className="text-[22px] font-extrabold text-primary">Pet24</Link>
          </div>

          <div className="order-3 flex min-w-[160px] flex-[0_1_260px] basis-full gap-2 sm:order-2 sm:basis-auto">
            <div className="relative w-full">
              <div className="flex w-full items-center gap-2 rounded-full bg-[var(--search-surface)] px-3.5 py-2.5 ring-1 ring-border/60">
                <Search className="h-4 w-4 shrink-0 text-[var(--search-placeholder)]" strokeWidth={1.8} />
                <input
                  placeholder="جستجو"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-[var(--search-placeholder)]"
                />
              </div>
              {searchFocused && (
                <div onClick={(e) => e.stopPropagation()} className="absolute right-0 top-[calc(100%+10px)] z-40 w-[340px] rounded-2xl border bg-card p-4.5 shadow-2xl">
                  <div className="mb-2.5 flex items-center justify-between">
                    <div className="text-[13px] font-bold">جستجوهای اخیر</div>
                    <button onClick={(e) => { e.stopPropagation(); setRecent([]); }} className="text-xs text-muted-foreground">پاک کردن</button>
                  </div>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {recent.map((r) => (
                      <span key={r} className="cursor-pointer rounded-full border px-3.5 py-1.5 text-[12.5px]">{r}</span>
                    ))}
                  </div>
                  <div className="mb-2.5 text-[13px] font-bold">جستجوهای پرطرفدار</div>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCHES.map((p) => (
                      <span key={p} className="cursor-pointer rounded-full border px-3.5 py-1.5 text-[12.5px]">{p}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="order-2 ms-auto flex items-center gap-2.5 sm:order-3 sm:gap-3">
            <ThemeToggle />
            <Link href={session?.user ? "/account" : "/login"} className="flex h-10 w-10 items-center justify-center rounded-xl border-[1.5px] border-border hover:bg-accent" aria-label="حساب کاربری">
              <User className="h-[19px] w-[19px] text-primary" strokeWidth={1.7} />
            </Link>

            <Button asChild variant="outline" className="relative gap-2 rounded-xl border-[1.5px] border-primary font-bold text-primary hover:bg-accent">
              <Link href="/cart">
                <ShoppingCart className="h-[17px] w-[17px]" strokeWidth={1.8} />
                <span className="hidden sm:inline">سبد خرید</span>
                {count > 0 && (
                  <span className="absolute -left-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c17d2f] px-1 text-[11px] font-bold text-white">
                    {count}
                  </span>
                )}
              </Link>
            </Button>
          </div>
        </div>
        <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-6 pb-3.5">
          <nav className="hidden min-w-0 flex-1 gap-2 overflow-x-auto md:flex">
            {categories.map((cat) => {
              const active = pathname === `/category/${cat.id}`;
              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.id}`}
                  className={`whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </nav>
          <div className="hidden shrink-0 items-center gap-5 border-r pr-4 md:flex">
            <Link href="/pets" className={`flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold ${pathname === "/pets" || pathname.startsWith("/pets/") ? "text-primary" : "text-muted-foreground hover:text-primary"}`}>
              <PawPrint className="h-4 w-4" strokeWidth={1.7} />
              پروفایل‌ها
            </Link>
            <Link href="/vets" className={`flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold ${pathname === "/vets" || pathname.startsWith("/vets/") ? "text-primary" : "text-muted-foreground hover:text-primary"}`}>
              <Stethoscope className="h-4 w-4" strokeWidth={1.7} />
              دامپزشکان
            </Link>
            <Link href="/rehoming" className={`flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold ${pathname === "/rehoming" || pathname.startsWith("/rehoming/") ? "text-primary" : "text-muted-foreground hover:text-primary"}`}>
              <HeartHandshake className="h-4 w-4" strokeWidth={1.7} />
              واگذاری
            </Link>
            <Link href="/discounts" className="flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-[var(--sale)]">
              <Tag className="h-4 w-4" strokeWidth={1.6} />
              تخفیف‌ها
            </Link>
            <Link href="/blog" className="whitespace-nowrap text-sm font-semibold text-muted-foreground hover:text-primary">بلاگ</Link>
            <Link href="/about" className="whitespace-nowrap text-sm font-semibold text-muted-foreground hover:text-primary">درباره ما</Link>
          </div>
        </div>
      </header>
      {searchFocused && (
        <div onClick={() => setSearchFocused(false)} className="fixed inset-0 z-[39]" />
      )}
    </>
  );
}
