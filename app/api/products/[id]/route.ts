import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Product from "@/lib/models/Product";
import { requireAdmin } from "@/lib/api-helpers";
import { canonicalCategoryId } from "@/lib/category-id";
import { parseBrandId } from "@/lib/store-product";
import { serializeProductWithBrand } from "@/lib/attach-product-brands";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();
  const product = await Product.findById(id);
  if (!product) return NextResponse.json({ error: "محصول یافت نشد." }, { status: 404 });
  return NextResponse.json(await serializeProductWithBrand(product), { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await requireAdmin();
  if (error) return error;
  await dbConnect();
  const body = await req.json();
  if (Array.isArray(body.images)) body.images = body.images.map(String).filter(Boolean);
  if (body.brandId !== undefined) body.brandId = parseBrandId(body.brandId);
  if (body.categoryId !== undefined) body.categoryId = canonicalCategoryId(String(body.categoryId));
  const product = await Product.findByIdAndUpdate(id, body, { new: true });
  if (!product) return NextResponse.json({ error: "محصول یافت نشد." }, { status: 404 });
  return NextResponse.json(await serializeProductWithBrand(product));
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await requireAdmin();
  if (error) return error;
  await dbConnect();
  await Product.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
