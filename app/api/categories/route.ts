import { NextResponse } from "next/server";
import { dbConnect, withMongoRetry } from "@/lib/db";
import Category from "@/lib/models/Category";
import { requireAdmin } from "@/lib/api-helpers";
import { categoryIdFromName } from "@/lib/category-id";
import { ACTIVE_CATEGORY_FILTER, serializeCategory } from "@/lib/store-category";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const includeInactive = searchParams.get("all") === "true";
  try {
    const items = await withMongoRetry(async () =>
      Category.collection
        .find(includeInactive ? {} : ACTIVE_CATEGORY_FILTER)
        .sort({ name: 1 })
        .toArray()
    );
    return NextResponse.json(items.map(serializeCategory), { headers: { "Cache-Control": "no-store" } });
  } catch (lastError) {
    console.error("GET /api/categories failed", lastError);
    return NextResponse.json([], { status: 200, headers: { "Cache-Control": "no-store" } });
  }
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  await dbConnect();
  const body = await req.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "نام الزامی است." }, { status: 400 });
  let id = typeof body.id === "string" && body.id.trim() ? body.id.trim() : categoryIdFromName(name);
  const taken = await Category.findOne({ $or: [{ id }, { name }] });
  if (taken) {
    if (taken.name === name) return NextResponse.json({ error: "این دسته‌بندی از قبل وجود دارد." }, { status: 409 });
    id = `${id}-${Date.now()}`;
  }
  const category = await Category.create({
    id,
    name,
    tint: body.tint || "#6b7280",
    image: body.image,
    active: body.active !== false,
  });
  return NextResponse.json(serializeCategory(category.toObject()), { status: 201 });
}
