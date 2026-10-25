import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import { dbConnect } from "@/lib/db";
import Vet from "@/lib/models/Vet";
import VetComment from "@/lib/models/VetComment";
import { serializeVetComment } from "@/lib/store-vet";
import { sessionOwnerKey } from "@/lib/vet-access";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-fA-F0-9]{24}$/.test(id)) return NextResponse.json({ items: [] });
  try {
    await dbConnect();
    const items = await VetComment.find({ vetId: id, status: "approved" }).sort({ createdAt: -1 }).limit(50);
    return NextResponse.json({ items: items.map(serializeVetComment) });
  } catch (err) {
    console.error("GET vet comments failed", err);
    return NextResponse.json({ error: "بارگذاری نظرها انجام نشد." }, { status: 503 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-fA-F0-9]{24}$/.test(id)) return NextResponse.json({ error: "دامپزشک یافت نشد." }, { status: 404 });
  const { session, error } = await requireAuth();
  if (error || !session) return error;
  const ownerKey = sessionOwnerKey(session);
  if (!ownerKey) return NextResponse.json({ error: "حساب نامعتبر است." }, { status: 400 });

  try {
    const body = await req.json().catch(() => ({}));
    const text = String(body.text || "").trim();
    if (text.length < 5 || text.length > 500) {
      return NextResponse.json({ error: "نظر باید بین ۵ تا ۵۰۰ حرف باشد." }, { status: 400 });
    }
    await dbConnect();
    const vet = await Vet.findById(id);
    if (!vet) return NextResponse.json({ error: "دامپزشک یافت نشد." }, { status: 404 });
    const comment = await VetComment.create({
      vetId: vet._id,
      ownerKey,
      authorName: String(session.user.name || "").trim() || "کاربر Pet24",
      text,
      status: "pending",
    });
    return NextResponse.json(serializeVetComment(comment), { status: 201 });
  } catch (err) {
    console.error("POST vet comment failed", err);
    return NextResponse.json({ error: "ثبت نظر انجام نشد." }, { status: 500 });
  }
}
