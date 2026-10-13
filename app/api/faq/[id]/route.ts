import { NextResponse } from "next/server";
import { withMongoRetry } from "@/lib/db";
import Faq from "@/lib/models/Faq";
import { requireAdmin } from "@/lib/api-helpers";
import { faqUpdateFromBody, serializeFaq } from "@/lib/store-faq";

const OBJECT_ID = /^[a-fA-F0-9]{24}$/;

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!OBJECT_ID.test(id)) return NextResponse.json({ error: "شناسه نامعتبر است." }, { status: 400 });
    const { error } = await requireAdmin();
    if (error) return error;
    const body = await req.json();
    const update = faqUpdateFromBody(body);
    if (update.question === "") return NextResponse.json({ error: "سؤال را وارد کنید." }, { status: 400 });
    if (update.answer === "") return NextResponse.json({ error: "پاسخ را وارد کنید." }, { status: 400 });
    const faq = await withMongoRetry(async () => Faq.findByIdAndUpdate(id, update, { new: true }));
    if (!faq) return NextResponse.json({ error: "سؤال یافت نشد." }, { status: 404 });
    return NextResponse.json(serializeFaq(faq));
  } catch {
    return NextResponse.json({ error: "ذخیره سؤال انجام نشد." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!OBJECT_ID.test(id)) return NextResponse.json({ error: "شناسه نامعتبر است." }, { status: 400 });
    const { error } = await requireAdmin();
    if (error) return error;
    await withMongoRetry(async () => Faq.findByIdAndDelete(id));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "حذف سؤال انجام نشد." }, { status: 500 });
  }
}
