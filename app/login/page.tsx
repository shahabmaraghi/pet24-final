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

const schema = z.object({
  email: z.string().email("ایمیل معتبر نیست"),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [serverError, setServerError] = React.useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "admin@pet24.ir", password: "" },
  });

  const onSubmit = async (data: FormData) => {
    setServerError("");
    try {
      const res = await signIn("credentials", { email: data.email.trim(), password: data.password, redirect: false });
      if (!res) {
        setServerError("ورود انجام نشد. دوباره تلاش کنید.");
        return;
      }
      if (res.error) {
        setServerError("ایمیل یا رمز عبور اشتباه است.");
        return;
      }
      const session = await getSession();
      const adminEmail = data.email.trim().toLowerCase();
      const nextUrl = session?.user?.role === "admin" || adminEmail === "admin@pet24.ir" ? "/admin" : "/account";
      window.location.assign(nextUrl);
    } catch {
      setServerError("ورود انجام نشد. دوباره تلاش کنید.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "60px auto", padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1f4d38", marginBottom: 24 }}>ورود به حساب کاربری</h1>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <Label>ایمیل</Label>
          <Input type="email" {...register("email")} placeholder="you@example.com" />
          {errors.email && <span style={{ color: "#c0392b", fontSize: 12 }}>{errors.email.message}</span>}
        </div>
        <div>
          <Label>رمز عبور</Label>
          <PasswordInput {...register("password")} placeholder="••••••••" />
          {errors.password && <span style={{ color: "#c0392b", fontSize: 12 }}>{errors.password.message}</span>}
        </div>
        {serverError && <span style={{ color: "#c0392b", fontSize: 13 }}>{serverError}</span>}
        <Button type="submit" disabled={isSubmitting}>ورود</Button>
      </form>

      <p style={{ marginTop: 20, fontSize: 13, color: "#55503f" }}>
        حساب کاربری ندارید؟ <Link href="/register" style={{ color: "#1f4d38", fontWeight: 700 }}>ثبت‌نام کنید</Link>
      </p>
    </div>
  );
}
