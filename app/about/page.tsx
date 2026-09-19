import Link from "next/link";
import { HeartHandshake, ShieldCheck, Truck } from "lucide-react";

const STATS = [
  { value: "+۵۰,۰۰۰", label: "مشتری راضی" },
  { value: "+۲,۰۰۰", label: "محصول متنوع" },
  { value: "۳۱", label: "استان تحت پوشش" },
  { value: "۶ سال", label: "تجربه فعالیت" },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b bg-[#fffdf9]">
        <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-6 py-4">
          <Link href="/" className="text-[22px] font-extrabold text-primary">Pet24</Link>
          <div className="flex-1" />
          <nav className="flex items-center gap-6">
            <Link href="/about" className="text-sm font-semibold text-primary">درباره ما</Link>
            <Link href="/blog" className="text-sm font-semibold text-muted-foreground hover:text-primary">بلاگ</Link>
            <Link href="/" className="text-sm font-semibold text-muted-foreground hover:text-primary">فروشگاه</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1080px] flex-1 px-6 py-12 pb-16">
        <div className="mb-12 grid items-center gap-10 md:grid-cols-2">
          <div>
            <span className="mb-4.5 inline-block rounded-full bg-primary px-3.5 py-1.5 text-[13px] font-bold text-primary-foreground">درباره Pet24</span>
            <h1 className="mb-5 text-[26px] font-extrabold leading-relaxed text-primary sm:text-[30px]">همراه شما و حیوان خانگی‌تان، از سال ۱۴۰۰</h1>
            <p className="mb-5 text-[15px] leading-loose text-muted-foreground">
              Pet24 با هدف ساده‌تر کردن نگهداری از حیوانات خانگی راه‌اندازی شد. ما مجموعه‌ای کامل از غذا، اسباب‌بازی، اکسسوری، دارو و لوازم بهداشتی را برای سگ، گربه، خرگوش، پرندگان، آبزیان و جوندگان کوچک گردآوری کرده‌ایم تا صاحبان حیوانات خانگی در سراسر ایران به‌راحتی و با اطمینان خرید کنند.
            </p>
            <p className="text-[15px] leading-loose text-muted-foreground">
              تمام محصولات ما پیش از عرضه از نظر کیفیت و اصالت بررسی می‌شوند و تیم پشتیبانی ما همه‌روزه پاسخگوی سوالات شما درباره نگهداری و تغذیه حیوان خانگی‌تان است.
            </p>
          </div>
          <div className="flex aspect-[4/3] w-full items-center justify-center rounded-[20px] border border-primary/30 bg-[repeating-linear-gradient(135deg,#2f7d4f22,#2f7d4f22_14px,#2f7d4f3a_14px,#2f7d4f3a_28px)] text-sm text-primary">
            تصویر تیم یا فروشگاه Pet24
          </div>
        </div>

        <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-2xl border bg-card p-5.5 text-center">
              <div className="text-2xl font-extrabold text-primary">{s.value}</div>
              <div className="mt-1.5 text-[13px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        <h2 className="mb-5 text-xl font-extrabold text-primary">ارزش‌های ما</h2>
        <div className="mb-12 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
          {[
            { Icon: HeartHandshake, title: "دلسوزی واقعی", desc: "تیم ما شامل علاقه‌مندان و کارشناسان حیوانات خانگی است که نگهداری سالم را در اولویت قرار می‌دهند." },
            { Icon: ShieldCheck, title: "اصالت کالا", desc: "تمام محصولات از تامین‌کنندگان معتبر تهیه می‌شوند و با ضمانت اصالت به دست شما می‌رسند." },
            { Icon: Truck, title: "ارسال سریع و مطمئن", desc: "با شبکه گسترده ارسال، سفارش شما در سریع‌ترین زمان ممکن به سراسر ایران می‌رسد." },
          ].map(({ Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border bg-card p-6">
              <Icon className="mb-3 h-7 w-7 text-primary" strokeWidth={1.6} />
              <div className="mb-2 text-[15px] font-extrabold text-primary">{title}</div>
              <div className="text-[13px] leading-loose text-muted-foreground">{desc}</div>
            </div>
          ))}
        </div>

        <div className="rounded-[20px] bg-[#1f1c17] p-9 text-center">
          <div className="mb-4 text-base font-bold text-white">هر سوالی درباره حیوان خانگی‌تان دارید، در کنارتان هستیم.</div>
          <Link href="/" className="inline-block rounded-[10px] bg-white px-7 py-3 text-sm font-bold text-primary">مشاهده فروشگاه</Link>
        </div>
      </main>

      <footer className="bg-[#1f1c17] px-6 py-8 text-center text-xs text-[#c9c3b2]">© ۱۴۰۵ Pet24 — تمامی حقوق محفوظ است.</footer>
    </div>
  );
}
