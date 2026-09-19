import { NextResponse } from "next/server";
import { withMongoRetry } from "@/lib/db";
import Slide from "@/lib/models/Slide";
import { requireAdmin } from "@/lib/api-helpers";
import { serializeSlide, slideUpdateFromBody } from "@/lib/store-slide";

export async function GET() {
  try {
    const items = await withMongoRetry(async () => Slide.find().sort({ order: 1 }));
    return NextResponse.json(items.map(serializeSlide), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json([], { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

export async function POST(req: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const body = await req.json();
    const update = slideUpdateFromBody(body);
    if (!update.title) return NextResponse.json({ error: "عنوان الزامی است." }, { status: 400 });
    const slide = await withMongoRetry(async () => Slide.create(update));
    return NextResponse.json(serializeSlide(slide), { status: 201 });
  } catch {
    return NextResponse.json({ error: "ذخیره اسلاید انجام نشد." }, { status: 500 });
  }
}
