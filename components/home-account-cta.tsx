import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  MapPin,
  PawPrint,
  ShoppingBag,
  ShieldPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    Icon: PawPrint,
    title: "چند پروفایل جداگانه",
    text: "برای هر سگ، گربه یا Pet دیگر نام، عکس، گونه، نژاد و جنسیت را جدا ثبت کنید.",
  },
  {
    Icon: CalendarDays,
    title: "داشبورد مراقبت",
    text: "با تاریخ تولد و وزن، سن، یادآوری واکسن و برنامه مراقبت شخصی‌سازی می‌شود.",
  },
  {
    Icon: AlertTriangle,
    title: "آلرژی و نیازهای ویژه",
    text: "محدودیت غذایی، آلرژی، میکروچیپ و مخاطب اضطراری همیشه در پروفایل در دسترس است.",
  },
  {
    Icon: ShoppingBag,
    title: "پیشنهاد خرید هوشمند",
    text: "بر اساس نژاد و جثه، غذا و لوازم مناسب همان Pet از فروشگاه پیشنهاد می‌شود.",
  },
  {
    Icon: MapPin,
    title: "شهر و موقعیت",
    text: "استان و شهر Pet را انتخاب کنید تا پروفایل کامل‌تر شود.",
  },
  {
    Icon: ShieldPlus,
    title: "سفارش و علاقه‌مندی",
    text: "سفارش‌ها، آدرس‌ها، علاقه‌مندی‌ها و بازدیدهای اخیر هم در همان حساب ذخیره می‌شود.",
  },
];

export function HomeAccountCta() {
  return (
    <section className="mb-12 overflow-hidden rounded-3xl border bg-card">
      <div className="grid gap-8 p-6 sm:p-9 lg:grid-cols-[0.95fr_1.15fr]">
        <div className="flex flex-col justify-center">
          <span className="mb-3 inline-flex w-fit items-center gap-2 rounded-full bg-accent px-3.5 py-1.5 text-xs font-bold text-primary">
            <PawPrint className="h-3.5 w-3.5" />
            حساب کاربری رایگان
          </span>
          <h2 className="mb-3 text-[22px] font-extrabold leading-relaxed text-primary sm:text-[26px]">
            پروفایل Pet بسازید و مراقبت را هوشمند کنید
          </h2>
          <p className="mb-6 max-w-[520px] text-sm leading-8 text-muted-foreground">
            با ساخت حساب در Pet24 برای هر Pet یک پروفایل کامل دارید: عکس، گونه،
            نژاد، شهر، وزن، آلرژی و مخاطب اضطراری. داشبورد مراقبت یادآوری‌ها را
            نشان می‌دهد و فروشگاه غذا و لوازم مناسب همان نژاد را پیشنهاد می‌کند.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild className="h-11 px-6 font-bold">
              <Link href="/register">ساخت حساب و پروفایل</Link>
            </Button>
            <Link
              href="/login"
              className="text-[13px] font-semibold text-muted-foreground hover:text-primary"
            >
              قبلاً حساب دارید؟ ورود
            </Link>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {FEATURES.map(({ Icon, title, text }) => (
            <div key={title} className="rounded-2xl border bg-background p-4">
              <Icon className="mb-2.5 h-5 w-5 text-primary" strokeWidth={1.8} />
              <div className="mb-1 text-[14px] font-extrabold text-primary">
                {title}
              </div>
              <div className="text-[12.5px] leading-6 text-muted-foreground">
                {text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
