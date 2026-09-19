"use client";
import * as React from "react";
import Link from "next/link";
import { Calendar, User as UserIcon, ChevronRight, ChevronLeft } from "lucide-react";
import { BLOG_TINTS } from "@/lib/data";
import type { StoreBlogPost } from "@/lib/store-blog";

const PER_PAGE = 6;

function tintStyle(id: string) {
  const seed = id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const tint = BLOG_TINTS[seed % BLOG_TINTS.length];
  return { backgroundImage: `repeating-linear-gradient(135deg,${tint}22,${tint}22 10px,${tint}3a 10px,${tint}3a 20px)` };
}

export function BlogMagazine({ posts, loadError }: { posts: StoreBlogPost[]; loadError?: boolean }) {
  const [page, setPage] = React.useState(1);
  const [category, setCategory] = React.useState("همه");

  const categories = ["همه", ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean)))];
  const filtered = category === "همه" ? posts : posts.filter((p) => p.category === category);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const start = (page - 1) * PER_PAGE;
  let pagePosts = filtered.slice(start, start + PER_PAGE);
  let featured = null as StoreBlogPost | null;
  if (page === 1 && pagePosts.length > 0) {
    featured = pagePosts[0];
    pagePosts = pagePosts.slice(1);
  }

  const goPage = (p: number) => { setPage(p); window.scrollTo(0, 0); };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background">
      <header className="border-b bg-[#fffdf9]">
        <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-6 py-4">
          <Link href="/" className="text-[22px] font-extrabold text-primary">Pet24</Link>
          <div className="flex-1" />
          <nav className="flex items-center gap-6">
            <Link href="/about" className="text-sm font-semibold text-muted-foreground hover:text-primary">درباره ما</Link>
            <Link href="/" className="text-sm font-semibold text-muted-foreground hover:text-primary">فروشگاه</Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden px-6 py-14 sm:py-16" style={{ background: "linear-gradient(160deg,#1f4d38,#12271c)" }}>
        <div className="relative mx-auto max-w-[1280px] text-center">
          <span className="mb-4 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold text-[#a8e6bb]">مجله Pet24</span>
          <h1 className="mb-3 text-[28px] font-extrabold text-white sm:text-[34px]">راهنما و نکات نگهداری حیوانات خانگی</h1>
          <p className="mx-auto max-w-[560px] text-[15px] text-[#c9c3b2]">مطالب آموزشی از تیم دامپزشکی و کارشناسان Pet24 برای مراقبت بهتر از دوست کوچولوی شما</p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-6 pb-16">
        <div className="relative z-10 -mt-6 mb-9 flex flex-wrap gap-2.5">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => { setCategory(c); setPage(1); }}
              className={`rounded-full border px-4.5 py-2 text-[13px] font-semibold ${category === c ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}
            >
              {c}
            </button>
          ))}
        </div>

        {loadError && (
          <div className="mb-11 rounded-2xl border bg-card py-16 text-center text-sm text-destructive">
            بارگذاری مطالب انجام نشد. صفحه را دوباره باز کنید.
          </div>
        )}

        {!loadError && posts.length === 0 && (
          <div className="mb-11 rounded-2xl border bg-card py-16 text-center text-sm text-muted-foreground">
            هنوز مطلبی در مجله منتشر نشده است.
          </div>
        )}

        {featured && (
          <Link href={`/blog/${featured.id}`} className="mb-9 grid overflow-hidden rounded-[20px] border bg-card shadow-sm md:grid-cols-[1.1fr_1fr]">
            {featured.coverImage ? (
              <img src={featured.coverImage} alt={featured.title} className="min-h-[220px] w-full object-cover" />
            ) : (
              <div className="min-h-[220px]" style={tintStyle(featured.id)} />
            )}
            <div className="flex flex-col justify-center gap-3 p-8">
              <span className="w-fit rounded-full bg-accent px-3.5 py-1 text-xs font-bold text-primary">{featured.category}</span>
              <div className="text-xl font-extrabold leading-relaxed">{featured.title}</div>
              <div className="text-sm leading-loose text-muted-foreground">{featured.excerpt}</div>
              <div className="mt-2 flex items-center gap-3.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{featured.date}</span>
                <span className="flex items-center gap-1.5"><UserIcon className="h-3.5 w-3.5" />{featured.author}</span>
              </div>
            </div>
          </Link>
        )}

        <div className="mb-11 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pagePosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.id}`} className="flex flex-col overflow-hidden rounded-[18px] border bg-card transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="relative">
                {post.coverImage ? (
                  <img src={post.coverImage} alt={post.title} className="h-[190px] w-full object-cover" />
                ) : (
                  <div className="h-[190px]" style={tintStyle(post.id)} />
                )}
                <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-primary">{post.category}</span>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4.5">
                <div className="text-[15px] font-bold leading-relaxed">{post.title}</div>
                <div className="flex-1 text-[13px] leading-relaxed text-muted-foreground">{post.excerpt}</div>
                <div className="flex items-center gap-3.5 border-t pt-2.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{post.date}</span>
                  <span className="flex items-center gap-1.5"><UserIcon className="h-3.5 w-3.5" />{post.author}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length > 0 && (
          <div className="flex items-center justify-center gap-2">
            <button type="button" disabled={page === 1} onClick={() => goPage(page - 1)} className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border bg-card text-muted-foreground disabled:opacity-40">
              <ChevronRight className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <span
                key={n}
                onClick={() => goPage(n)}
                className={`flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-[10px] border text-sm font-bold ${n === page ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}
              >
                {n.toLocaleString("fa-IR")}
              </span>
            ))}
            <button type="button" disabled={page === totalPages} onClick={() => goPage(page + 1)} className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border bg-card text-muted-foreground disabled:opacity-40">
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        )}
      </main>

      <footer className="mt-auto bg-[#1f1c17] px-6 py-8 text-center text-xs text-[#c9c3b2]">© ۱۴۰۵ Pet24 — تمامی حقوق محفوظ است.</footer>
    </div>
  );
}
