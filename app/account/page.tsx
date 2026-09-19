"use client";
import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, MapPin, ClipboardList, CreditCard, Heart, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PawLogo } from "@/components/paw-logo";
import { fmt } from "@/lib/data";

const loginSchema = z.object({
  phone: z.string().regex(/^09\d{9}$/, "شماره موبایل معتبر نیست"),
  password: z.string().min(4, "رمز عبور باید حداقل ۴ کاراکتر باشد"),
});
type LoginForm = z.infer<typeof loginSchema>;

const profileSchema = z.object({
  name: z.string().min(3, "نام را کامل وارد کنید"),
  phone: z.string().regex(/^09\d{9}$/, "شماره موبایل معتبر نیست"),
});
type ProfileForm = z.infer<typeof profileSchema>;

const addressSchema = z.object({
  title: z.string().min(2, "عنوان آدرس را وارد کنید"),
  receiver: z.string().min(3, "نام گیرنده را وارد کنید"),
  phone: z.string().regex(/^09\d{9}$/, "شماره تماس معتبر نیست"),
  city: z.string().min(2, "شهر را وارد کنید"),
  address: z.string().min(10, "آدرس کامل را وارد کنید"),
});
type AddressForm = z.infer<typeof addressSchema>;

const TABS = [
  { id: "profile", label: "پروفایل", Icon: User },
  { id: "addresses", label: "آدرس‌ها", Icon: MapPin },
  { id: "orders", label: "سفارشات", Icon: ClipboardList },
  { id: "payments", label: "پرداخت‌ها", Icon: CreditCard },
  { id: "wishlist", label: "علاقه‌مندی‌ها", Icon: Heart },
] as const;
type TabId = (typeof TABS)[number]["id"];

const INIT_ADDRESSES = [{ id: 1, title: "خانه", receiver: "سارا محمدی", phone: "۰۹۱۲۱۱۱۱۱۱۱", city: "تهران", address: "خیابان ولیعصر، پلاک ۱۲" }];
const INIT_ORDERS = [
  { id: "PT10234", date: "۱۴۰۵/۰۵/۰۱", itemsCount: 3, total: 1240000, status: "در انتظار پرداخت" },
  { id: "PT10201", date: "۱۴۰۵/۰۴/۱۲", itemsCount: 1, total: 275000, status: "تحویل شده" },
  { id: "PT10188", date: "۱۴۰۵/۰۳/۲۸", itemsCount: 2, total: 960000, status: "ارسال شده" },
];
const INIT_PAYMENTS = [
  { id: 1, date: "۱۴۰۵/۰۴/۱۲", amount: 275000, method: "درگاه بانکی", status: "موفق" },
  { id: 2, date: "۱۴۰۵/۰۳/۲۸", amount: 960000, method: "درگاه بانکی", status: "موفق" },
];
const INIT_WISHLIST = [
  { id: 1, name: "درخت خراش دو طبقه گربه", categoryName: "گربه", price: 980000 },
  { id: 2, name: "کیف حمل حیوان خانگی", categoryName: "اکسسوری و لوازم", price: 560000 },
];

function statusColor(status: string) {
  if (status === "تحویل شده") return "text-primary";
  if (status === "ارسال شده") return "text-[#2f5ea8]";
  if (status === "در انتظار پرداخت") return "text-[#c17d2f]";
  return "text-muted-foreground";
}

export default function AccountPage() {
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [tab, setTab] = React.useState<TabId>("profile");
  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema), defaultValues: { phone: "", password: "" } });

  const [profile, setProfile] = React.useState({ name: "سارا محمدی", phone: "09121111111" });
  const [profileSaved, setProfileSaved] = React.useState(false);
  const profileForm = useForm<ProfileForm>({ resolver: zodResolver(profileSchema), defaultValues: profile });

  const [addresses, setAddresses] = React.useState(INIT_ADDRESSES);
  const [editingAddressId, setEditingAddressId] = React.useState<number | null | undefined>(undefined);
  const addressForm = useForm<AddressForm>({ resolver: zodResolver(addressSchema), defaultValues: { title: "", receiver: "", phone: "", city: "", address: "" } });
  const [wishlist, setWishlist] = React.useState(INIT_WISHLIST);

  if (!loggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-[360px] rounded-[18px] border bg-card p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 w-fit"><PawLogo size={48} /></div>
            <div className="text-lg font-extrabold text-primary">ورود به حساب کاربری</div>
            <div className="mt-1.5 text-xs text-muted-foreground">فرم ورود نمایشی — بدون اعتبارسنجی واقعی</div>
          </div>
          <form onSubmit={loginForm.handleSubmit(() => setLoggedIn(true))} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>شماره موبایل</Label>
              <Input {...loginForm.register("phone")} placeholder="شماره موبایل" />
              {loginForm.formState.errors.phone && <span className="text-xs text-destructive">{loginForm.formState.errors.phone.message}</span>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>رمز عبور</Label>
              <PasswordInput {...loginForm.register("password")} placeholder="رمز عبور" />
              {loginForm.formState.errors.password && <span className="text-xs text-destructive">{loginForm.formState.errors.password.message}</span>}
            </div>
            <Button type="submit" className="py-6 font-bold">ورود</Button>
          </form>
          <Link href="/" className="mt-4.5 block text-center text-[13px] text-muted-foreground">بازگشت به فروشگاه</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen md:grid-cols-[230px_1fr]">
        <aside className="flex gap-2 overflow-x-auto border-b bg-card p-3.5 md:flex-col md:overflow-visible md:border-b-0 md:border-l md:p-5">
          <div className="hidden items-center gap-2.5 px-1 pb-5 md:flex">
            <PawLogo size={36} /><div className="font-extrabold text-primary">حساب کاربری</div>
          </div>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setEditingAddressId(undefined); setProfileSaved(false); }}
              className={`flex shrink-0 items-center gap-2.5 rounded-[10px] px-3.5 py-2.5 text-sm font-semibold md:px-3.5 md:py-3 ${tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}
            >
              <t.Icon className="h-[17px] w-[17px] shrink-0" strokeWidth={1.8} />
              <span className="hidden md:inline">{t.label}</span>
            </button>
          ))}
          <button onClick={() => setLoggedIn(false)} className="hidden items-center gap-2 rounded-[10px] px-3.5 py-3 text-sm font-semibold text-destructive md:mt-auto md:flex">
            <LogOut className="h-4 w-4" />خروج از حساب
          </button>
        </aside>

        <main className="p-5 md:p-8">
          {tab === "profile" && (
            <>
              <h1 className="mb-5 text-[22px] font-extrabold text-primary">پروفایل</h1>
              <form
                onSubmit={profileForm.handleSubmit((data) => { setProfile(data); setProfileSaved(true); })}
                className="flex max-w-[420px] flex-col gap-3.5 rounded-2xl border bg-card p-6"
              >
                <div className="flex flex-col gap-1.5">
                  <Label>نام و نام خانوادگی</Label>
                  <Input {...profileForm.register("name")} />
                  {profileForm.formState.errors.name && <span className="text-xs text-destructive">{profileForm.formState.errors.name.message}</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>شماره موبایل</Label>
                  <Input {...profileForm.register("phone")} />
                  {profileForm.formState.errors.phone && <span className="text-xs text-destructive">{profileForm.formState.errors.phone.message}</span>}
                </div>
                <Button type="submit" className="py-6 font-bold">ذخیره تغییرات</Button>
                {profileSaved && <div className="text-[13px] text-primary">تغییرات ذخیره شد.</div>}
              </form>
            </>
          )}

          {tab === "addresses" && (
            <>
              <div className="mb-5 flex items-center justify-between">
                <h1 className="text-[22px] font-extrabold text-primary">آدرس‌ها</h1>
                <Button className="font-bold" onClick={() => { setEditingAddressId(null); addressForm.reset({ title: "", receiver: "", phone: "", city: "", address: "" }); }}>افزودن آدرس</Button>
              </div>
              {editingAddressId !== undefined && (
                <form
                  onSubmit={addressForm.handleSubmit((data) => {
                    const rec = { ...data, id: editingAddressId || Date.now() };
                    setAddresses((as) => (as.some((a) => a.id === rec.id) ? as.map((a) => (a.id === rec.id ? rec : a)) : [...as, rec]));
                    setEditingAddressId(undefined);
                  })}
                  className="mb-5 grid gap-3 rounded-2xl border bg-card p-5 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]"
                >
                  <div className="flex flex-col gap-1.5">
                    <Label>عنوان آدرس</Label>
                    <Input {...addressForm.register("title")} placeholder="خانه، محل کار" />
                    {addressForm.formState.errors.title && <span className="text-xs text-destructive">{addressForm.formState.errors.title.message}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>نام گیرنده</Label>
                    <Input {...addressForm.register("receiver")} />
                    {addressForm.formState.errors.receiver && <span className="text-xs text-destructive">{addressForm.formState.errors.receiver.message}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>شماره تماس</Label>
                    <Input {...addressForm.register("phone")} />
                    {addressForm.formState.errors.phone && <span className="text-xs text-destructive">{addressForm.formState.errors.phone.message}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>شهر</Label>
                    <Input {...addressForm.register("city")} />
                    {addressForm.formState.errors.city && <span className="text-xs text-destructive">{addressForm.formState.errors.city.message}</span>}
                  </div>
                  <div className="col-span-full flex flex-col gap-1.5">
                    <Label>آدرس کامل</Label>
                    <Textarea rows={2} {...addressForm.register("address")} />
                    {addressForm.formState.errors.address && <span className="text-xs text-destructive">{addressForm.formState.errors.address.message}</span>}
                  </div>
                  <div className="col-span-full flex gap-2.5">
                    <Button type="submit" className="font-bold">ذخیره</Button>
                    <Button type="button" variant="outline" onClick={() => setEditingAddressId(undefined)}>انصراف</Button>
                  </div>
                </form>
              )}
              <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
                {addresses.map((a) => (
                  <div key={a.id} className="rounded-2xl border bg-card p-4.5">
                    <div className="mb-1.5 text-sm font-bold">{a.title}</div>
                    <div className="text-[13px] leading-loose text-muted-foreground">{a.receiver} — {a.phone}<br />{a.city}، {a.address}</div>
                    <div className="mt-3 flex gap-3.5">
                      <button onClick={() => { setEditingAddressId(a.id); addressForm.reset(a); }} className="text-[13px] font-semibold text-primary">ویرایش</button>
                      <button onClick={() => setAddresses((as) => as.filter((x) => x.id !== a.id))} className="text-[13px] font-semibold text-destructive">حذف</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "orders" && (
            <>
              <h1 className="mb-5 text-[22px] font-extrabold text-primary">سفارشات</h1>
              <div className="overflow-x-auto rounded-2xl border bg-card">
                <table className="w-full min-w-[480px] text-sm">
                  <thead className="bg-muted/50"><tr><th className="p-3 text-right font-semibold text-muted-foreground">شماره</th><th className="p-3 text-right font-semibold text-muted-foreground">تاریخ</th><th className="p-3 text-right font-semibold text-muted-foreground">تعداد کالا</th><th className="p-3 text-right font-semibold text-muted-foreground">مبلغ</th><th className="p-3 text-right font-semibold text-muted-foreground">وضعیت</th></tr></thead>
                  <tbody>
                    {INIT_ORDERS.map((o) => (
                      <tr key={o.id} className="border-t"><td className="p-3">{o.id}</td><td className="p-3">{o.date}</td><td className="p-3">{o.itemsCount}</td><td className="p-3">{fmt(o.total)}</td><td className={`p-3 font-semibold ${statusColor(o.status)}`}>{o.status}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === "payments" && (
            <>
              <h1 className="mb-5 text-[22px] font-extrabold text-primary">پرداخت‌ها</h1>
              <div className="overflow-x-auto rounded-2xl border bg-card">
                <table className="w-full min-w-[480px] text-sm">
                  <thead className="bg-muted/50"><tr><th className="p-3 text-right font-semibold text-muted-foreground">تاریخ</th><th className="p-3 text-right font-semibold text-muted-foreground">مبلغ</th><th className="p-3 text-right font-semibold text-muted-foreground">روش</th><th className="p-3 text-right font-semibold text-muted-foreground">وضعیت</th></tr></thead>
                  <tbody>
                    {INIT_PAYMENTS.map((p) => (
                      <tr key={p.id} className="border-t"><td className="p-3">{p.date}</td><td className="p-3">{fmt(p.amount)}</td><td className="p-3">{p.method}</td><td className="p-3">{p.status}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === "wishlist" && (
            <>
              <h1 className="mb-5 text-[22px] font-extrabold text-primary">علاقه‌مندی‌ها</h1>
              {wishlist.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">لیست علاقه‌مندی‌ها خالی است.</div>
              ) : (
                <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
                  {wishlist.map((w) => (
                    <div key={w.id} className="rounded-2xl border bg-card p-4">
                      <div className="mb-1.5 text-xs font-bold text-primary">{w.categoryName}</div>
                      <div className="mb-2.5 text-sm font-bold">{w.name}</div>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-primary">{fmt(w.price)} تومان</span>
                        <button onClick={() => setWishlist((ws) => ws.filter((x) => x.id !== w.id))} className="text-[13px] text-destructive">حذف</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
