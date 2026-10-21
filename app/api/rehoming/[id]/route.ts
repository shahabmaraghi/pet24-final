import { NextResponse } from "next/server";
import { requireAdmin, requireAuth } from "@/lib/api-helpers";
import { accountOwnerKey } from "@/lib/account-owner";
import { dbConnect } from "@/lib/db";
import Rehoming from "@/lib/models/Rehoming";
import { serializeOwnerRehoming } from "@/lib/store-rehoming";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-fA-F0-9]{24}$/.test(id)) return NextResponse.json({ error: "آگهی یافت نشد." }, { status: 404 });
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json().catch(() => ({}));
    const status = body.status === "approved" || body.status === "rejected" || body.status === "pending" ? body.status : "";
    if (!status) return NextResponse.json({ error: "وضعیت معتبر نیست." }, { status: 400 });

    await dbConnect();
    const listing = await Rehoming.findByIdAndUpdate(id, { status }, { new: true });
    if (!listing) return NextResponse.json({ error: "آگهی یافت نشد." }, { status: 404 });
    return NextResponse.json(serializeOwnerRehoming(listing));
  } catch (err) {
    console.error("PATCH /api/rehoming/[id] failed", err);
    return NextResponse.json({ error: "به‌روزرسانی آگهی انجام نشد." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-fA-F0-9]{24}$/.test(id)) return NextResponse.json({ error: "آگهی یافت نشد." }, { status: 404 });

  const { session, error } = await requireAuth();
  if (error || !session) return error;

  try {
    await dbConnect();
    if (session.user.role === "admin") {
      const removed = await Rehoming.findByIdAndDelete(id);
      if (!removed) return NextResponse.json({ error: "آگهی یافت نشد." }, { status: 404 });
      return NextResponse.json({ ok: true });
    }

    const ownerKey = accountOwnerKey(session);
    const removed = await Rehoming.findOneAndDelete({ _id: id, ownerKey });
    if (!removed) return NextResponse.json({ error: "آگهی یافت نشد." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/rehoming/[id] failed", err);
    return NextResponse.json({ error: "حذف آگهی انجام نشد." }, { status: 500 });
  }
}
