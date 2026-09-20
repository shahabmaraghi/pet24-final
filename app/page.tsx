import Link from "next/link";
import { ImageIcon, Truck, ShieldCheck, BadgeCheck, Calendar, User as UserIcon } from "lucide-react";
import { HeroSlider } from "@/components/hero-slider";
import { ProductCard } from "@/components/product-card";
import { CategoryIcon } from "@/components/category-icon";
import { getStoreCategories } from "@/lib/get-store-categories";
import { getStoreProducts } from "@/lib/get-store-products";
import { getStoreBlogPosts } from "@/lib/get-store-blog";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featured, blogPosts] = await Promise.all([
    getStoreCategories().catch(() => []),
    getStoreProducts({ featured: true }).catch(() => []),
    getStoreBlogPosts(3).catch(() => []),
  ]);
  const [main, ...side] = blogPosts;

  return (
    <>
      <HeroSlider />

      <section className="mb-12 grid items-center gap-8 rounded-3xl bg-gradient-to-br from-[#f0ece1] to-[#e9f1ea] p-8 shadow-sm sm:p-12 md:grid-cols-[1.1fr_0.9fr]">
        <div className="text-center md:text-right">
          <span className="mb-4 inline-block rounded-full bg-primary px-3.5 py-1.5 text-[13px] font-bold text-primary-foreground">
            فروشگاه کامل لوازم حیوانات خانگی
          </span>
          <h1 className="mb-4 text-[26px] font-extrabold leading-relaxed text-primary sm:text-4xl">
            هر چیزی که دوست کوچولوی شما نیاز دارد
          </h1>
          <p className="mb-7 text-[15px] leading-loose text-muted-foreground sm:text-base">
            از غذا و اسباب‌بازی گرفته تا دارو، قفس و حتی خرید حیوان خانگی؛ Pet24 با ضمانت اصالت کالا و ارسال سریع در کنار شماست.
          </p>
          <Link href="/category/dog" className="inline-block rounded-2xl bg-primary px-8 py-3.5 text-[15px] font-bold text-primary-foreground shadow-lg hover:bg-primary/90">
            مشاهده محصولات
          </Link>
        </div>
        <div className="flex h-[280px] flex-col items-center justify-center rounded-[20px] border border-dashed bg-muted text-muted-foreground">
          <ImageIcon className="h-14 w-14" strokeWidth={1.4} />
          <span className="mt-2.5 text-[13px]">تصویر بنر اصلی</span>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-5 text-[22px] font-extrabold text-primary">دسته‌بندی‌ها</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.id}`}
              className="rounded-[18px] border bg-card px-3 py-6 text-center transition-transform hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mx-auto mb-3 flex h-[52px] w-[52px] items-center justify-center rounded-2xl" style={{ background: cat.tint }}>
                <CategoryIcon id={cat.id} size={24} />
              </div>
              <div className="text-sm font-bold">{cat.name}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-5 text-[22px] font-extrabold text-primary">پرفروش‌ترین محصولات</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {main && (
      <section className="relative mb-12 min-h-[340px] overflow-hidden rounded-3xl sm:min-h-[420px]">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,#3f6f52_0px,#3f6f52_40px,#375f47_40px,#375f47_80px)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/55 to-black/90" />
        <div className="relative grid gap-6 p-6 sm:p-9 md:grid-cols-[1.3fr_1fr]">
          <div className="self-end">
            <span className="mb-3.5 inline-block rounded-full border border-white/25 bg-white/15 px-3.5 py-1 text-xs font-bold text-white">مجله Pet24</span>
            <Link href={`/blog/${main.id}`} className="block">
              <div className="mb-2 text-xs font-bold text-[#a8e6bb]">{main.category}</div>
              <h2 className="mb-2.5 text-xl font-extrabold leading-relaxed text-white sm:text-[26px]">{main.title}</h2>
              <p className="mb-2.5 hidden max-w-[520px] text-sm leading-loose text-[#e4e1d6] sm:block">{main.excerpt}</p>
              <div className="flex items-center gap-3.5 text-xs text-[#c9c3b2]">
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{main.date}</span>
                <span className="flex items-center gap-1.5"><UserIcon className="h-3.5 w-3.5" />{main.author}</span>
              </div>
            </Link>
          </div>
          <div className="flex flex-col gap-3 self-end">
            {side.map((p) => (
              <Link key={p.id} href={`/blog/${p.id}`} className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                <div className="mb-1 text-[11px] font-bold text-[#a8e6bb]">{p.category}</div>
                <div className="text-[13px] font-bold leading-relaxed text-white">{p.title}</div>
              </Link>
            ))}
            <Link href="/blog" className="rounded-2xl bg-white px-4 py-3.5 text-center text-[13px] font-bold text-primary">
              مشاهده همه مطالب ‹
            </Link>
          </div>
        </div>
      </section>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { Icon: Truck, title: "ارسال سریع", desc: "تحویل به سراسر کشور طی ۱ تا ۳ روز کاری" },
          { Icon: ShieldCheck, title: "پرداخت امن", desc: "پرداخت آنلاین از طریق درگاه معتبر بانکی" },
          { Icon: BadgeCheck, title: "ضمانت اصالت", desc: "تضمین اصالت کالا و امکان بازگشت وجه" },
        ].map(({ Icon, title, desc }) => (
          <div key={title} className="rounded-2xl border bg-card p-6 text-center">
            <Icon className="mx-auto mb-2.5 h-[30px] w-[30px] text-primary" strokeWidth={1.6} />
            <div className="mb-1.5 text-[15px] font-extrabold text-primary">{title}</div>
            <div className="text-[13px] text-muted-foreground">{desc}</div>
          </div>
        ))}
      </section>
    </>
  );
}
