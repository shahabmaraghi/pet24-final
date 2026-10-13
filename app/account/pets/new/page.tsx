"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PetForm, petPayload, type PetFormValues } from "@/components/pet-form";

export default function NewPetPage() {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  const onSubmit = async (values: PetFormValues) => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(petPayload(values)),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "ثبت پروفایل انجام نشد.");
      router.replace(`/account/pets/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ثبت پروفایل انجام نشد.");
      setBusy(false);
    }
  };

  return (
    <>
      <h1 className="mb-2 text-[22px] font-extrabold text-primary">افزودن حیوان خانگی</h1>
      <p className="mb-5 text-[13px] text-muted-foreground">اطلاعات پروفایل برای داشبورد مراقبت شخصی‌سازی می‌شود.</p>
      <PetForm submitLabel="ثبت پروفایل" busy={busy} error={error} onSubmit={onSubmit} onCancel={() => router.push("/account/pets")} />
    </>
  );
}
