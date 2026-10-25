"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { MapPin, Phone } from "lucide-react";
import { VetMap } from "@/components/vet-map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { locationLabel } from "@/lib/iran-locations";
import { reservationStatusLabel, type PublicVet, type ReservationItem, type VetCommentItem } from "@/lib/store-vet";

export function VetProfile({ vet, comments }: { vet: PublicVet; comments: VetCommentItem[] }) {
  const { data: session, status } = useSession();
  const [photo, setPhoto] = React.useState(vet.images[0] || "");
  const [commentText, setCommentText] = React.useState("");
  const [commentMessage, setCommentMessage] = React.useState("");
  const [commentError, setCommentError] = React.useState("");
  const [booking, setBooking] = React.useState({ customerName: "", customerPhone: "", petName: "", date: "", time: "", note: "" });
  const [bookingMessage, setBookingMessage] = React.useState("");
  const [bookingError, setBookingError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [mine, setMine] = React.useState<ReservationItem[]>([]);

  React.useEffect(() => {
    if (session?.user?.name) setBooking((current) => ({ ...current, customerName: current.customerName || session.user.name || "" }));
  }, [session?.user?.name]);

  React.useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/reservations?scope=mine", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return;
        const items = Array.isArray(data.items) ? data.items : [];
        setMine(items.filter((item: ReservationItem) => item.vetId === vet.id));
      })
      .catch(() => setMine([]));
  }, [status, vet.id]);

  const sendComment = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setCommentError("");
    setCommentMessage("");
    try {
      const res = await fetch(`/api/vets/${vet.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "ثبت نظر انجام نشد.");
      setCommentText("");
      setCommentMessage("نظر ثبت شد و پس از تأیید مدیریت نمایش داده می‌شود.");
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : "ثبت نظر انجام نشد.");
    } finally {
      setBusy(false);
    }
  };

  const sendBooking = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setBookingError("");
    setBookingMessage("");
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...booking, vetId: vet.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "ثبت نوبت انجام نشد.");
      setMine((current) => [data, ...current]);
      setBooking((current) => ({ ...current, petName: "", date: "", time: "", note: "" }));
      setBookingMessage("درخواست نوبت ثبت شد. دامپزشک وضعیت را در پنل خودش مشخص می‌کند.");
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "ثبت نوبت انجام نشد.");
    } finally {
      setBusy(false);
    }
  };

  const cancelMine = async (id: string) => {
    const res = await fetch(`/api/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    if (!res.ok) return;
    setMine((current) => current.map((item) => (item.id === id ? { ...item, status: "cancelled" } : item)));
  };

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-8">
      <Link href="/vets" className="mb-5 inline-flex text-sm font-semibold text-muted-foreground hover:text-primary">
        بازگشت به دامپزشکان
      </Link>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
        <div>
          <div className="overflow-hidden rounded-[28px] border bg-card">
            <div className="grid gap-2 p-3 sm:grid-cols-[2fr_1fr]">
              {photo || vet.images[0] ? (
                <img src={photo || vet.images[0]} alt={vet.name} className="h-72 w-full rounded-2xl object-cover" />
              ) : (
                <div className="flex h-72 items-center justify-center rounded-2xl bg-muted text-primary">بدون تصویر</div>
              )}
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-1">
                {vet.images.map((image) => (
                  <button key={image} type="button" onClick={() => setPhoto(image)} className="overflow-hidden rounded-xl border">
                    <img src={image} alt="" className="h-16 w-full object-cover sm:h-20" />
                  </button>
                ))}
              </div>
            </div>
            <div className="px-5 pb-5">
              <h1 className="text-3xl font-extrabold text-primary">{vet.name}</h1>
              {vet.specialty ? <p className="mt-1 text-sm text-muted-foreground">{vet.specialty}</p> : null}
              {vet.bio ? <p className="mt-4 whitespace-pre-wrap text-sm leading-7">{vet.bio}</p> : null}
              <div className="mt-4 flex flex-col gap-2 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                  <span>
                    {locationLabel(vet.province, vet.city)}
                    <br />
                    {vet.address}
                  </span>
                </div>
                <a href={`tel:${vet.phone}`} className="flex items-center gap-2 font-bold text-primary">
                  <Phone className="h-4 w-4" />
                  {vet.phone}
                </a>
              </div>
            </div>
          </div>

          {vet.lat != null && vet.lng != null ? (
            <div className="mt-5">
              <VetMap lat={vet.lat} lng={vet.lng} title={`نقشه ${vet.name}`} />
            </div>
          ) : null}

          <section className="mt-6 rounded-[28px] border bg-card p-5">
            <h2 className="mb-4 text-lg font-extrabold text-primary">نظرها</h2>
            {comments.length === 0 ? <p className="text-sm text-muted-foreground">هنوز نظر تأییدشده‌ای ثبت نشده است.</p> : null}
            <div className="flex flex-col gap-3">
              {comments.map((comment) => (
                <article key={comment.id} className="rounded-2xl border p-3">
                  <div className="text-sm font-bold">{comment.authorName}</div>
                  <p className="mt-1 text-sm leading-7 text-muted-foreground">{comment.text}</p>
                </article>
              ))}
            </div>
            {status === "authenticated" ? (
              <form onSubmit={sendComment} className="mt-4 flex flex-col gap-2">
                <Textarea value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="تجربه مراجعه خود را بنویسید" />
                {commentError ? <p className="text-sm text-destructive">{commentError}</p> : null}
                {commentMessage ? <p className="text-sm text-primary">{commentMessage}</p> : null}
                <Button type="submit" disabled={busy} className="self-start font-bold">
                  ارسال نظر
                </Button>
              </form>
            ) : (
              <Link href="/login" className="mt-4 inline-flex text-sm font-bold text-primary">
                برای نوشتن نظر وارد شوید
              </Link>
            )}
          </section>
        </div>

        <aside className="h-fit rounded-[28px] border bg-card p-5">
          <h2 className="text-lg font-extrabold text-primary">رزرو نوبت</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">درخواست شما برای دامپزشک ارسال می‌شود و وضعیت را خودش مشخص می‌کند.</p>
          {status !== "authenticated" ? (
            <Button asChild className="mt-4 font-bold">
              <Link href="/login">ورود برای رزرو</Link>
            </Button>
          ) : (
            <form onSubmit={sendBooking} className="mt-4 flex flex-col gap-3">
              <Field label="نام شما">
                <Input value={booking.customerName} onChange={(event) => setBooking({ ...booking, customerName: event.target.value })} />
              </Field>
              <Field label="شماره تماس">
                <Input value={booking.customerPhone} onChange={(event) => setBooking({ ...booking, customerPhone: event.target.value })} placeholder="09123456789" />
              </Field>
              <Field label="نام حیوان">
                <Input value={booking.petName} onChange={(event) => setBooking({ ...booking, petName: event.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="تاریخ">
                  <Input type="date" value={booking.date} onChange={(event) => setBooking({ ...booking, date: event.target.value })} />
                </Field>
                <Field label="ساعت">
                  <Input type="time" value={booking.time} onChange={(event) => setBooking({ ...booking, time: event.target.value })} />
                </Field>
              </div>
              <Field label="توضیح">
                <Textarea value={booking.note} onChange={(event) => setBooking({ ...booking, note: event.target.value })} placeholder="علائم یا دلیل مراجعه" />
              </Field>
              {bookingError ? <p className="text-sm text-destructive">{bookingError}</p> : null}
              {bookingMessage ? <p className="text-sm text-primary">{bookingMessage}</p> : null}
              <Button type="submit" disabled={busy} className="font-bold">
                ثبت درخواست نوبت
              </Button>
            </form>
          )}

          {mine.length > 0 ? (
            <div className="mt-6 border-t pt-4">
              <h3 className="mb-2 font-bold">نوبت‌های من</h3>
              <div className="flex flex-col gap-2">
                {mine.map((item) => (
                  <div key={item.id} className="rounded-xl border p-3 text-sm">
                    <div className="font-bold">
                      {item.date} · {item.time}
                    </div>
                    <div className="text-muted-foreground">{item.petName}</div>
                    <div className="mt-1 text-primary">{reservationStatusLabel(item.status)}</div>
                    {item.status === "pending" || item.status === "confirmed" ? (
                      <button type="button" onClick={() => cancelMine(item.id)} className="mt-1 text-[12px] font-semibold text-destructive">
                        لغو نوبت
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <Label>{label}</Label>
      {children}
    </label>
  );
}
