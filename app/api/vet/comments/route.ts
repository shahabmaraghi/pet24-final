import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import { dbConnect } from "@/lib/db";
import VetComment from "@/lib/models/VetComment";
import { serializeVetComment } from "@/lib/store-vet";
import { findVetForSession } from "@/lib/vet-access";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error || !session) return error;
  try {
    const vet = await findVetForSession(session);
    if (!vet) return NextResponse.json({ error: "پنل دامپزشک برای این حساب فعال نیست." }, { status: 404 });
    await dbConnect();
    const items = await VetComment.find({ vetId: vet._id }).sort({ createdAt: -1 }).limit(100);
    return NextResponse.json({ items: items.map(serializeVetComment) });
  } catch (err) {
    console.error("GET /api/vet/comments failed", err);
    return NextResponse.json({ error: "بارگذاری نظرها انجام نشد." }, { status: 503 });
  }
}
