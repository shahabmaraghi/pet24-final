"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { reservationStatusLabel, type ReservationItem, type ReservationStatus } from "@/lib/store-vet";

const NEXT: ReservationStatus[] = ["pending", "confirmed", "done", "cancelled"];

export function VetReservations() {
  const [items, setItems] = React.useState<ReservationItem[]>([]);
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/reservations?scope=vet", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "بارگذاری نوبت‌ها انجام نشد.");
        setItems(Array.isArray(data.items) ? data.items : []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "بارگذاری نوبت‌ها انجام نشد."))
      .finally(() => setBusy(false));
  }, []);

  const update = async (id: string, status: ReservationStatus) => {
    const res = await fetch(`/api/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      setError("به‌روزرسانی وضعیت انجام نشد.");
      return;
    }
    setItems((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  return (
    <>
      <h1 className="mb-2 text-[22px] font-extrabold text-primary">نوبت‌های مراجعه‌کنندگان</h1>
      <p className="mb-5 text-sm text-muted-foreground">شماره تماس صاحب حیوان کنار هر درخواست است. وضعیت را از همین‌جا عوض کنید.</p>
      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
      {busy ? <div className="text-sm text-muted-foreground">در حال بارگذاری...</div> : null}
      {!busy && items.length === 0 ? <div className="rounded-2xl border bg-card py-10 text-center text-sm text-muted-foreground">هنوز نوبتی ثبت نشده است.</div> : null}
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="text-lg font-extrabold text-primary">{item.customerName}</div>
                <a href={`tel:${item.customerPhone}`} className="text-sm font-bold text-primary">{item.customerPhone}</a>
              </div>
              <div className="text-sm font-bold">{item.date} · {item.time}</div>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">حیوان: {item.petName}</div>
            {item.note ? <p className="mt-1 text-sm leading-7">{item.note}</p> : null}
            <div className="mt-3 text-sm font-bold text-[#8a4b12]">{reservationStatusLabel(item.status)}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {NEXT.filter((status) => status !== item.status).map((status) => (
                <Button key={status} type="button" size="sm" variant={status === "cancelled" ? "outline" : "default"} className="font-bold" onClick={() => update(item.id, status)}>
                  {reservationStatusLabel(status)}
                </Button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
