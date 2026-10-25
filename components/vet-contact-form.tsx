"use client";

import * as React from "react";
import Link from "next/link";
import { ImageUploader } from "@/components/image-uploader";
import { VetMap } from "@/components/vet-map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IRAN_PROVINCES, citiesForProvince } from "@/lib/iran-locations";
import type { ManagedVet } from "@/lib/store-vet";

const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

const empty = {
  name: "",
  specialty: "",
  bio: "",
  province: "",
  city: "",
  address: "",
  phone: "",
  images: [] as string[],
  lat: "",
  lng: "",
};

export function VetContactForm() {
  const [form, setForm] = React.useState(empty);
  const [vetId, setVetId] = React.useState("");
  const [error, setError] = React.useState("");
  const [saved, setSaved] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/vet/me", { cache: "no-store" })
      .then(async (res) => {
        const data = (await res.json().catch(() => null)) as ManagedVet | null;
        if (!res.ok || !data) return;
        setVetId(data.id);
        setForm({
          name: data.name,
          specialty: data.specialty,
          bio: data.bio,
          province: data.province,
          city: data.city,
          address: data.address,
          phone: data.phone,
          images: data.images,
          lat: data.lat == null ? "" : String(data.lat),
          lng: data.lng == null ? "" : String(data.lng),
        });
      })
      .catch(() => setError("بارگذاری پروفایل انجام نشد."));
  }, []);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/vet/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, lat: Number(form.lat), lng: Number(form.lng) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "ذخیره انجام نشد.");
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره انجام نشد.");
    } finally {
      setBusy(false);
    }
  };

  const lat = Number(form.lat);
  const lng = Number(form.lng);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-extrabold text-primary">پروفایل من</h1>
          <p className="mt-1 text-sm text-muted-foreground">نام، عکس‌ها، تخصص، آدرس و نقشه از همین پنل روی سایت به‌روز می‌شود.</p>
        </div>
        {vetId ? (
          <Link href={`/vets/${vetId}`} className="text-sm font-bold text-primary">
            مشاهده صفحه عمومی
          </Link>
        ) : null}
      </div>
      <form onSubmit={save} className="grid max-w-3xl gap-4 rounded-2xl border bg-card p-5">
        <ImageUploader
          values={form.images}
          onChange={(images) => setForm({ ...form, images })}
          max={4}
          folder="vets"
          label="تصاویر کلینیک"
          disabled={busy}
        />
        <label className="flex flex-col gap-1.5 text-sm">
          <Label>نام دامپزشک یا کلینیک</Label>
          <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <Label>تخصص</Label>
          <Input value={form.specialty} onChange={(event) => setForm({ ...form, specialty: event.target.value })} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <Label>معرفی</Label>
          <Textarea value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <Label>استان</Label>
          <select className={selectClass} value={form.province} onChange={(event) => setForm({ ...form, province: event.target.value, city: "" })}>
            <option value="">انتخاب استان</option>
            {IRAN_PROVINCES.map((item) => (
              <option key={item.name} value={item.name}>{item.name}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <Label>شهر</Label>
          <select className={selectClass} value={form.city} disabled={!form.province} onChange={(event) => setForm({ ...form, city: event.target.value })}>
            <option value="">انتخاب شهر</option>
            {citiesForProvince(form.province).map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <Label>آدرس</Label>
          <Textarea value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <Label>تلفن</Label>
          <Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm">
            <Label>عرض جغرافیایی</Label>
            <Input value={form.lat} onChange={(event) => setForm({ ...form, lat: event.target.value })} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <Label>طول جغرافیایی</Label>
            <Input value={form.lng} onChange={(event) => setForm({ ...form, lng: event.target.value })} />
          </label>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {saved ? <p className="text-sm text-primary">پروفایل ذخیره شد و در صفحه عمومی دیده می‌شود.</p> : null}
        <Button type="submit" disabled={busy} className="w-fit font-bold">{busy ? "در حال ذخیره..." : "ذخیره پروفایل"}</Button>
      </form>
      {Number.isFinite(lat) && Number.isFinite(lng) && form.lat && form.lng ? (
        <div className="mt-5 max-w-3xl">
          <VetMap lat={lat} lng={lng} title="پیش‌نمایش نقشه" />
        </div>
      ) : null}
    </>
  );
}
