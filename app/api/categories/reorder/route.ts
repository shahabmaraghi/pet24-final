import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Category from "@/lib/models/Category";
import { requireAdmin } from "@/lib/api-helpers";
import { serializeCategory } from "@/lib/store-category";

export async function PUT(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  await dbConnect();

  const body = await req.json().catch(() => ({}));
  const ids = Array.isArray(body.ids) ? body.ids.map((id: unknown) => String(id || "").trim()).filter(Boolean) : [];
  if (!ids.length) {
    return NextResponse.json({ error: "ترتیب دسته‌ها ارسال نشده است." }, { status: 400 });
  }

  await Promise.all(
    ids.map((id: string, index: number) =>
      Category.collection.updateOne({ id }, { $set: { order: index, updatedAt: new Date() } })
    )
  );

  const items = await Category.collection.find({}).sort({ order: 1, name: 1 }).toArray();
  return NextResponse.json(items.map(serializeCategory));
}
