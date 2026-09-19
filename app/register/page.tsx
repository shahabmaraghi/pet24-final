"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  name: z.string().min(2, "نام باید حداقل ۲ حرف باشد"),
  email: z.string().email("ایمیل معتبر نیست"),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = React.useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError("");
    const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (!res.ok) {
      const body = await res.json();
      setServerError(body.error?.formErrors?.[0] || body.error || "خطا در ثبت‌نام.");
      return;
    }
    const login = await signIn("credentials", { email: data.email, password: data.password, redirect: false });
    if (!login?.error) router.push("/account");
  };

  return (
    <div style={{ maxWidth: 400, margin: "60px auto", padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1f4d38", marginBottom: 24 }}>ساخت حساب کاربری</h1>

      <Button type="button" onClick={() => signIn("google", { callbackUrl: "/account" })} style={{ width: "100%", marginBottom: 16 }} variant="outline">
        ثبت‌نام با حساب گوگل
      </Button>

      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0", color: "#9a9480", fontSize: 13 }}>
        <div style={{ flex: 1, height: 1, background: "#eee6d6" }} />
        یا
        <div style={{ flex: 1, height: 1, background: "#eee6d6" }} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <Label>نام</Label>
          <Input {...register("name")} placeholder="نام شما" />
          {errors.name && <span style={{ color: "#c0392b", fontSize: 12 }}>{errors.name.message}</span>}
        </div>
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
        <Button type="submit" disabled={isSubmitting}>ثبت‌نام</Button>
      </form>

      <p style={{ marginTop: 20, fontSize: 13, color: "#55503f" }}>
        قبلاً ثبت‌نام کرده‌اید؟ <Link href="/login" style={{ color: "#1f4d38", fontWeight: 700 }}>ورود</Link>
      </p>
    </div>
  );
}
