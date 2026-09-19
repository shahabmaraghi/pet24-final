import { NextResponse } from "next/server";
import { dbConnect, resetMongoCache } from "@/lib/db";
import Product from "@/lib/models/Product";
import { requireAdmin } from "@/lib/api-helpers";
import { serializeProduct } from "@/lib/store-product";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId");
  const featured = searchParams.get("featured");
  const q = searchParams.get("q");
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 24);
  const filter: Record<string, unknown> = {};
  if (categoryId) filter.categoryId = categoryId;
  if (featured) filter.featured = true;
  if (q) filter.name = { $regex: q, $options: "i" };

  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await dbConnect();
      const [items, total] = await Promise.all([
        Product.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
        Product.countDocuments(filter),
      ]);
      return NextResponse.json(
        { items: items.map(serializeProduct), total, page, pages: Math.ceil(total / limit) },
        { headers: { "Cache-Control": "no-store" } }
      );
    } catch (error) {
      lastError = error;
      await resetMongoCache();
    }
  }
  console.error("GET /api/products failed", lastError);
  return NextResponse.json({ items: [], total: 0, page, pages: 0 }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  await dbConnect();
  const body = await req.json();
  if (!body.name || !body.categoryId || body.price == null) {
    return NextResponse.json({ error: "نام، دسته‌بندی و قیمت الزامی است." }, { status: 400 });
  }
  const product = await Product.create({
    name: String(body.name).trim(),
    categoryId: String(body.categoryId),
    type: body.type || "عمومی",
    price: Number(body.price),
    oldPrice: body.oldPrice != null ? Number(body.oldPrice) : undefined,
    badge: body.badge,
    featured: body.featured !== false,
    desc: body.desc || "",
    specs: Array.isArray(body.specs) ? body.specs : [],
    images: Array.isArray(body.images) ? body.images.map(String).filter(Boolean) : [],
    stock: body.stock != null ? Number(body.stock) : 100,
  });
  return NextResponse.json(serializeProduct(product), { status: 201 });
}
