import { NextResponse } from "next/server";
import { dbConnect, withMongoRetry } from "@/lib/db";
import Product from "@/lib/models/Product";
import { requireAdmin } from "@/lib/api-helpers";
import { canonicalCategoryId, categoryIdAliases } from "@/lib/category-id";
import { parseBrandId } from "@/lib/store-product";
import { serializeProductWithBrand, serializeProducts } from "@/lib/attach-product-brands";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId");
  const brandId = parseBrandId(searchParams.get("brandId"));
  const featured = searchParams.get("featured");
  const type = searchParams.get("type")?.trim() || "";
  const q = searchParams.get("q");
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.min(48, Math.max(1, Number(searchParams.get("limit") || 24)));
  const filter: Record<string, unknown> = {};
  if (categoryId) {
    const aliases = categoryIdAliases(categoryId);
    filter.categoryId = aliases.length > 1 ? { $in: aliases } : aliases[0];
  }
  if (brandId) filter.brandId = brandId;
  if (featured) filter.featured = true;
  if (type) filter.type = type;
  if (q) filter.name = { $regex: q, $options: "i" };

  try {
    const typeFilter = { ...filter };
    delete (typeFilter as { type?: string }).type;
    const [items, total, types] = await withMongoRetry(async () =>
      Promise.all([
        Product.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).maxTimeMS(8000),
        Product.countDocuments(filter).maxTimeMS(8000),
        Product.distinct("type", typeFilter).maxTimeMS(8000),
      ])
    );
    return NextResponse.json(
      {
        items: await serializeProducts(items),
        total,
        page,
        pages: Math.ceil(total / limit) || 0,
        types: (types as string[]).filter(Boolean).sort(),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (lastError) {
    console.error("GET /api/products failed", lastError);
    return NextResponse.json({ items: [], total: 0, page, pages: 0, types: [] }, { headers: { "Cache-Control": "no-store" } });
  }
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
    categoryId: canonicalCategoryId(String(body.categoryId)),
    brandId: parseBrandId(body.brandId),
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
  return NextResponse.json(await serializeProductWithBrand(product), { status: 201 });
}
