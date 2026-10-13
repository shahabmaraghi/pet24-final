import Link from "next/link";
import { Truck, ShieldCheck, BadgeCheck, Calendar, User as UserIcon, ChevronLeft } from "lucide-react";
import { HeroSlider } from "@/components/hero-slider";
import { FeaturedProductsCarousel } from "@/components/featured-products-carousel";
import { CategoryIcon } from "@/components/category-icon";
import { getStoreCategories } from "@/lib/get-store-categories";
import { getStoreProducts } from "@/lib/get-store-products";
import { getStoreBlogPosts } from "@/lib/get-store-blog";
import { getStoreSlides } from "@/lib/get-store-slides";
import { getStoreFaqs } from "@/lib/get-store-faq";
import { HomeFaq } from "@/components/home-faq";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featured, discounted, blogPosts, slides, faqs] = await Promise.all([
    getStoreCategories().catch(() => []),
    getStoreProducts({ featured: true }).catch(() => []),
    getStoreProducts({ discounted: true }).catch(() => []),
    getStoreBlogPosts(8).catch(() => []),
    getStoreSlides().catch(() => []),
    getStoreFaqs().catch(() => []),
  ]);
  const [main, ...rest] = blogPosts;
  const side = [...rest.filter((post) => post.coverImage), ...rest.filter((post) => !post.coverImage)].slice(0, 2);

  return (
    <>
      <HeroSlider initialSlides={slides} />

      <div className="mx-auto w-full max-w-[1280px] px-6 pt-10">
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
        <FeaturedProductsCarousel products={featured} emptyMessage="محصول پرفروشی برای نمایش وجود ندارد." />
      </section>

      <section className="mb-12">
        <h2 className="mb-5 text-[22px] font-extrabold text-primary">تخفیف‌ها</h2>
        <FeaturedProductsCarousel products={discounted} emptyMessage="در حال حاضر محصول تخفیف‌داری وجود ندارد." />
      </section>

      {main && (
      <section className="relative mb-12 min-h-[340px] overflow-hidden rounded-3xl sm:min-h-[420px]">
        {main.coverImage ? (
          <img src={main.coverImage} alt={main.title} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,#3f6f52_0px,#3f6f52_40px,#375f47_40px,#375f47_80px)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/60 to-black/90" />
        <div className="relative grid gap-6 p-6 sm:p-9 md:grid-cols-[1.3fr_1fr]">
          <div className="self-end">
            <span className="mb-3.5 inline-block rounded-full border border-white/30 bg-white/15 px-5 py-2 text-sm font-bold text-white">مجله Pet24</span>
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
              <Link
                key={p.id}
                href={`/blog/${p.id}`}
                className="flex overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm"
              >
                {p.coverImage ? (
                  <img src={p.coverImage} alt={p.title} className="h-[88px] w-[110px] shrink-0 object-cover" />
                ) : (
                  <div className="h-[88px] w-[110px] shrink-0 bg-white/10" />
                )}
                <div className="min-w-0 p-3.5">
                  <div className="mb-1 text-[11px] font-bold text-[#a8e6bb]">{p.category}</div>
                  <div className="line-clamp-2 text-[13px] font-bold leading-relaxed text-white">{p.title}</div>
                </div>
              </Link>
            ))}
            <Link href="/blog" className="flex items-center justify-center gap-1.5 rounded-2xl bg-white px-4 py-3.5 text-[13px] font-bold text-primary">
              مشاهده همه مطالب
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      )}

      <HomeFaq items={faqs} />

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
      </div>
    </>
  );
}
