"use client";

import * as React from "react";
import Link from "next/link";
import { PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { locationLabel } from "@/lib/iran-locations";
import { genderLabel, speciesLabel, type StorePet } from "@/lib/store-pet";
import { petAgeLabel } from "@/lib/pet-care";

export default function AccountPetsPage() {
  const [pets, setPets] = React.useState<StorePet[]>([]);
  const [busy, setBusy] = React.useState(true);
  const [error, setError] = React.useState("");

  const load = React.useCallback(() => {
    setBusy(true);
    setError("");
    fetch("/api/pets", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "بارگذاری پروفایل‌ها انجام نشد.");
        setPets(Array.isArray(data.items) ? data.items : []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "بارگذاری پروفایل‌ها انجام نشد."))
      .finally(() => setBusy(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const removePet = async (id: string, name: string) => {
    if (!window.confirm(`پروفایل «${name}» حذف شود؟`)) return;
    const res = await fetch(`/api/pets/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "حذف انجام نشد.");
      return;
    }
    setPets((items) => items.filter((item) => item.id !== id));
  };

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-extrabold text-primary">حیوانات من</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">برای هر حیوان خانگی یک پروفایل و داشبورد مراقبت جداگانه بسازید.</p>
        </div>
        <Button asChild className="font-bold">
          <Link href="/account/pets/new">افزودن حیوان</Link>
        </Button>
      </div>
      {busy ? (
        <div className="py-12 text-center text-sm text-muted-foreground">در حال بارگذاری...</div>
      ) : error ? (
        <div className="py-12 text-center text-sm text-destructive">{error}</div>
      ) : pets.length === 0 ? (
        <div className="rounded-2xl border bg-card px-6 py-14 text-center">
          <PawPrint className="mx-auto mb-3 h-10 w-10 text-primary" />
          <div className="mb-2 font-bold text-primary">هنوز پروفایلی ثبت نشده است.</div>
          <p className="mb-5 text-sm text-muted-foreground">نام، عکس، گونه و اطلاعات مراقبت را یک‌بار وارد کنید تا داشبورد شخصی‌سازی‌شده آماده شود.</p>
          <Button asChild className="font-bold">
            <Link href="/account/pets/new">ثبت اولین حیوان</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
          {pets.map((pet) => (
            <div key={pet.id} className="overflow-hidden rounded-2xl border bg-card">
              <div className="relative h-40 bg-muted">
                {pet.photo ? (
                  <img src={pet.photo} alt={pet.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <PawPrint className="h-10 w-10" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="mb-1 text-base font-extrabold text-primary">{pet.name}</div>
                <div className="text-[13px] leading-6 text-muted-foreground">
                  {speciesLabel(pet.species)}
                  {pet.breed ? ` — ${pet.breed}` : ""}
                  <br />
                  {genderLabel(pet.gender)} · {petAgeLabel(pet.birthday)}
                  {locationLabel(pet.province, pet.city) ? (
                    <>
                      <br />
                      {locationLabel(pet.province, pet.city)}
                    </>
                  ) : null}
                </div>
                <div className="mt-3 flex gap-3.5">
                  <Link href={`/account/pets/${pet.id}`} className="text-[13px] font-semibold text-primary">
                    داشبورد مراقبت
                  </Link>
                  <button
                    type="button"
                    onClick={() => removePet(pet.id, pet.name)}
                    className="text-[13px] font-semibold text-destructive"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
