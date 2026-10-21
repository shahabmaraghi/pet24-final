"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { HeartHandshake, MapPin, Phone, PawPrint } from "lucide-react";
import { ImageUploader } from "@/components/image-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IRAN_PROVINCES, citiesForProvince, locationLabel } from "@/lib/iran-locations";
import { PET_SPECIES, type PetSpecies } from "@/lib/store-pet";
import {
  rehomingSpeciesLabel,
  rehomingStatusLabel,
  type OwnerRehoming,
  type PublicRehoming,
  type RehomingStatus,
} from "@/lib/store-rehoming";

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

type SpeciesFilter = PetSpecies | "all";

export function RehomingBoard({ listings }: { listings: PublicRehoming[] }) {
  const { status } = useSession();
  const [items, setItems] = React.useState(listings);
  const [mine, setMine] = React.useState<OwnerRehoming[]>([]);
  const [species, setSpecies] = React.useState<SpeciesFilter>("all");
  const [formOpen, setFormOpen] = React.useState(false);

  const loadMine = React.useCallback(() => {
    if (status !== "authenticated") {
      setMine([]);
      return;
    }
    fetch("/api/rehoming?mine=1", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return;
        setMine(Array.isArray(data.items) ? data.items : []);
      })
      .catch(() => setMine([]));
  }, [status]);

  React.useEffect(() => {
    loadMine();
  }, [loadMine]);

  const shown = species === "all" ? items : items.filter((item) => item.species === species);

  return (
    <div>
      <section className="relative overflow-hidden bg-[#3b2418] text-[#fff6ee]">
        <div className="pointer-events-none absolute -left-10 top-0 h-48 w-48 rounded-full bg-[#e7a15a]/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 rounded-full bg-[#f3d2b3]/10 blur-3xl" />
        <div className="relative mx-auto flex max-w-[1100px] flex-col gap-6 px-6 py-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold text-[#f6d7b8]">
              <HeartHandshake className="h-3.5 w-3.5" />
              خانه تازه برای یک دوست
            </div>
            <h1 className="text-3xl font-extrabold sm:text-4xl">واگذاری</h1>
            <p className="mt-3 text-sm leading-7 text-[#f0dccb]">
              اگر نمی‌توانید از حیوان خانگی‌تان نگهداری کنید، عکس و توضیح آگهی را ثبت کنید. آگهی بعد از تأیید مدیریت در سایت نمایش داده می‌شود.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="text-2xl font-extrabold">{items.length.toLocaleString("fa-IR")}</div>
              <div className="text-xs text-[#e7d3c2]">آگهی تأییدشده</div>
            </div>
            {status === "authenticated" ? (
              <Button type="button" className="bg-[#fff6ee] font-extrabold text-[#3b2418] hover:bg-white" onClick={() => setFormOpen(true)}>
                ثبت آگهی واگذاری
              </Button>
            ) : (
              <Button asChild className="bg-[#fff6ee] font-extrabold text-[#3b2418] hover:bg-white">
                <Link href="/login">ورود برای ثبت آگهی</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1100px] px-6 py-8">
        {status === "authenticated" && (formOpen || mine.length > 0) ? (
          <div className="mb-8 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
            {formOpen ? (
              <RehomingForm
                onCancel={() => setFormOpen(false)}
                onCreated={(listing) => {
                  setMine((current) => [listing, ...current.filter((item) => item.id !== listing.id)]);
                  setFormOpen(false);
                }}
              />
            ) : (
              <button
                type="button"
                onClick={() => setFormOpen(true)}
                className="flex min-h-40 flex-col items-start justify-center rounded-[28px] border border-dashed bg-card px-6 py-8 text-right"
              >
                <HeartHandshake className="mb-3 h-7 w-7 text-[#c17d2f]" />
                <div className="text-lg font-extrabold text-primary">آگهی تازه‌ای بنویسید</div>
                <p className="mt-1 text-sm text-muted-foreground">عکس، توضیح و شماره تماس. تا تأیید مدیر، آگهی عمومی نمی‌شود.</p>
              </button>
            )}
            <MineList
              items={mine}
              onRemove={(id) => setMine((current) => current.filter((item) => item.id !== id))}
            />
          </div>
        ) : null}

        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          <FilterChip active={species === "all"} label="همه" onClick={() => setSpecies("all")} />
          {PET_SPECIES.map((item) => (
            <FilterChip key={item.id} active={species === item.id} label={item.label} onClick={() => setSpecies(item.id)} />
          ))}
        </div>

        {shown.length === 0 ? (
          <div className="rounded-[28px] border bg-card px-6 py-16 text-center">
            <PawPrint className="mx-auto mb-3 h-10 w-10 text-[#c17d2f]" />
            <div className="font-extrabold text-primary">آگهی تأییدشده‌ای در این بخش نیست.</div>
            <p className="mt-2 text-sm text-muted-foreground">آگهی‌های تازه پس از بررسی مدیریت اینجا دیده می‌شوند.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((item) => (
              <RehomingCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full border px-3.5 py-2 text-[13px] font-semibold ${
        active ? "border-[#3b2418] bg-[#3b2418] text-[#fff6ee]" : "border-border bg-card text-muted-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function RehomingCard({ item }: { item: PublicRehoming }) {
  const place = locationLabel(item.province, item.city);
  return (
    <Link href={`/rehoming/${item.id}`} className="group overflow-hidden rounded-[28px] border bg-[#fffaf6] text-[#2b211b] shadow-[0_14px_36px_rgba(59,36,24,0.08)] transition hover:-translate-y-1">
      <div className="relative h-52 bg-[#f6e7d8]">
        <img src={item.image} alt={item.petName} className="h-full w-full object-cover" />
        <span className="absolute bottom-3 right-3 rounded-full bg-[#3b2418] px-3 py-1 text-[12px] font-bold text-[#fff6ee]">
          {rehomingSpeciesLabel(item.species)}
        </span>
      </div>
      <div className="p-4">
        <div className="text-[11px] font-bold tracking-wide text-[#c17d2f]">به دنبال خانه</div>
        <h2 className="mt-1 text-xl font-extrabold">{item.petName}</h2>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#6d5c50]">{item.description}</p>
        <div className="mt-3 flex items-center justify-between text-[13px] font-semibold text-[#8a4b12]">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {place}
          </span>
          <span className="transition group-hover:-translate-x-0.5">مشاهده آگهی</span>
        </div>
      </div>
    </Link>
  );
}

function RehomingForm({
  onCancel,
  onCreated,
}: {
  onCancel: () => void;
  onCreated: (listing: OwnerRehoming) => void;
}) {
  const [petName, setPetName] = React.useState("");
  const [species, setSpecies] = React.useState<PetSpecies>("dog");
  const [province, setProvince] = React.useState("");
  const [city, setCity] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [image, setImage] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/rehoming", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ petName, species, province, city, phone, description, image }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "ثبت آگهی انجام نشد.");
      onCreated(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ثبت آگهی انجام نشد.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-[28px] border bg-card p-5">
      <div className="mb-4">
        <h2 className="text-lg font-extrabold text-primary">آگهی واگذاری</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">پس از ثبت، آگهی تا تأیید مدیر روی سایت دیده نمی‌شود.</p>
      </div>
      <ImageUploader values={image ? [image] : []} onChange={(urls) => setImage(urls[0] || "")} max={1} folder="rehoming" label="عکس حیوان" disabled={busy} />
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label>نام حیوان</Label>
          <Input value={petName} onChange={(event) => setPetName(event.target.value)} placeholder="مثلاً میشو" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>گونه</Label>
          <select className={selectClass} value={species} onChange={(event) => setSpecies(event.target.value as PetSpecies)}>
            {PET_SPECIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>استان</Label>
          <select
            className={selectClass}
            value={province}
            onChange={(event) => {
              setProvince(event.target.value);
              setCity("");
            }}
          >
            <option value="">انتخاب استان</option>
            {IRAN_PROVINCES.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>شهر</Label>
          <select className={selectClass} value={city} disabled={!province} onChange={(event) => setCity(event.target.value)}>
            <option value="">{province ? "انتخاب شهر" : "ابتدا استان را انتخاب کنید"}</option>
            {citiesForProvince(province).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label>شماره تماس</Label>
          <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="09123456789" inputMode="tel" />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label>توضیحات</Label>
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="سن، خلق‌وخو، دلیل واگذاری و شرایط تحویل را بنویسید."
            className="min-h-[120px]"
          />
        </div>
      </div>
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      <div className="mt-4 flex gap-2">
        <Button type="submit" disabled={busy} className="font-bold">
          {busy ? "در حال ثبت..." : "ارسال برای تأیید"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          بستن
        </Button>
      </div>
    </form>
  );
}

function MineList({ items, onRemove }: { items: OwnerRehoming[]; onRemove: (id: string) => void }) {
  const remove = async (id: string) => {
    const res = await fetch(`/api/rehoming/${id}`, { method: "DELETE" });
    if (res.ok) onRemove(id);
  };

  return (
    <div className="rounded-[28px] border bg-card p-5">
      <h2 className="mb-3 text-lg font-extrabold text-primary">آگهی‌های من</h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">هنوز آگهی‌ای ثبت نکرده‌اید.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 rounded-2xl border p-3">
              <img src={item.image} alt="" className="h-16 w-16 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="truncate font-bold">{item.petName}</div>
                  <StatusBadge status={item.status} />
                </div>
                <p className="mt-1 line-clamp-2 text-[12px] text-muted-foreground">{item.description}</p>
                <button type="button" onClick={() => remove(item.id)} className="mt-1 text-[12px] font-semibold text-destructive">
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: RehomingStatus }) {
  const tone =
    status === "approved" ? "bg-accent text-primary" : status === "rejected" ? "bg-red-50 text-red-700" : "bg-[#f6ead8] text-[#8a4b12]";
  return <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${tone}`}>{rehomingStatusLabel(status)}</span>;
}

export function RehomingDetail({ item }: { item: PublicRehoming }) {
  const place = locationLabel(item.province, item.city);
  return (
    <div className="bg-[radial-gradient(circle_at_top,#e7a15a22,transparent_40%)]">
      <div className="mx-auto max-w-[920px] px-6 py-8">
        <Link href="/rehoming" className="mb-5 inline-flex text-sm font-semibold text-muted-foreground hover:text-primary">
          بازگشت به واگذاری
        </Link>
        <article className="overflow-hidden rounded-[32px] border bg-[#fffaf6] text-[#2b211b] shadow-[0_20px_50px_rgba(59,36,24,0.1)]">
          <div className="grid md:grid-cols-[340px_1fr]">
            <img src={item.image} alt={item.petName} className="h-72 w-full object-cover md:h-full md:min-h-[360px]" />
            <div className="p-6 sm:p-8">
              <div className="text-[11px] font-bold tracking-[0.16em] text-[#c17d2f]">REHOMING</div>
              <h1 className="mt-2 text-3xl font-extrabold">{item.petName}</h1>
              <p className="mt-1 text-sm text-[#6d5c50]">
                {rehomingSpeciesLabel(item.species)} · {place}
              </p>
              <p className="mt-5 whitespace-pre-wrap text-sm leading-8">{item.description}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a href={`tel:${item.phone}`} className="inline-flex items-center gap-2 rounded-full bg-[#3b2418] px-4 py-2.5 text-sm font-bold text-[#fff6ee]">
                  <Phone className="h-4 w-4" />
                  {item.phone}
                </a>
                <span className="text-[13px] text-[#6d5c50]">آگهی‌دهنده: {item.ownerName}</span>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
