"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SuccessPage() {
  const params = useSearchParams();
  const orderNumber = params.get("order") || "PT000000";

  return (
    <div className="mx-auto my-10 max-w-[520px] text-center">
      <div className="mx-auto mb-6 flex h-[76px] w-[76px] items-center justify-center rounded-full shadow-lg" style={{ background: "linear-gradient(160deg,#2f7d4f,#1f4d38)" }}>
        <Check className="h-9 w-9 text-white" strokeWidth={3} />
      </div>
      <h1 className="mb-3 text-2xl font-extrabold text-primary">سفارش شما ثبت شد</h1>
      <p className="mb-2 text-[15px] text-muted-foreground">شماره سفارش: <strong className="text-foreground">{orderNumber}</strong></p>
      <p className="mb-8 text-sm text-muted-foreground">سفارش شما پس از تایید پرداخت آماده‌سازی و ارسال می‌شود. جزئیات از طریق پیامک اطلاع‌رسانی خواهد شد.</p>
      <Button asChild className="px-8 py-6 text-[15px] font-bold"><Link href="/">بازگشت به فروشگاه</Link></Button>
    </div>
  );
}
