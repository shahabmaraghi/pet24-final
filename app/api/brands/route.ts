import { NextResponse } from "next/server";
import { withMongoRetry } from "@/lib/db";
import Brand from "@/lib/models/Brand";
import { requireAdmin } from "@/lib/api-helpers";
import { ensureBrands } from "@/lib/ensure-brands";
import { brandUpdateFromBody, serializeBrand } from "@/lib/store-brand";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";
    const items = await withMongoRetry(async () => {
      await ensureBrands();
      const filter = all ? {} : { active: { $ne: false } };
      return Brand.find(filter).sort({ order: 1, name: 1 });
    });
    return NextResponse.json(items.map(serializeBrand), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json([], { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

export async function POST(req: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const body = await req.json();
    const update = brandUpdateFromBody(body);
    if (!update.name) return NextResponse.json({ error: "نام برند را وارد کنید." }, { status: 400 });
    const brand = await withMongoRetry(async () => {
      const duplicate = await Brand.findOne({ name: update.name });
      if (duplicate) {
        const err = new Error("duplicate");
        (err as { code?: number }).code = 409;
        throw err;
      }
      if (update.order == null) {
        const last = await Brand.findOne().sort({ order: -1 });
        update.order = Number(last?.order || 0) + 1;
      }
      return Brand.create(update);
    });
    return NextResponse.json(serializeBrand(brand), { status: 201 });
  } catch (error) {
    if ((error as { code?: number })?.code === 409 || /duplicate|E11000/i.test(String((error as { message?: string })?.message || error))) {
      return NextResponse.json({ error: "این برند از قبل ثبت شده است." }, { status: 409 });
    }
    return NextResponse.json({ error: "ذخیره برند انجام نشد." }, { status: 500 });
  }
}
