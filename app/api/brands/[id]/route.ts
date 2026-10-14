import { NextResponse } from "next/server";
import { withMongoRetry } from "@/lib/db";
import Brand from "@/lib/models/Brand";
import { requireAdmin } from "@/lib/api-helpers";
import { getStoreBrand } from "@/lib/get-store-brands";
import { brandUpdateFromBody, serializeBrand } from "@/lib/store-brand";

const OBJECT_ID = /^[a-fA-F0-9]{24}$/;

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const brand = await getStoreBrand(id);
    if (!brand) return NextResponse.json({ error: "برند یافت نشد." }, { status: 404 });
    return NextResponse.json(brand, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "بارگذاری برند انجام نشد." }, { status: 503 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!OBJECT_ID.test(id)) return NextResponse.json({ error: "شناسه نامعتبر است." }, { status: 400 });
    const { error } = await requireAdmin();
    if (error) return error;
    const body = await req.json();
    const update = brandUpdateFromBody(body);
    if (update.name === "") return NextResponse.json({ error: "نام برند را وارد کنید." }, { status: 400 });
    const brand = await withMongoRetry(async () => Brand.findByIdAndUpdate(id, update, { new: true }));
    if (!brand) return NextResponse.json({ error: "برند یافت نشد." }, { status: 404 });
    return NextResponse.json(serializeBrand(brand));
  } catch (error) {
    if (/duplicate|E11000/i.test(String((error as { message?: string })?.message || error))) {
      return NextResponse.json({ error: "این برند از قبل ثبت شده است." }, { status: 409 });
    }
    return NextResponse.json({ error: "ذخیره برند انجام نشد." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!OBJECT_ID.test(id)) return NextResponse.json({ error: "شناسه نامعتبر است." }, { status: 400 });
    const { error } = await requireAdmin();
    if (error) return error;
    await withMongoRetry(async () => Brand.findByIdAndDelete(id));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "حذف برند انجام نشد." }, { status: 500 });
  }
}
