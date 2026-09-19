import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Category from "@/lib/models/Category";
import { requireAdmin } from "@/lib/api-helpers";
import { serializeCategory } from "@/lib/store-category";

function slugFilter(id: string) {
  return { id: decodeURIComponent(id) };
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();
  const category = await Category.collection.findOne(slugFilter(id));
  if (!category || category.active === false) {
    return NextResponse.json({ error: "دسته‌بندی یافت نشد." }, { status: 404 });
  }
  return NextResponse.json(serializeCategory(category));
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await requireAdmin();
  if (error) return error;
  await dbConnect();
  const body = await req.json();
  const update: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim()) update.name = body.name.trim();
  if (typeof body.tint === "string") update.tint = body.tint;
  if (typeof body.image === "string") update.image = body.image;
  if (typeof body.active === "boolean") update.active = body.active;
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "تغییری ارسال نشده است." }, { status: 400 });
  }
  const raw = await Category.collection.findOneAndUpdate(slugFilter(id), { $set: update }, { returnDocument: "after" }) as { id?: string; value?: Record<string, unknown> } | null;
  const category = raw && ("id" in raw && raw.id ? raw : raw.value);
  if (!category) return NextResponse.json({ error: "دسته‌بندی یافت نشد." }, { status: 404 });
  return NextResponse.json(serializeCategory(category));
}
