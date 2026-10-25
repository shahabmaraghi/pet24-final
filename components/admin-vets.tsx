"use client";

import * as React from "react";
import { ImageUploader } from "@/components/image-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IRAN_PROVINCES, citiesForProvince, locationLabel } from "@/lib/iran-locations";
import { commentStatusLabel, listingStatusLabel, type ManagedVet, type VetCommentStatus, type VetListingStatus } from "@/lib/store-vet";

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm";

type CommentRow = {
  id: string;
  vetId: string;
  vetName?: string;
  authorName: string;
  text: string;
  status: VetCommentStatus;
};

const emptyForm = {
  name: "",
  specialty: "",
  bio: "",
  province: "",
  city: "",
  address: "",
  phone: "",
  accountEmail: "",
  images: [] as string[],
  lat: "",
  lng: "",
};

export function AdminVets() {
  const [tab, setTab] = React.useState<"vets" | "comments">("vets");
  const [vets, setVets] = React.useState<ManagedVet[]>([]);
  const [comments, setComments] = React.useState<CommentRow[]>([]);
  const [form, setForm] = React.useState(emptyForm);
  const [editing, setEditing] = React.useState<string | null>(null);
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const loadVets = React.useCallback(() => {
    fetch("/api/vets?manage=1", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "بارگذاری انجام نشد.");
        setVets(Array.isArray(data.items) ? data.items : []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "بارگذاری انجام نشد."));
  }, []);

  const loadComments = React.useCallback(() => {
    fetch("/api/vet-comments?status=all", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "بارگذاری نظرها انجام نشد.");
        setComments(Array.isArray(data.items) ? data.items : []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "بارگذاری نظرها انجام نشد."));
  }, []);

  React.useEffect(() => {
    loadVets();
    loadComments();
  }, [loadVets, loadComments]);

  const edit = (vet: ManagedVet) => {
    setEditing(vet.id);
    setForm({
      name: vet.name,
      specialty: vet.specialty,
      bio: vet.bio,
      province: vet.province,
      city: vet.city,
      address: vet.address,
      phone: vet.phone,
      accountEmail: vet.accountEmail,
      images: vet.images,
      lat: vet.lat == null ? "" : String(vet.lat),
      lng: vet.lng == null ? "" : String(vet.lng),
    });
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const payload = { ...form, lat: Number(form.lat), lng: Number(form.lng) };
    try {
      const res = await fetch(editing ? `/api/vets/${editing}` : "/api/vets", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "ذخیره انجام نشد.");
      setForm(emptyForm);
      setEditing(null);
      loadVets();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره انجام نشد.");
    } finally {
      setBusy(false);
    }
  };

  const setListingStatus = async (id: string, status: VetListingStatus) => {
    const res = await fetch(`/api/vets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "تغییر وضعیت انجام نشد.");
      return;
    }
    setVets((current) => current.map((item) => (item.id === id ? { ...item, listingStatus: status } : item)));
  };

  const remove = async (id: string) => {
    const res = await fetch(`/api/vets/${id}`, { method: "DELETE" });
    if (res.ok) setVets((current) => current.filter((item) => item.id !== id));
  };

  const moderate = async (id: string, status: VetCommentStatus) => {
    const res = await fetch(`/api/vet-comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) setComments((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  return (
    <>
      <h1 className="mb-4 text-[22px] font-extrabold text-primary">دامپزشکان</h1>
      <div className="mb-5 flex gap-2">
        <button type="button" onClick={() => setTab("vets")} className={`rounded-full border px-4 py-2 text-sm font-bold ${tab === "vets" ? "bg-primary text-primary-foreground" : ""}`}>
          کلینیک‌ها
        </button>
        <button type="button" onClick={() => setTab("comments")} className={`rounded-full border px-4 py-2 text-sm font-bold ${tab === "comments" ? "bg-primary text-primary-foreground" : ""}`}>
          نظرها
        </button>
      </div>
      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}

      {tab === "comments" ? (
        <div className="flex flex-col gap-3">
          {comments.length === 0 ? <div className="rounded-xl border bg-card py-8 text-center text-sm text-muted-foreground">نظری برای بررسی نیست.</div> : null}
          {comments.map((comment) => (
            <article key={comment.id} className="rounded-2xl border bg-card p-4">
              <div className="mb-1 flex justify-between gap-2">
                <strong>{comment.authorName}</strong>
                <span className="text-xs font-bold text-[#c17d2f]">{commentStatusLabel(comment.status)}</span>
              </div>
              <div className="mb-2 text-xs text-muted-foreground">برای: {comment.vetName || "دامپزشک"}</div>
              <p className="text-sm leading-7">{comment.text}</p>
              {comment.status === "pending" ? (
                <div className="mt-3 flex gap-3">
                  <button type="button" onClick={() => moderate(comment.id, "approved")} className="text-sm font-bold text-primary">تأیید</button>
                  <button type="button" onClick={() => moderate(comment.id, "rejected")} className="text-sm font-bold text-destructive">رد</button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
          <form onSubmit={save} className="rounded-2xl border bg-card p-4">
            <h2 className="mb-3 font-extrabold text-primary">{editing ? "ویرایش کلینیک" : "کلینیک تازه"}</h2>
            <ImageUploader values={form.images} onChange={(images) => setForm({ ...form, images })} max={4} folder="vets" label="تصاویر کلینیک" disabled={busy} />
            <div className="mt-3 grid gap-3">
              <TextField label="نام" value={form.name} onChange={(name) => setForm({ ...form, name })} />
              <TextField label="تخصص" value={form.specialty} onChange={(specialty) => setForm({ ...form, specialty })} />
              <TextField label="ایمیل حساب دامپزشک" value={form.accountEmail} onChange={(accountEmail) => setForm({ ...form, accountEmail })} />
              <TextField label="تلفن" value={form.phone} onChange={(phone) => setForm({ ...form, phone })} />
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
                <Label>معرفی</Label>
                <Textarea value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <TextField label="عرض جغرافیایی" value={form.lat} onChange={(lat) => setForm({ ...form, lat })} />
                <TextField label="طول جغرافیایی" value={form.lng} onChange={(lng) => setForm({ ...form, lng })} />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button type="submit" disabled={busy} className="font-bold">{busy ? "در حال ذخیره..." : "ذخیره"}</Button>
              {editing ? (
                <Button type="button" variant="outline" onClick={() => { setEditing(null); setForm(emptyForm); }}>انصراف</Button>
              ) : null}
            </div>
          </form>
          <div className="flex flex-col gap-3">
            {vets.map((vet) => (
              <article key={vet.id} className="flex gap-3 rounded-2xl border bg-card p-3">
                {vet.images[0] ? <img src={vet.images[0]} alt="" className="h-20 w-20 rounded-xl object-cover" /> : null}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-extrabold text-primary">{vet.name}</div>
                    <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-primary">{listingStatusLabel(vet.listingStatus)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{locationLabel(vet.province, vet.city)} · {vet.phone}</div>
                  <div className="text-xs text-muted-foreground">{vet.accountEmail || "بدون حساب ورود"}</div>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm font-bold">
                    {vet.listingStatus !== "approved" ? (
                      <button type="button" onClick={() => setListingStatus(vet.id, "approved")} className="text-primary">تأیید و انتشار</button>
                    ) : (
                      <button type="button" onClick={() => setListingStatus(vet.id, "suspended")} className="text-[#8a4b12]">توقف نمایش</button>
                    )}
                    <button type="button" onClick={() => edit(vet)} className="text-primary">ویرایش</button>
                    <button type="button" onClick={() => remove(vet.id)} className="text-destructive">حذف</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <Label>{label}</Label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
