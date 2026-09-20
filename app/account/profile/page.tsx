"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const profileSchema = z.object({
  name: z.string().min(2, "نام را کامل وارد کنید"),
  phone: z.string().trim().refine((value) => !value || /^09\d{9}$/.test(value), "شماره موبایل معتبر نیست"),
});
type ProfileForm = z.infer<typeof profileSchema>;

export default function AccountProfilePage() {
  const { data: session } = useSession();
  const [profileSaved, setProfileSaved] = React.useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", phone: "" },
  });

  React.useEffect(() => {
    if (!session?.user) return;
    reset({ name: session.user.name || "", phone: "" });
  }, [session?.user?.name, reset]);

  return (
    <>
      <h1 className="mb-5 text-[22px] font-extrabold text-primary">پروفایل</h1>
      <form
        onSubmit={handleSubmit(() => { setProfileSaved(true); })}
        className="flex max-w-[420px] flex-col gap-3.5 rounded-2xl border bg-card p-6"
      >
        <div className="flex flex-col gap-1.5">
          <Label>نام و نام خانوادگی</Label>
          <Input {...register("name")} />
          {errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>ایمیل</Label>
          <Input value={session?.user?.email || ""} readOnly className="bg-muted" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>شماره موبایل</Label>
          <Input {...register("phone")} placeholder="0912xxxxxxx" />
          {errors.phone && <span className="text-xs text-destructive">{errors.phone.message}</span>}
        </div>
        <Button type="submit" className="py-6 font-bold">ذخیره تغییرات</Button>
        {profileSaved && <div className="text-[13px] text-primary">تغییرات ذخیره شد.</div>}
      </form>
    </>
  );
}
