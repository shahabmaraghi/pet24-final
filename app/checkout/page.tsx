"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Truck, Bike, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { fmt, SHIPPING } from "@/lib/data";
import { useStoreProducts } from "@/lib/use-store-products";

const checkoutSchema = z.object({
  name: z.string().min(3, "نام و نام خانوادگی را کامل وارد کنید"),
  phone: z.string().regex(/^09\d{9}$/, "شماره موبایل معتبر نیست (مثال: 09123456789)"),
  city: z.string().min(2, "شهر را وارد کنید"),
  postal: z.string().min(5, "کد پستی معتبر نیست"),
  address: z.string().min(10, "آدرس کامل را وارد کنید"),
});
type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const [shippingMethod, setShippingMethod] = React.useState(SHIPPING[0].id);

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { name: "", phone: "", city: "", postal: "", address: "" },
  });

  const catalog = useStoreProducts();
  const items = cart
    .map((l) => ({ ...l, product: catalog.find((p) => String(p.id) === String(l.productId)) }))
    .filter((l): l is typeof l & { product: NonNullable<typeof l.product> } => Boolean(l.product));
  const subtotal = items.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const shipping = SHIPPING.find((s) => s.id === shippingMethod)!;
  const total = subtotal + shipping.price;

  const onSubmit = () => {
    const orderNumber = "PT" + Math.floor(100000 + Math.random() * 900000);
    clearCart();
    router.push(`/checkout/success?order=${orderNumber}`);
  };

  return (
    <>
      <h1 className="mb-6 text-[26px] font-extrabold text-primary">تسویه حساب</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="grid items-start gap-8 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-5">
          <div className="rounded-[18px] border bg-card p-6">
            <h3 className="mb-4 text-base font-extrabold text-primary">اطلاعات گیرنده</h3>
            <div className="mb-3.5 grid gap-3.5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label>نام و نام خانوادگی</Label>
                <Input {...register("name")} placeholder="نام و نام خانوادگی" />
                {errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>شماره موبایل</Label>
                <Input {...register("phone")} placeholder="شماره موبایل" />
                {errors.phone && <span className="text-xs text-destructive">{errors.phone.message}</span>}
              </div>
            </div>
            <div className="mb-3.5 grid gap-3.5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label>شهر</Label>
                <Input {...register("city")} placeholder="شهر" />
                {errors.city && <span className="text-xs text-destructive">{errors.city.message}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>کد پستی</Label>
                <Input {...register("postal")} placeholder="کد پستی" />
                {errors.postal && <span className="text-xs text-destructive">{errors.postal.message}</span>}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>آدرس کامل پستی</Label>
              <Textarea {...register("address")} placeholder="آدرس کامل پستی" rows={3} />
              {errors.address && <span className="text-xs text-destructive">{errors.address.message}</span>}
            </div>
          </div>

          <div className="rounded-[18px] border bg-card p-6">
            <h3 className="mb-4 text-base font-extrabold text-primary">روش ارسال</h3>
            <div className="flex flex-col gap-2.5">
              {SHIPPING.map((so) => (
                <label
                  key={so.id}
                  onClick={() => setShippingMethod(so.id)}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border-[1.5px] p-3.5 text-sm ${shippingMethod === so.id ? "border-primary bg-accent" : ""}`}
                >
                  <span className="flex items-center gap-2.5">
                    {so.id === "posti" ? <Truck className="h-5 w-5 shrink-0" /> : <Bike className="h-5 w-5 shrink-0" />}
                    {so.label}
                  </span>
                  <span className="font-bold">{fmt(so.price)} تومان</span>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-[18px] border bg-card p-6">
            <h3 className="mb-4 text-base font-extrabold text-primary">روش پرداخت</h3>
            <div className="flex items-center gap-2.5 rounded-xl border-[1.5px] border-primary bg-accent p-3.5">
              <CreditCard className="h-5 w-5 shrink-0 text-primary" />
              <div className="h-4 w-4 rounded-full border-[5px] border-primary" />
              <span className="text-sm font-bold">پرداخت آنلاین از طریق درگاه بانکی</span>
            </div>
          </div>
        </div>

        <div className="sticky top-24 rounded-[18px] border bg-card p-6">
          <h3 className="mb-4 text-base font-extrabold text-primary">خلاصه سفارش</h3>
          <div className="mb-4 flex max-h-[200px] flex-col gap-2 overflow-auto">
            {items.map((l) => (
              <div key={l.productId} className="flex justify-between text-[13px] text-muted-foreground">
                <span>{l.product.name} × {l.qty}</span><span>{fmt(l.product.price * l.qty)}</span>
              </div>
            ))}
          </div>
          <div className="mb-2 flex justify-between text-sm text-muted-foreground"><span>جمع کالاها</span><span>{fmt(subtotal)} تومان</span></div>
          <div className="mb-4 flex justify-between text-sm text-muted-foreground"><span>هزینه ارسال</span><span>{fmt(shipping.price)} تومان</span></div>
          <div className="mb-5 flex justify-between border-t pt-4 text-[17px] font-extrabold text-primary"><span>مبلغ قابل پرداخت</span><span>{fmt(total)} تومان</span></div>
          <Button type="submit" className="w-full py-6 text-[15px] font-bold">پرداخت و ثبت سفارش</Button>
        </div>
      </form>
    </>
  );
}
