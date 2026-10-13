"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, CalendarDays, MapPin, Phone, ShieldCheck, Weight } from "lucide-react";
import { locationLabel } from "@/lib/iran-locations";
import { PetForm, petPayload, type PetFormValues } from "@/components/pet-form";
import { PetSuggestionPlan } from "@/components/pet-suggestion-plan";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { careDashboard, profileCompleteness } from "@/lib/pet-care";
import { genderLabel, speciesLabel, type StorePet } from "@/lib/store-pet";

const TONE_CLASS = {
  ok: "border-primary/20 bg-accent text-primary",
  warn: "border-amber-200 bg-amber-50 text-amber-900",
  alert: "border-red-200 bg-red-50 text-red-800",
};

export default function PetDashboardPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [pet, setPet] = React.useState<StorePet | null>(null);
  const [busy, setBusy] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [error, setError] = React.useState("");
  const [saved, setSaved] = React.useState(false);
  const [photoOpen, setPhotoOpen] = React.useState(false);

  const load = React.useCallback(() => {
    if (!params.id) return;
    setBusy(true);
    setError("");
    fetch(`/api/pets/${params.id}`, { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "پروفایل یافت نشد.");
        setPet(data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "پروفایل یافت نشد."))
      .finally(() => setBusy(false));
  }, [params.id]);

  React.useEffect(() => {
    load();
  }, [load]);

  const onSubmit = async (values: PetFormValues) => {
    if (!pet) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch(`/api/pets/${pet.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(petPayload(values)),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "ذخیره انجام نشد.");
      setPet(data);
      setEditing(false);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره انجام نشد.");
    } finally {
      setSaving(false);
    }
  };

  const removePet = async () => {
    if (!pet || !window.confirm(`پروفایل «${pet.name}» حذف شود؟`)) return;
    const res = await fetch(`/api/pets/${pet.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "حذف انجام نشد.");
      return;
    }
    router.replace("/account/pets");
  };

  if (busy) {
    return <div className="py-12 text-center text-sm text-muted-foreground">در حال بارگذاری داشبورد...</div>;
  }
  if (!pet) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 text-sm text-destructive">{error || "پروفایل یافت نشد."}</div>
        <Button asChild variant="outline">
          <Link href="/account/pets">بازگشت</Link>
        </Button>
      </div>
    );
  }

  const care = careDashboard(pet);
  const completeness = profileCompleteness(pet);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/account/pets" className="mb-2 inline-block text-[13px] text-muted-foreground">
            ← حیوانات من
          </Link>
          <h1 className="text-[22px] font-extrabold text-primary">داشبورد مراقبت {pet.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant={editing ? "outline" : "default"} className="font-bold" onClick={() => setEditing((v) => !v)}>
            {editing ? "بستن فرم" : "ویرایش پروفایل"}
          </Button>
          <Button type="button" variant="outline" className="font-bold text-destructive" onClick={removePet}>
            حذف
          </Button>
        </div>
      </div>

      <div className="mb-5 overflow-hidden rounded-2xl border bg-card">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-muted">
            {pet.photo ? (
              <button
                type="button"
                onClick={() => setPhotoOpen(true)}
                className="h-full w-full cursor-zoom-in"
                aria-label={`نمایش عکس ${pet.name}`}
              >
                <img src={pet.photo} alt={pet.name} className="h-full w-full object-cover" />
              </button>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">بدون عکس</div>
            )}
          </div>
          <div className="grow">
            <div className="text-xl font-extrabold text-primary">{pet.name}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              {speciesLabel(pet.species)}
              {pet.breed ? ` · ${pet.breed}` : ""} · {genderLabel(pet.gender)}
              {locationLabel(pet.province, pet.city) ? ` · ${locationLabel(pet.province, pet.city)}` : ""}
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${completeness}%` }} />
            </div>
            <div className="mt-1.5 text-xs text-muted-foreground">تکمیل پروفایل: {completeness.toLocaleString("fa-IR")}٪</div>
          </div>
        </div>
      </div>

      {pet.photo && (
        <Dialog open={photoOpen} onOpenChange={setPhotoOpen}>
          <DialogContent className="max-h-[94vh] w-auto max-w-[94vw] border-none bg-transparent p-0 shadow-none [&_button]:left-2 [&_button]:top-2 [&_button]:rounded-full [&_button]:bg-black/50 [&_button]:p-1.5 [&_button]:text-white">
            <DialogTitle className="sr-only">عکس {pet.name}</DialogTitle>
            <img
              src={pet.photo}
              alt={pet.name}
              className="max-h-[90vh] max-w-[94vw] cursor-zoom-out rounded-2xl object-contain"
              onClick={() => setPhotoOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      <div className="mb-5 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
        <div className="rounded-2xl border bg-card p-4">
          <CalendarDays className="mb-2 h-4 w-4 text-primary" />
          <div className="text-xs text-muted-foreground">سن</div>
          <div className="mt-1 font-bold">{care.ageLabel}</div>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <MapPin className="mb-2 h-4 w-4 text-primary" />
          <div className="text-xs text-muted-foreground">شهر</div>
          <div className="mt-1 font-bold">{locationLabel(pet.province, pet.city) || "ثبت نشده"}</div>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <Weight className="mb-2 h-4 w-4 text-primary" />
          <div className="text-xs text-muted-foreground">وزن</div>
          <div className="mt-1 font-bold">{pet.weightKg ? `${pet.weightKg.toLocaleString("fa-IR")} کیلوگرم` : "ثبت نشده"}</div>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <ShieldCheck className="mb-2 h-4 w-4 text-primary" />
          <div className="text-xs text-muted-foreground">میکروچیپ</div>
          <div className="mt-1 break-all font-bold">{pet.microchipNumber || "ثبت نشده"}</div>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <Phone className="mb-2 h-4 w-4 text-primary" />
          <div className="text-xs text-muted-foreground">مخاطب اضطراری</div>
          <div className="mt-1 font-bold">{pet.emergencyContactName || "ثبت نشده"}</div>
          {pet.emergencyContactPhone && <div className="mt-1 text-xs text-muted-foreground">{pet.emergencyContactPhone}</div>}
        </div>
      </div>

      {care.items.length > 0 && (
        <section className="mb-5">
          <h2 className="mb-3 text-base font-extrabold text-primary">یادآوری‌های مراقبت</h2>
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
            {care.items.map((item) => (
              <div key={item.id} className={`rounded-2xl border p-4 ${TONE_CLASS[item.tone]}`}>
                <div className="mb-1 flex items-center gap-1.5 text-sm font-bold">
                  {item.tone !== "ok" && <AlertTriangle className="h-4 w-4" />}
                  {item.title}
                </div>
                <div className="text-[13px] leading-6">{item.text}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-5 rounded-2xl border bg-card p-5">
        <h2 className="mb-2 text-base font-extrabold text-primary">برنامه مراقبت {pet.name}</h2>
        <p className="mb-3 text-sm text-muted-foreground">{care.nextCheckup}</p>
        <ul className="space-y-2 text-sm leading-7 text-muted-foreground">
          {care.tips.map((tip) => (
            <li key={tip}>• {tip}</li>
          ))}
        </ul>
      </section>

      <PetSuggestionPlan petId={pet.id} petName={pet.name} />

      {(pet.allergies || pet.dietaryRestrictions || pet.specialNeeds) && (
        <section className="mb-5 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          {pet.allergies && (
            <div className="rounded-2xl border bg-card p-4">
              <div className="mb-1 text-sm font-bold text-primary">آلرژی‌ها</div>
              <p className="text-[13px] leading-6 text-muted-foreground">{pet.allergies}</p>
            </div>
          )}
          {pet.dietaryRestrictions && (
            <div className="rounded-2xl border bg-card p-4">
              <div className="mb-1 text-sm font-bold text-primary">محدودیت غذایی</div>
              <p className="text-[13px] leading-6 text-muted-foreground">{pet.dietaryRestrictions}</p>
            </div>
          )}
          {pet.specialNeeds && (
            <div className="rounded-2xl border bg-card p-4">
              <div className="mb-1 text-sm font-bold text-primary">نیازهای ویژه</div>
              <p className="text-[13px] leading-6 text-muted-foreground">{pet.specialNeeds}</p>
            </div>
          )}
        </section>
      )}

      {saved && !editing && <div className="mb-4 text-[13px] text-primary">تغییرات ذخیره شد.</div>}
      {error && editing && <div className="mb-4 text-[13px] text-destructive">{error}</div>}

      {editing && (
        <PetForm
          pet={pet}
          submitLabel="ذخیره تغییرات"
          busy={saving}
          error={error}
          onSubmit={onSubmit}
          onCancel={() => setEditing(false)}
        />
      )}
    </>
  );
}
