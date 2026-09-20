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

const schema = z.object({
  email: z.string().trim().email("ایمیل معتبر نیست"),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [serverError, setServerError] = React.useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: FormData) => {
    setServerError("");
    try {
      const res = await signIn("credentials", {
        email: data.email.trim(),
        password: data.password,
        redirect: false,
      });
      if (!res) {
        setServerError("ورود انجام نشد. دوباره تلاش کنید.");
        return;
      }
      if (res.error) {
        setServerError("ایمیل یا رمز عبور اشتباه است.");
        return;
      }
      const session = await getSession();
      const nextUrl = session?.user?.role === "admin" ? "/admin" : "/account";
      window.location.assign(nextUrl);
    } catch {
      setServerError("ورود انجام نشد. دوباره تلاش کنید.");
    }
  };

  return (
    <AuthCard title="ورود به حساب کاربری" subtitle="با ایمیل و رمز عبور وارد شوید">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>ایمیل</Label>
          <Input type="email" {...register("email")} placeholder="you@example.com" autoComplete="email" />
          {errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>رمز عبور</Label>
          <PasswordInput {...register("password")} placeholder="رمز عبور" autoComplete="current-password" />
          {errors.password && <span className="text-xs text-destructive">{errors.password.message}</span>}
        </div>
        {serverError && <span className="text-[13px] text-destructive">{serverError}</span>}
        <Button type="submit" disabled={isSubmitting} className="py-6 font-bold">
          {isSubmitting ? "در حال ورود..." : "ورود"}
        </Button>
      </form>
      <p className="mt-4.5 text-center text-[13px] text-muted-foreground">
        حساب کاربری ندارید؟{" "}
        <Link href="/register" className="font-bold text-primary">ثبت‌نام کنید</Link>
      </p>
      <Link href="/" className="mt-3 block text-center text-[13px] text-muted-foreground">بازگشت به فروشگاه</Link>
    </AuthCard>
  );
}
