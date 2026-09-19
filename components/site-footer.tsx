"use client";
import Link from "next/link";
import { Info, BookOpen, UserRound, ShieldCheck, Tag, ArrowUp, Instagram, Linkedin, Send, Twitter } from "lucide-react";
import { PawLogo } from "@/components/paw-logo";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-[#1f1c17] px-6 pt-11 text-[#c9c3b2]">
      <div className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-9">
        <div className="max-w-[300px]">
          <div className="mb-3 flex items-center gap-2.5">
            <PawLogo size={34} />
            <span className="text-lg font-extrabold text-white">Pet24</span>
          </div>
          <div className="text-[13px] leading-relaxed">
            فروشگاه آنلاین لوازم و غذای حیوانات خانگی با ارسال سریع به سراسر ایران.
          </div>
          <div className="mt-4.5 flex gap-2.5">
            {[Twitter, Linkedin, Send, Instagram].map((Icon, i) => (
              <a key={i} href="#" className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[#2b271f] text-[#c9c3b2] hover:bg-[#3a352c] hover:text-white">
                <Icon className="h-[15px] w-[15px]" />
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-9">
          <div className="flex flex-col gap-2.5 text-[13px]">
            <div className="mb-0.5 font-bold text-white">دسترسی سریع</div>
            <Link href="/discounts" className="text-[#c9c3b2] hover:text-white">تخفیف‌ها</Link>
            <Link href="/about" className="text-[#c9c3b2] hover:text-white">درباره ما</Link>
            <Link href="/blog" className="text-[#c9c3b2] hover:text-white">بلاگ</Link>
            <Link href="/account" className="text-[#c9c3b2] hover:text-white">حساب کاربری من</Link>
            <Link href="/admin" className="text-[#c9c3b2] hover:text-white">پنل مدیریت</Link>
          </div>
          <div className="flex flex-col gap-2.5 text-[13px]">
            <div className="mb-0.5 font-bold text-white">پشتیبانی</div>
            <a href="#" className="text-[#c9c3b2] hover:text-white">تماس با ما</a>
            <a href="#" className="text-[#c9c3b2] hover:text-white">حریم خصوصی</a>
            <a href="#" className="text-[#c9c3b2] hover:text-white">قوانین و مقررات</a>
          </div>
        </div>
      </div>

      <div className="relative mx-auto mt-8 max-w-[1280px] border-t border-[#3a352c]">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="absolute right-1/2 top-0 flex h-[34px] w-[34px] -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-[#3a352c] bg-[#1f1c17] text-[#c9c3b2] hover:border-[#4a4536] hover:text-white"
          aria-label="بازگشت به بالا"
        >
          <ArrowUp className="h-[15px] w-[15px]" />
        </button>
      </div>

      <div className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-3.5 py-5.5 text-[12.5px] text-[#8a8471]">
        <div>تهران، خیابان ولیعصر، پلاک ۱۲</div>
        <div>پشتیبانی: ۰۲۱-۹۱۰۰۰۰۰۰ (پاسخگویی همه روزه ۹ تا ۲۱)</div>
        <div>info@pet24.ir</div>
      </div>
      <div className="mx-auto max-w-[1280px] border-t border-[#3a352c] py-4 text-xs text-[#8a8471]">
        © ۱۴۰۵ Pet24 — تمامی حقوق محفوظ است.
      </div>
    </footer>
  );
}
