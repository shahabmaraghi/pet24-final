"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Menu, Search, User, ShoppingCart, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PawLogo } from "@/components/paw-logo";
import { CategoryIcon } from "@/components/category-icon";
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
              <Link href="/discounts" onClick={() => setOpen(false)} className="mt-1.5 flex min-h-11 items-center gap-3 rounded-xl border-t px-2.5 py-3.5 pt-4 text-[15px] font-semibold">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#f7e3e3]">
                  <Tag className="h-[18px] w-[18px] text-[#b23b3b]" strokeWidth={1.6} />
                </div>
                <span className="text-[#b23b3b]">تخفیف‌ها</span>
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
              <div className="flex w-full items-center gap-2 rounded-full bg-[#eeeae0] px-3.5 py-2.5">
                <Search className="h-4 w-4 shrink-0 text-[#8a8471]" strokeWidth={1.8} />
                <input
                  placeholder="جستجو"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-[#8a8471]"
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

          <div className="order-4 mr-auto flex items-center gap-3 sm:order-3 sm:mr-0">
            <Link href={session?.user ? "/account" : "/login"} className="flex h-10 w-10 items-center justify-center rounded-xl border-[1.5px] hover:bg-accent" aria-label="حساب کاربری">
              <User className="h-[19px] w-[19px] text-primary" strokeWidth={1.7} />
            </Link>

            <Button asChild variant="outline" className="relative gap-2 rounded-xl border-[1.5px] border-primary font-bold text-primary hover:bg-accent">
              <Link href="/cart">
                <ShoppingCart className="h-[17px] w-[17px]" strokeWidth={1.8} />
                سبد خرید
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
            <Link href="/discounts" className="flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-[#b23b3b]">
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
