import { NextResponse } from "next/server";
import { withMongoRetry } from "@/lib/db";
import Faq from "@/lib/models/Faq";
import { requireAdmin } from "@/lib/api-helpers";
import { ensureFaqs } from "@/lib/ensure-faqs";
import { faqUpdateFromBody, serializeFaq } from "@/lib/store-faq";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";
    const items = await withMongoRetry(async () => {
      await ensureFaqs();
      const filter = all ? {} : { active: { $ne: false } };
      return Faq.find(filter).sort({ order: 1, createdAt: 1 });
    });
    return NextResponse.json(items.map(serializeFaq), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json([], { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

export async function POST(req: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const body = await req.json();
    const update = faqUpdateFromBody(body);
    if (!update.question) return NextResponse.json({ error: "سؤال را وارد کنید." }, { status: 400 });
    if (!update.answer) return NextResponse.json({ error: "پاسخ را وارد کنید." }, { status: 400 });
    const faq = await withMongoRetry(async () => {
      if (update.order == null) {
        const last = await Faq.findOne().sort({ order: -1 });
        update.order = Number(last?.order || 0) + 1;
      }
      return Faq.create(update);
    });
    return NextResponse.json(serializeFaq(faq), { status: 201 });
  } catch {
    return NextResponse.json({ error: "ذخیره سؤال انجام نشد." }, { status: 500 });
  }
}
