import { NextResponse } from "next/server";
import { getSession, requireAdmin } from "@/lib/api-helpers";
import { dbConnect } from "@/lib/db";
import Vet from "@/lib/models/Vet";
import { isListedVet, serializeVet, vetFromBody } from "@/lib/store-vet";
import { findVetForSession } from "@/lib/vet-access";

function validId(id: string) {
  return /^[a-fA-F0-9]{24}$/.test(id);
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!validId(id)) return NextResponse.json({ error: "دامپزشک یافت نشد." }, { status: 404 });
  try {
    await dbConnect();
    const vet = await Vet.findById(id);
    if (!vet) return NextResponse.json({ error: "دامپزشک یافت نشد." }, { status: 404 });
    const session = await getSession();
    const owned = await findVetForSession(session);
    const isOwner = owned && String(owned._id) === id;
    const isAdmin = session?.user?.role === "admin";
    if (!isAdmin && !isOwner && !isListedVet(vet)) {
      return NextResponse.json({ error: "دامپزشک یافت نشد." }, { status: 404 });
    }
    return NextResponse.json(serializeVet(vet, 0, Boolean(isAdmin || isOwner)));
  } catch (err) {
    console.error("GET /api/vets/[id] failed", err);
    return NextResponse.json({ error: "بارگذاری دامپزشک انجام نشد." }, { status: 503 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!validId(id)) return NextResponse.json({ error: "دامپزشک یافت نشد." }, { status: 404 });
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "احراز هویت لازم است." }, { status: 401 });

  try {
    const body = await req.json().catch(() => ({}));
    await dbConnect();
    const current = await Vet.findById(id);
    if (!current) return NextResponse.json({ error: "دامپزشک یافت نشد." }, { status: 404 });

    if (session.user.role === "admin" && !body.name && (body.status === "pending" || body.status === "approved" || body.status === "suspended")) {
      current.status = body.status;
      await current.save();
      return NextResponse.json(serializeVet(current, 0, true));
    }

    if (session.user.role === "admin") {
      const parsed = vetFromBody(body);
      if (!parsed.value) return NextResponse.json({ error: parsed.error }, { status: 400 });
      if (parsed.value.accountEmail) {
        const taken = await Vet.findOne({ accountEmail: parsed.value.accountEmail, _id: { $ne: id } });
        if (taken) return NextResponse.json({ error: "این ایمیل به دامپزشک دیگری وصل است." }, { status: 400 });
      }
      Object.assign(current, parsed.value);
      await current.save();
      return NextResponse.json(serializeVet(current, 0, true));
    }

    const owned = await findVetForSession(session);
    if (!owned || String(owned._id) !== id) return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
    const parsed = vetFromBody({ ...body, accountEmail: current.accountEmail || "" });
    if (!parsed.value) return NextResponse.json({ error: parsed.error }, { status: 400 });
    Object.assign(current, parsed.value);
    await current.save();
    return NextResponse.json(serializeVet(current, 0, true));
  } catch (err) {
    console.error("PATCH /api/vets/[id] failed", err);
    return NextResponse.json({ error: "به‌روزرسانی دامپزشک انجام نشد." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!validId(id)) return NextResponse.json({ error: "دامپزشک یافت نشد." }, { status: 404 });
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    await dbConnect();
    const removed = await Vet.findByIdAndDelete(id);
    if (!removed) return NextResponse.json({ error: "دامپزشک یافت نشد." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/vets/[id] failed", err);
    return NextResponse.json({ error: "حذف دامپزشک انجام نشد." }, { status: 500 });
  }
}
