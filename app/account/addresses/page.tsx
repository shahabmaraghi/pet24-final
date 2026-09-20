"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const addressSchema = z.object({
  title: z.string().min(2, "عنوان آدرس را وارد کنید"),
  receiver: z.string().min(3, "نام گیرنده را وارد کنید"),
  phone: z.string().regex(/^09\d{9}$/, "شماره تماس معتبر نیست"),
  city: z.string().min(2, "شهر را وارد کنید"),
  address: z.string().min(10, "آدرس کامل را وارد کنید"),
});
type AddressForm = z.infer<typeof addressSchema>;
type Address = AddressForm & { id: number };

export default function AccountAddressesPage() {
  const [addresses, setAddresses] = React.useState<Address[]>([]);
  const [editingAddressId, setEditingAddressId] = React.useState<number | null | undefined>(undefined);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: { title: "", receiver: "", phone: "", city: "", address: "" },
  });

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-[22px] font-extrabold text-primary">آدرس‌ها</h1>
        <Button className="font-bold" onClick={() => { setEditingAddressId(null); reset({ title: "", receiver: "", phone: "", city: "", address: "" }); }}>افزودن آدرس</Button>
      </div>
      {editingAddressId !== undefined && (
        <form
          onSubmit={handleSubmit((data) => {
            const rec = { ...data, id: editingAddressId || Date.now() };
            setAddresses((as) => (as.some((a) => a.id === rec.id) ? as.map((a) => (a.id === rec.id ? rec : a)) : [...as, rec]));
            setEditingAddressId(undefined);
          })}
          className="mb-5 grid gap-3 rounded-2xl border bg-card p-5 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]"
        >
          <div className="flex flex-col gap-1.5">
            <Label>عنوان آدرس</Label>
            <Input {...register("title")} placeholder="خانه، محل کار" />
            {errors.title && <span className="text-xs text-destructive">{errors.title.message}</span>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>نام گیرنده</Label>
            <Input {...register("receiver")} />
            {errors.receiver && <span className="text-xs text-destructive">{errors.receiver.message}</span>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>شماره تماس</Label>
            <Input {...register("phone")} />
            {errors.phone && <span className="text-xs text-destructive">{errors.phone.message}</span>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>شهر</Label>
            <Input {...register("city")} />
            {errors.city && <span className="text-xs text-destructive">{errors.city.message}</span>}
          </div>
          <div className="col-span-full flex flex-col gap-1.5">
            <Label>آدرس کامل</Label>
            <Textarea rows={2} {...register("address")} />
            {errors.address && <span className="text-xs text-destructive">{errors.address.message}</span>}
          </div>
          <div className="col-span-full flex gap-2.5">
            <Button type="submit" className="font-bold">ذخیره</Button>
            <Button type="button" variant="outline" onClick={() => setEditingAddressId(undefined)}>انصراف</Button>
          </div>
        </form>
      )}
      {addresses.length === 0 && editingAddressId === undefined && (
        <div className="py-12 text-center text-muted-foreground">آدرسی ثبت نشده است.</div>
      )}
      <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
        {addresses.map((a) => (
          <div key={a.id} className="rounded-2xl border bg-card p-4.5">
            <div className="mb-1.5 text-sm font-bold">{a.title}</div>
            <div className="text-[13px] leading-loose text-muted-foreground">{a.receiver} — {a.phone}<br />{a.city}، {a.address}</div>
            <div className="mt-3 flex gap-3.5">
              <button onClick={() => { setEditingAddressId(a.id); reset(a); }} className="text-[13px] font-semibold text-primary">ویرایش</button>
              <button onClick={() => setAddresses((as) => as.filter((x) => x.id !== a.id))} className="text-[13px] font-semibold text-destructive">حذف</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
