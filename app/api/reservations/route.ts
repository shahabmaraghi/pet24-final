import { NextResponse } from "next/server";
import { requireAdmin, requireAuth } from "@/lib/api-helpers";
import { dbConnect } from "@/lib/db";
import Vet from "@/lib/models/Vet";
import VetReservation from "@/lib/models/VetReservation";
import { reservationFromBody, serializeReservation } from "@/lib/store-vet";
import { findVetForSession, sessionOwnerKey } from "@/lib/vet-access";

export async function GET(req: Request) {
  const scope = new URL(req.url).searchParams.get("scope") || "mine";
  const { session, error } = await requireAuth();
  if (error || !session) return error;

  try {
    await dbConnect();
    if (scope === "admin") {
      const admin = await requireAdmin();
      if (admin.error) return admin.error;
      const items = await VetReservation.find().sort({ date: 1, time: 1 }).limit(300).populate({ path: "vetId", select: "name" });
      return NextResponse.json({ items: items.map(serializeReservation) });
    }

    if (scope === "vet") {
      const vet = await findVetForSession(session);
      if (!vet) return NextResponse.json({ error: "پنل دامپزشک برای این حساب فعال نیست." }, { status: 403 });
      const items = await VetReservation.find({ vetId: vet._id }).sort({ date: 1, time: 1 }).populate({ path: "vetId", select: "name" });
      return NextResponse.json({ items: items.map(serializeReservation), vetId: String(vet._id) });
    }

    const ownerKey = sessionOwnerKey(session);
    const items = await VetReservation.find({ ownerKey }).sort({ date: -1, time: -1 }).populate({ path: "vetId", select: "name" });
    return NextResponse.json({ items: items.map(serializeReservation) });
  } catch (err) {
    console.error("GET /api/reservations failed", err);
    return NextResponse.json({ error: "بارگذاری نوبت‌ها انجام نشد." }, { status: 503 });
  }
}

export async function POST(req: Request) {
  const { session, error } = await requireAuth();
  if (error || !session) return error;
  const ownerKey = sessionOwnerKey(session);
  if (!ownerKey) return NextResponse.json({ error: "حساب نامعتبر است." }, { status: 400 });

  try {
    const body = await req.json().catch(() => ({}));
    const vetId = String(body.vetId || "");
    if (!/^[a-fA-F0-9]{24}$/.test(vetId)) return NextResponse.json({ error: "دامپزشک یافت نشد." }, { status: 404 });
    const parsed = reservationFromBody(body);
    if (!parsed.value) return NextResponse.json({ error: parsed.error }, { status: 400 });

    await dbConnect();
    const vet = await Vet.findById(vetId);
    if (!vet) return NextResponse.json({ error: "دامپزشک یافت نشد." }, { status: 404 });
    const reservation = await VetReservation.create({
      vetId: vet._id,
      ownerKey,
      status: "pending",
      ...parsed.value,
    });
    return NextResponse.json(serializeReservation({ ...reservation.toObject(), vetId: { _id: vet._id, name: vet.name } }), { status: 201 });
  } catch (err) {
    console.error("POST /api/reservations failed", err);
    return NextResponse.json({ error: "ثبت نوبت انجام نشد." }, { status: 500 });
  }
}
