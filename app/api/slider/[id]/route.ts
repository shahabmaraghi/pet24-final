import { NextResponse } from "next/server";
import { withMongoRetry } from "@/lib/db";
import Slide from "@/lib/models/Slide";
import { requireAdmin } from "@/lib/api-helpers";
import { serializeSlide, slideUpdateFromBody } from "@/lib/store-slide";

const OBJECT_ID = /^[a-fA-F0-9]{24}$/;

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!OBJECT_ID.test(id)) return NextResponse.json({ error: "شناسه اسلاید نامعتبر است." }, { status: 400 });
    const { error } = await requireAdmin();
    if (error) return error;
    const body = await req.json();
    const update = slideUpdateFromBody(body);
    if (update.title === "") return NextResponse.json({ error: "عنوان الزامی است." }, { status: 400 });
    const slide = await withMongoRetry(async () => Slide.findByIdAndUpdate(id, update, { new: true }));
    if (!slide) return NextResponse.json({ error: "اسلاید یافت نشد." }, { status: 404 });
    return NextResponse.json(serializeSlide(slide));
  } catch (error) {
    const message = String((error as { message?: string })?.message || "");
    if (/CastError|ObjectId/i.test(message)) {
      return NextResponse.json({ error: "اسلاید یافت نشد." }, { status: 404 });
    }
    return NextResponse.json({ error: "ذخیره اسلاید انجام نشد." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!OBJECT_ID.test(id)) return NextResponse.json({ error: "شناسه اسلاید نامعتبر است." }, { status: 400 });
    const { error } = await requireAdmin();
    if (error) return error;
    await withMongoRetry(async () => Slide.findByIdAndDelete(id));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "حذف اسلاید انجام نشد." }, { status: 500 });
  }
}
