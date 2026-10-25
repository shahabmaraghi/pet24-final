"use client";

import * as React from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PawLogo } from "@/components/paw-logo";
import { IRAN_PROVINCES, citiesForProvince } from "@/lib/iran-locations";

const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

export default function VetRegisterPage() {
  const [form, setForm] = React.useState({
    name: "",
    specialty: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    province: "",
    city: "",
    address: "",
    bio: "",
  });
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [key]: value, ...(key === "province" ? { city: "" } : {}) }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("رمز عبور و تکرار آن یکسان نیستند.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/register/vet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "ثبت‌نام انجام نشد.");
      const login = await signIn("credentials", { email: form.email.trim(), password: form.password, redirect: false });
      if (!login || login.error) {
        window.location.assign("/login?next=/vet");
        return;
      }
      window.location.assign("/vet");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ثبت‌نام انجام نشد.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4faf7] px-4 py-10">
      <div className="mx-auto w-full max-w-2xl rounded-[28px] border bg-card p-6 sm:p-8">
        <div className="mb-6 text-center">
          <Link href="/" className="mx-auto mb-3 flex w-fit" aria-label="Pet24">
            <PawLogo size={48} />
          </Link>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-bold text-primary">
            <Stethoscope className="h-3.5 w-3.5" />
            ثبت‌نام دامپزشک
          </div>
          <h1 className="text-2xl font-extrabold text-primary">ساخت پنل اختصاصی کلینیک</h1>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            این فرم مخصوص دامپزشک‌هاست و با ثبت‌نام مشتریان جدا است. پس از ثبت، مدیر سایت کلینیک را تأیید می‌کند تا در فهرست عمومی دیده شود.
          </p>
        </div>
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <Field label="نام کلینیک یا دامپزشک" className="sm:col-span-2">
            <Input value={form.name} onChange={set("name")} />
          </Field>
          <Field label="تخصص">
            <Input value={form.specialty} onChange={set("specialty")} placeholder="مثلاً جراحی حیوانات کوچک" />
          </Field>
          <Field label="تلفن کلینیک">
            <Input value={form.phone} onChange={set("phone")} placeholder="02100000000" />
          </Field>
          <Field label="ایمیل ورود به پنل">
            <Input type="email" value={form.email} onChange={set("email")} autoComplete="email" />
          </Field>
          <Field label="رمز عبور">
            <PasswordInput value={form.password} onChange={set("password")} autoComplete="new-password" />
          </Field>
          <Field label="تکرار رمز عبور">
            <PasswordInput value={form.confirmPassword} onChange={set("confirmPassword")} autoComplete="new-password" />
          </Field>
          <Field label="استان">
            <select className={selectClass} value={form.province} onChange={set("province")}>
              <option value="">انتخاب استان</option>
              {IRAN_PROVINCES.map((item) => (
                <option key={item.name} value={item.name}>{item.name}</option>
              ))}
            </select>
          </Field>
          <Field label="شهر">
            <select className={selectClass} value={form.city} disabled={!form.province} onChange={set("city")}>
              <option value="">انتخاب شهر</option>
              {citiesForProvince(form.province).map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </Field>
          <Field label="آدرس" className="sm:col-span-2">
            <Textarea value={form.address} onChange={set("address")} />
          </Field>
          <Field label="معرفی کوتاه" className="sm:col-span-2">
            <Textarea value={form.bio} onChange={set("bio")} />
          </Field>
          {error ? <p className="text-sm text-destructive sm:col-span-2">{error}</p> : null}
          <Button type="submit" disabled={busy} className="font-bold sm:col-span-2">
            {busy ? "در حال ساخت پنل..." : "ثبت‌نام و ورود به پنل دامپزشک"}
          </Button>
        </form>
        <p className="mt-4 text-center text-[13px] text-muted-foreground">
          قبلاً پنل ساخته‌اید؟ <Link href="/login?next=/vet" className="font-bold text-primary">ورود دامپزشک</Link>
        </p>
        <p className="mt-2 text-center text-[13px] text-muted-foreground">
          مشتری هستید؟ <Link href="/register" className="font-bold text-primary">ثبت‌نام مشتریان</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm ${className}`}>
      <Label>{label}</Label>
      {children}
    </label>
  );
}
