import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import { dbConnect } from "@/lib/db";
import VetReservation from "@/lib/models/VetReservation";
import { serializeReservation, type ReservationStatus } from "@/lib/store-vet";
import { findVetForSession, sessionOwnerKey } from "@/lib/vet-access";

const STATUSES = new Set<ReservationStatus>(["pending", "confirmed", "done", "cancelled"]);

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-fA-F0-9]{24}$/.test(id)) return NextResponse.json({ error: "نوبت یافت نشد." }, { status: 404 });
  const { session, error } = await requireAuth();
  if (error || !session) return error;

  try {
    const body = await req.json().catch(() => ({}));
    const status = STATUSES.has(body.status) ? (body.status as ReservationStatus) : null;
    if (!status) return NextResponse.json({ error: "وضعیت معتبر نیست." }, { status: 400 });

    await dbConnect();
    const reservation = await VetReservation.findById(id);
    if (!reservation) return NextResponse.json({ error: "نوبت یافت نشد." }, { status: 404 });

    const vet = await findVetForSession(session);
    const isVet = vet && String(vet._id) === String(reservation.vetId);
    const isOwner = sessionOwnerKey(session) === reservation.ownerKey;
    const isAdmin = session.user.role === "admin";

    if (isAdmin || isVet) {
      reservation.status = status;
    } else if (isOwner && status === "cancelled") {
      reservation.status = "cancelled";
    } else {
      return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
    }

    await reservation.save();
    const populated = await reservation.populate({ path: "vetId", select: "name" });
    return NextResponse.json(serializeReservation(populated));
  } catch (err) {
    console.error("PATCH /api/reservations/[id] failed", err);
    return NextResponse.json({ error: "به‌روزرسانی نوبت انجام نشد." }, { status: 500 });
  }
}
