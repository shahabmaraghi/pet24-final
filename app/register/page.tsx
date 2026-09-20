"use client";
import * as React from "react";
import { getSession, signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/auth-card";

const schema = z
  .object({
    name: z.string().trim().min(2, "نام باید حداقل ۲ حرف باشد"),
    email: z.string().trim().email("ایمیل معتبر نیست"),
    phone: z
      .string()
      .trim()
      .optional()
      .refine((value) => !value || /^09\d{9}$/.test(value), "شماره موبایل معتبر نیست"),
    password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
    confirmPassword: z.string().min(6, "تکرار رمز عبور را وارد کنید"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "رمز عبور و تکرار آن یکسان نیستند",
    path: ["confirmPassword"],
  });
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const [serverError, setServerError] = React.useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: FormData) => {
    setServerError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerError(typeof body.error === "string" ? body.error : "ثبت‌نام انجام نشد.");
        return;
      }
      const login = await signIn("credentials", {
        email: data.email.trim(),
        password: data.password,
        redirect: false,
      });
      if (!login || login.error) {
        setServerError("حساب ساخته شد، اما ورود خودکار انجام نشد. از صفحه ورود وارد شوید.");
        return;
      }
      const session = await getSession();
      window.location.assign(session?.user?.role === "admin" ? "/admin" : "/account");
    } catch {
      setServerError("ثبت‌نام انجام نشد. دوباره تلاش کنید.");
    }
  };

  return (
    <AuthCard title="ساخت حساب کاربری" subtitle="برای خرید و پیگیری سفارش‌ها در Pet24 ثبت‌نام کنید">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>نام و نام خانوادگی</Label>
          <Input {...register("name")} placeholder="نام شما" autoComplete="name" />
          {errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>ایمیل</Label>
          <Input type="email" {...register("email")} placeholder="you@example.com" autoComplete="email" />
          {errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>شماره موبایل <span className="font-normal text-muted-foreground">(اختیاری)</span></Label>
          <Input {...register("phone")} placeholder="0912xxxxxxx" inputMode="numeric" autoComplete="tel" />
          {errors.phone && <span className="text-xs text-destructive">{errors.phone.message}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>رمز عبور</Label>
          <PasswordInput {...register("password")} placeholder="حداقل ۶ کاراکتر" autoComplete="new-password" />
          {errors.password && <span className="text-xs text-destructive">{errors.password.message}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>تکرار رمز عبور</Label>
          <PasswordInput {...register("confirmPassword")} placeholder="تکرار رمز عبور" autoComplete="new-password" />
          {errors.confirmPassword && <span className="text-xs text-destructive">{errors.confirmPassword.message}</span>}
        </div>
        {serverError && <span className="text-[13px] text-destructive">{serverError}</span>}
        <Button type="submit" disabled={isSubmitting} className="py-6 font-bold">
          {isSubmitting ? "در حال ثبت‌نام..." : "ثبت‌نام"}
        </Button>
      </form>
      <p className="mt-4.5 text-center text-[13px] text-muted-foreground">
        قبلاً ثبت‌نام کرده‌اید؟{" "}
        <Link href="/login" className="font-bold text-primary">ورود</Link>
      </p>
      <Link href="/" className="mt-3 block text-center text-[13px] text-muted-foreground">بازگشت به فروشگاه</Link>
    </AuthCard>
  );
}
