import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-helpers";
import { dbConnect } from "@/lib/db";
import VetComment from "@/lib/models/VetComment";
import { serializeVetComment } from "@/lib/store-vet";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-fA-F0-9]{24}$/.test(id)) return NextResponse.json({ error: "نظر یافت نشد." }, { status: 404 });
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    const body = await req.json().catch(() => ({}));
    const status = body.status === "approved" || body.status === "rejected" || body.status === "pending" ? body.status : "";
    if (!status) return NextResponse.json({ error: "وضعیت معتبر نیست." }, { status: 400 });
    await dbConnect();
    const comment = await VetComment.findByIdAndUpdate(id, { status }, { new: true });
    if (!comment) return NextResponse.json({ error: "نظر یافت نشد." }, { status: 404 });
    return NextResponse.json(serializeVetComment(comment));
  } catch (err) {
    console.error("PATCH /api/vet-comments/[id] failed", err);
    return NextResponse.json({ error: "به‌روزرسانی نظر انجام نشد." }, { status: 500 });
  }
}
