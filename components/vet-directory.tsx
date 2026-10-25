"use client";

import * as React from "react";
import Link from "next/link";
import { MapPin, Phone, Stethoscope } from "lucide-react";
import { IRAN_PROVINCES, citiesForProvince, locationLabel } from "@/lib/iran-locations";
import type { PublicVet } from "@/lib/store-vet";

const selectClass =
  "h-10 rounded-full border bg-card px-3 text-sm font-semibold text-foreground outline-none";

export function VetDirectory({ vets }: { vets: PublicVet[] }) {
  const [province, setProvince] = React.useState("");
  const [city, setCity] = React.useState("");
  const [query, setQuery] = React.useState("");

  const shown = vets.filter((vet) => {
    if (province && vet.province !== province) return false;
    if (city && vet.city !== city) return false;
    const q = query.trim();
    if (!q) return true;
    return [vet.name, vet.specialty, vet.city, vet.address].join(" ").includes(q);
  });

  return (
    <div>
      <section className="relative overflow-hidden bg-[#16342c] text-[#f3faf6]">
        <div className="pointer-events-none absolute -left-10 top-0 h-48 w-48 rounded-full bg-[#7dcea0]/20 blur-3xl" />
        <div className="relative mx-auto max-w-[1100px] px-6 py-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold">
            <Stethoscope className="h-3.5 w-3.5" />
            نوبت دامپزشکی
          </div>
          <h1 className="text-3xl font-extrabold sm:text-4xl">دامپزشکان</h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-[#d5ebe3]">
            کلینیک را بر اساس شهر پیدا کنید، آدرس و شماره تماس را ببینید و برای حیوان خانگی‌تان نوبت بگیرید.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1100px] px-6 py-8">
        <div className="mb-6 flex flex-col gap-3 rounded-[24px] border bg-card p-4 md:flex-row md:items-center">
          <select
            className={selectClass}
            value={province}
            onChange={(event) => {
              setProvince(event.target.value);
              setCity("");
            }}
          >
            <option value="">همه استان‌ها</option>
            {IRAN_PROVINCES.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
          <select className={selectClass} value={city} disabled={!province} onChange={(event) => setCity(event.target.value)}>
            <option value="">{province ? "همه شهرها" : "ابتدا استان را انتخاب کنید"}</option>
            {citiesForProvince(province).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="نام کلینیک یا تخصص"
            className="h-10 flex-1 rounded-full border bg-background px-4 text-sm outline-none"
          />
          <div className="text-sm font-bold text-muted-foreground">{shown.length.toLocaleString("fa-IR")} کلینیک</div>
        </div>

        {shown.length === 0 ? (
          <div className="rounded-[28px] border bg-card px-6 py-16 text-center">
            <Stethoscope className="mx-auto mb-3 h-10 w-10 text-primary" />
            <div className="font-extrabold text-primary">دامپزشکی با این فیلتر پیدا نشد.</div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((vet) => (
              <Link key={vet.id} href={`/vets/${vet.id}`} className="overflow-hidden rounded-[28px] border bg-card transition hover:-translate-y-1">
                <div className="h-44 bg-muted">
                  {vet.images[0] ? (
                    <img src={vet.images[0]} alt={vet.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-primary">
                      <Stethoscope className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-extrabold text-primary">{vet.name}</h2>
                  {vet.specialty ? <p className="mt-1 text-sm text-muted-foreground">{vet.specialty}</p> : null}
                  <div className="mt-3 flex items-center gap-1.5 text-[13px] text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {locationLabel(vet.province, vet.city)}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[13px] font-semibold text-primary">
                    <Phone className="h-3.5 w-3.5" />
                    {vet.phone}
                  </div>
                  <div className="mt-3 text-[12px] text-muted-foreground">{vet.commentCount.toLocaleString("fa-IR")} نظر تأییدشده</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
