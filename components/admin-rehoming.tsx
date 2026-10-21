"use client";

import * as React from "react";
import { locationLabel } from "@/lib/iran-locations";
import { Button } from "@/components/ui/button";
import { rehomingSpeciesLabel, rehomingStatusLabel, type OwnerRehoming, type RehomingStatus } from "@/lib/store-rehoming";

const FILTERS: { id: "pending" | "approved" | "rejected" | "all"; label: string }[] = [
  { id: "pending", label: "در انتظار تأیید" },
  { id: "approved", label: "منتشر شده" },
  { id: "rejected", label: "رد شده" },
  { id: "all", label: "همه" },
];

export function AdminRehoming() {
  const [items, setItems] = React.useState<OwnerRehoming[]>([]);
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]["id"]>("pending");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(true);

  const load = React.useCallback(() => {
    setBusy(true);
    setError("");
    fetch("/api/rehoming?status=all", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "بارگذاری آگهی‌ها انجام نشد.");
        setItems(Array.isArray(data.items) ? data.items : []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "بارگذاری آگهی‌ها انجام نشد."))
      .finally(() => setBusy(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id: string, status: RehomingStatus) => {
    const res = await fetch(`/api/rehoming/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "به‌روزرسانی انجام نشد.");
      return;
    }
    setItems((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  const remove = async (id: string) => {
    const res = await fetch(`/api/rehoming/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("حذف انجام نشد.");
      return;
    }
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const shown = filter === "all" ? items : items.filter((item) => item.status === filter);

  return (
    <>
      <h1 className="mb-2 text-[22px] font-extrabold text-primary">آگهی‌های واگذاری</h1>
      <p className="mb-5 text-sm text-muted-foreground">فقط آگهی‌های تأییدشده در بخش واگذاری سایت دیده می‌شوند.</p>
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`rounded-full border px-3.5 py-2 text-[13px] font-semibold ${
              filter === item.id ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
      {busy ? (
        <div className="py-10 text-center text-sm text-muted-foreground">در حال بارگذاری...</div>
      ) : shown.length === 0 ? (
        <div className="rounded-xl border bg-card py-8 text-center text-sm text-muted-foreground">آگهی‌ای در این وضعیت نیست.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {shown.map((item) => (
            <article key={item.id} className="grid gap-4 rounded-2xl border bg-card p-4 sm:grid-cols-[140px_1fr]">
              <img src={item.image} alt={item.petName} className="h-36 w-full rounded-xl object-cover sm:h-full" />
              <div>
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-extrabold text-primary">{item.petName}</h2>
                  <span className="text-xs font-bold text-[#c17d2f]">{rehomingStatusLabel(item.status)}</span>
                </div>
                <div className="mb-2 text-[13px] text-muted-foreground">
                  {rehomingSpeciesLabel(item.species)} · {locationLabel(item.province, item.city)} · {item.ownerName} · {item.phone}
                </div>
                <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{item.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.status !== "approved" ? (
                    <Button type="button" size="sm" className="font-bold" onClick={() => updateStatus(item.id, "approved")}>
                      تأیید و انتشار
                    </Button>
                  ) : null}
                  {item.status !== "rejected" ? (
                    <Button type="button" size="sm" variant="outline" className="font-bold" onClick={() => updateStatus(item.id, "rejected")}>
                      رد آگهی
                    </Button>
                  ) : null}
                  <Button type="button" size="sm" variant="outline" className="font-bold text-destructive" onClick={() => remove(item.id)}>
                    حذف
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
