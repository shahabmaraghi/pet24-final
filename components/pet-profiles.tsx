"use client";

import * as React from "react";
import Link from "next/link";
import { Cake, MapPin, PawPrint, Search, Weight } from "lucide-react";
import { locationLabel } from "@/lib/iran-locations";
import { petAgeLabel } from "@/lib/pet-care";
import { genderLabel, PET_SPECIES, speciesLabel, type PetSpecies, type PublicPet } from "@/lib/store-pet";

const SPECIES_THEME: Record<PetSpecies, { wash: string; ink: string; stamp: string }> = {
  dog: { wash: "#f6e7d4", ink: "#8a4b12", stamp: "#c17d2f" },
  cat: { wash: "#efe4f8", ink: "#5b3d78", stamp: "#7c5cbf" },
  rabbit: { wash: "#fde7ee", ink: "#8a3d55", stamp: "#d46a88" },
  bird: { wash: "#e3f1fb", ink: "#1d5f86", stamp: "#3b8ec4" },
  fish: { wash: "#e2f5f3", ink: "#0f6b64", stamp: "#1a9b90" },
  rodent: { wash: "#f4eed6", ink: "#6b5a22", stamp: "#a08a3a" },
  other: { wash: "#eceae4", ink: "#4a453c", stamp: "#6d675c" },
};

function SpeciesMark({ species, className }: { species: PetSpecies; className?: string }) {
  const theme = SPECIES_THEME[species];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-bold ${className || ""}`}
      style={{ background: theme.wash, color: theme.ink }}
    >
      <PawPrint className="h-3.5 w-3.5" strokeWidth={2.2} />
      {speciesLabel(species)}
    </span>
  );
}

function PetPhoto({ pet, className }: { pet: PublicPet; className?: string }) {
  const theme = SPECIES_THEME[pet.species];
  if (pet.photo) {
    return <img src={pet.photo} alt={pet.name} className={className} />;
  }
  return (
    <div className={`flex items-center justify-center ${className || ""}`} style={{ background: theme.wash, color: theme.stamp }}>
      <PawPrint className="h-12 w-12" strokeWidth={1.4} />
    </div>
  );
}

function factLine(pet: PublicPet) {
  const place = locationLabel(pet.province, pet.city);
  const bits = [pet.breed || speciesLabel(pet.species), genderLabel(pet.gender), place].filter(Boolean);
  return bits.join(" · ");
}

export function PetGallery({ pets, loadError }: { pets: PublicPet[]; loadError?: boolean }) {
  const [species, setSpecies] = React.useState<PetSpecies | "all">("all");
  const [query, setQuery] = React.useState("");

  const counts = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const pet of pets) map.set(pet.species, (map.get(pet.species) || 0) + 1);
    return map;
  }, [pets]);

  const shown = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return pets.filter((pet) => {
      if (species !== "all" && pet.species !== species) return false;
      if (!q) return true;
      const hay = [pet.name, pet.breed, pet.city, pet.province, speciesLabel(pet.species)].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [pets, query, species]);

  const spotlight = shown[0];
  const rest = shown.slice(1);

  return (
    <div className="pb-4">
      <section className="relative overflow-hidden bg-[#1f1c17] text-[#f6f1e6]">
        <div className="pointer-events-none absolute -left-16 top-8 h-56 w-56 rounded-full bg-[#c17d2f]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-10 h-64 w-64 rounded-full bg-[#2f7d4f]/30 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:radial-gradient(circle_at_center,#fff_1.2px,transparent_1.3px)] [background-size:22px_22px]" />
        <div className="relative mx-auto flex max-w-[1180px] flex-col gap-8 px-6 py-12 md:flex-row md:items-end md:justify-between md:py-16">
          <div className="max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[12px] font-semibold text-[#f0d7b4]">
              <PawPrint className="h-3.5 w-3.5" />
              دفترچه دوستان Pet24
            </div>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">شناسنامه حیوانات</h1>
            <p className="mt-3 max-w-md text-sm leading-7 text-[#d8d1c2]">
              پروفایل عمومی حیواناتی که کاربران Pet24 ثبت کرده‌اند. نام، عکس، نژاد و شهر اینجاست؛ جزئیات پزشکی و تماس اضطراری فقط در حساب صاحب حیوان می‌ماند.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="min-w-[120px] rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="text-2xl font-extrabold">{pets.length.toLocaleString("fa-IR")}</div>
              <div className="text-xs text-[#c9c3b2]">پروفایل ثبت‌شده</div>
            </div>
            <div className="min-w-[120px] rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="text-2xl font-extrabold">{counts.size.toLocaleString("fa-IR")}</div>
              <div className="text-xs text-[#c9c3b2]">گونه متفاوت</div>
            </div>
            <Link
              href="/account/pets/new"
              className="inline-flex items-center rounded-2xl bg-[#f6f1e6] px-4 py-3 text-sm font-extrabold text-[#1f1c17]"
            >
              ثبت پروفایل حیوان من
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1180px] px-6 py-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <FilterChip active={species === "all"} onClick={() => setSpecies("all")} label={`همه (${pets.length.toLocaleString("fa-IR")})`} />
            {PET_SPECIES.map((item) => (
              <FilterChip
                key={item.id}
                active={species === item.id}
                onClick={() => setSpecies(item.id)}
                label={`${item.label} (${(counts.get(item.id) || 0).toLocaleString("fa-IR")})`}
                tint={SPECIES_THEME[item.id].stamp}
              />
            ))}
          </div>
          <label className="flex min-w-[220px] items-center gap-2 rounded-full border bg-card px-3.5 py-2.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="نام، نژاد یا شهر"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </label>
        </div>

        {loadError ? (
          <div className="rounded-3xl border bg-card px-6 py-16 text-center text-sm text-destructive">بارگذاری پروفایل‌ها انجام نشد.</div>
        ) : pets.length === 0 ? (
          <EmptyState />
        ) : shown.length === 0 ? (
          <div className="rounded-3xl border border-dashed bg-card px-6 py-16 text-center text-sm text-muted-foreground">پروفایلی با این جستجو پیدا نشد.</div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-3">
            {spotlight ? <PassportCard pet={spotlight} featured /> : null}
            {rest.map((pet) => (
              <PassportCard key={pet.id} pet={pet} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  label,
  onClick,
  tint,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  tint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full border px-3.5 py-2 text-[13px] font-semibold ${
        active ? "border-transparent text-white" : "border-border bg-card text-muted-foreground"
      }`}
      style={active ? { background: tint || "#1f1c17" } : undefined}
    >
      {label}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="overflow-hidden rounded-[28px] border bg-[#fffdf8] px-6 py-16 text-center text-[#1f1c17]">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f6e7d4] text-[#c17d2f]">
        <PawPrint className="h-8 w-8" />
      </div>
      <div className="text-lg font-extrabold">هنوز شناسنامه‌ای در دفترچه نیست</div>
      <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-[#6d675c]">اولین پروفایل را از حساب کاربری بسازید تا عکس و مشخصات حیوان اینجا دیده شود.</p>
      <Link href="/account/pets/new" className="mt-5 inline-flex rounded-full bg-[#1f1c17] px-5 py-2.5 text-sm font-bold text-[#f6f1e6]">
        ساخت پروفایل
      </Link>
    </div>
  );
}

function PassportCard({ pet, featured = false }: { pet: PublicPet; featured?: boolean }) {
  const theme = SPECIES_THEME[pet.species];
  return (
    <Link
      href={`/pets/${pet.id}`}
      className={`group relative block overflow-hidden rounded-[28px] border border-black/5 bg-[#fffdf8] text-[#1f1c17] shadow-[0_16px_40px_rgba(31,28,23,0.08)] transition duration-300 hover:-translate-y-1 ${
        featured ? "lg:col-span-2" : ""
      }`}
    >
      <div
        className="absolute inset-y-4 right-3 w-3 rounded-full"
        style={{
          background: `radial-gradient(circle at 50% 10px, transparent 5px, ${theme.stamp} 5.5px) 0 0 / 12px 22px repeat-y`,
        }}
        aria-hidden
      />
      <div className={`grid gap-0 ${featured ? "md:grid-cols-[280px_1fr]" : ""}`}>
        <PetPhoto pet={pet} className={`h-52 w-full object-cover ${featured ? "md:h-full md:min-h-[240px]" : ""}`} />
        <div className="flex flex-col justify-between p-5 pr-8">
          <div>
            <div className="mb-3 flex items-center justify-between gap-2">
              <SpeciesMark species={pet.species} />
              <span className="text-[11px] font-bold tracking-wide text-[#a39886]">PET24 ID</span>
            </div>
            <h2 className="text-2xl font-extrabold">{pet.name}</h2>
            <p className="mt-1 text-sm text-[#6d675c]">{factLine(pet)}</p>
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-dashed border-[#e6dfd2] pt-3 text-[13px] font-semibold" style={{ color: theme.ink }}>
            <span>{petAgeLabel(pet.birthday)}</span>
            <span className="transition group-hover:-translate-x-1">مشاهده شناسنامه</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function PetPassport({ pet, others }: { pet: PublicPet; others: PublicPet[] }) {
  const theme = SPECIES_THEME[pet.species];
  const place = locationLabel(pet.province, pet.city);
  const facts = [
    { Icon: Cake, label: "سن", value: petAgeLabel(pet.birthday) },
    { Icon: Weight, label: "وزن", value: pet.weightKg ? `${pet.weightKg.toLocaleString("fa-IR")} کیلوگرم` : "ثبت نشده" },
    { Icon: MapPin, label: "محل زندگی", value: place || "ثبت نشده" },
  ];

  return (
    <div className="bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_42%)]">
      <div className="mx-auto max-w-[980px] px-6 py-8">
        <Link href="/pets" className="mb-5 inline-flex text-sm font-semibold text-muted-foreground hover:text-primary">
          بازگشت به شناسنامه‌ها
        </Link>
        <article className="overflow-hidden rounded-[32px] border border-black/5 bg-[#fffdf8] text-[#1f1c17] shadow-[0_24px_60px_rgba(31,28,23,0.12)]">
          <div className="grid md:grid-cols-[320px_1fr]">
            <div className="relative min-h-[320px]" style={{ background: theme.wash }}>
              <PetPhoto pet={pet} className="h-full min-h-[320px] w-full object-cover" />
              <div className="absolute bottom-4 right-4 rounded-full px-3 py-1 text-xs font-extrabold text-white" style={{ background: theme.stamp }}>
                {speciesLabel(pet.species)}
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <div className="text-[11px] font-bold tracking-[0.18em] text-[#a39886]">PET24 PASSPORT</div>
              <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{pet.name}</h1>
              <p className="mt-2 text-sm text-[#6d675c]">
                {pet.breed || "نژاد ثبت نشده"} · {genderLabel(pet.gender)}
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {facts.map(({ Icon, label, value }) => (
                  <div key={label} className="rounded-2xl px-3 py-3" style={{ background: theme.wash }}>
                    <div className="mb-1 flex items-center gap-1.5 text-[12px] font-bold" style={{ color: theme.ink }}>
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </div>
                    <div className="text-sm font-extrabold">{value}</div>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-[13px] leading-7 text-[#6d675c]">
                این صفحه فقط مشخصات عمومی را نشان می‌دهد. حساسیت‌ها، میکروچیپ و شماره اضطراری در داشبورد خصوصی صاحب حیوان باقی می‌ماند.
              </p>
              <Link href="/account/pets/new" className="mt-5 inline-flex rounded-full px-4 py-2.5 text-sm font-bold text-white" style={{ background: theme.stamp }}>
                پروفایل حیوان خودتان را بسازید
              </Link>
            </div>
          </div>
        </article>

        {others.length > 0 ? (
          <div className="mt-10">
            <h2 className="mb-4 text-lg font-extrabold text-primary">هم‌گونه‌های {pet.name}</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {others.map((item) => (
                <PassportCard key={item.id} pet={item} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
