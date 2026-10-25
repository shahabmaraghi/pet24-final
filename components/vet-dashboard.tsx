"use client";

import * as React from "react";
import Link from "next/link";
import { listingStatusLabel, reservationStatusLabel, type ManagedVet, type ReservationItem, type ReservationStatus } from "@/lib/store-vet";

export function VetDashboard() {
  const [vet, setVet] = React.useState<ManagedVet | null>(null);
  const [items, setItems] = React.useState<ReservationItem[]>([]);

  React.useEffect(() => {
    fetch("/api/vet/me", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (res.ok) setVet(data);
      })
      .catch(() => setVet(null));
    fetch("/api/reservations?scope=vet", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (res.ok) setItems(Array.isArray(data.items) ? data.items : []);
      })
      .catch(() => setItems([]));
  }, []);

  const count = (status: ReservationStatus) => items.filter((item) => item.status === status).length;

  return (
    <>
      <h1 className="text-[22px] font-extrabold text-primary">داشبورد کلینیک {vet?.name || ""}</h1>
      <p className="mt-1 text-sm text-muted-foreground">این پنل فقط برای دامپزشک همین حساب است و با پنل مشتریان فرق دارد.</p>
      {vet?.listingStatus === "pending" ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-950">
          کلینیک هنوز در سایت عمومی دیده نمی‌شود. بعد از تأیید مدیر Pet24، در فهرست دامپزشکان منتشر می‌شود. تا آن زمان می‌توانید پروفایل، عکس‌ها و نقشه را کامل کنید.
        </div>
      ) : null}
      {vet?.listingStatus === "suspended" ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          نمایش عمومی این کلینیک توسط مدیر متوقف شده است.
        </div>
      ) : null}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Stat label={reservationStatusLabel("pending")} value={count("pending")} />
        <Stat label={reservationStatusLabel("confirmed")} value={count("confirmed")} />
        <Stat label="وضعیت انتشار" value={listingStatusLabel(vet?.listingStatus)} />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <PanelLink href="/vet/reservations" title="نوبت‌ها" text="تأیید، انجام یا لغو درخواست‌ها و دیدن شماره صاحب حیوان" />
        <PanelLink href="/vet/contact" title="پروفایل کلینیک" text="نام، عکس، تخصص، آدرس، تلفن و موقعیت نقشه" />
        <PanelLink href="/vet/comments" title="نظرهای کلینیک" text="نظرهای مراجعه‌کنندگان؛ انتشار فقط بعد از تأیید مدیر سایت" />
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-extrabold text-primary">{typeof value === "number" ? value.toLocaleString("fa-IR") : value}</div>
    </div>
  );
}

function PanelLink({ href, title, text }: { href: string; title: string; text: string }) {
  return (
    <Link href={href} className="rounded-2xl border bg-card p-4 hover:border-primary">
      <div className="font-extrabold text-primary">{title}</div>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
    </Link>
  );
}
