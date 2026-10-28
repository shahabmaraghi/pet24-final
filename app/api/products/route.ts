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
  const hasImage = searchParams.get("hasImage");
  const minPriceParam = searchParams.get("minPrice");
  const maxPriceParam = searchParams.get("maxPrice");
  const minPriceRaw = minPriceParam != null && minPriceParam !== "" ? Number(minPriceParam) : NaN;
  const maxPriceRaw = maxPriceParam != null && maxPriceParam !== "" ? Number(maxPriceParam) : NaN;
  const sortKey = searchParams.get("sort")?.trim() || "newest";
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
  if (hasImage === "1") filter["images.0"] = { $exists: true, $ne: "" };
  if (hasImage === "0") {
    filter.$or = [{ images: { $exists: false } }, { images: { $size: 0 } }, { images: null }];
  }
  const priceFilter: Record<string, number> = {};
  if (Number.isFinite(minPriceRaw) && minPriceRaw >= 0) priceFilter.$gte = minPriceRaw;
  if (Number.isFinite(maxPriceRaw) && maxPriceRaw >= 0) priceFilter.$lte = maxPriceRaw;
  if (Object.keys(priceFilter).length) filter.price = priceFilter;

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    price_asc: { price: 1, createdAt: -1 },
    price_desc: { price: -1, createdAt: -1 },
    name: { name: 1 },
  };
  const sort = sortMap[sortKey] || sortMap.newest;

  try {
    const typeFilter = { ...filter };
    delete (typeFilter as { type?: string }).type;
    delete (typeFilter as { price?: unknown }).price;
    delete (typeFilter as { $or?: unknown }).$or;
    delete (typeFilter as { "images.0"?: unknown })["images.0"];
    const baseFilter = { ...filter };
    delete (baseFilter as { type?: string }).type;
    delete (baseFilter as { price?: unknown }).price;
    delete (baseFilter as { $or?: unknown }).$or;
    delete (baseFilter as { "images.0"?: unknown })["images.0"];

    const [items, total, types, priceStats] = await withMongoRetry(async () =>
      Promise.all([
        Product.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).maxTimeMS(8000),
        Product.countDocuments(filter).maxTimeMS(8000),
        Product.distinct("type", typeFilter).maxTimeMS(8000),
        Product.aggregate([
          { $match: baseFilter },
          { $group: { _id: null, minPrice: { $min: "$price" }, maxPrice: { $max: "$price" } } },
        ]).option({ maxTimeMS: 8000 }),
      ])
    );
    const stats = Array.isArray(priceStats) && priceStats[0] ? priceStats[0] : null;
    return NextResponse.json(
      {
        items: await serializeProducts(items),
        total,
        page,
        pages: Math.ceil(total / limit) || 0,
        types: (types as string[]).filter(Boolean).sort(),
        minPrice: stats?.minPrice != null ? Number(stats.minPrice) : null,
        maxPrice: stats?.maxPrice != null ? Number(stats.maxPrice) : null,
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
    available: body.available !== false,
  });
  return NextResponse.json(await serializeProductWithBrand(product), { status: 201 });
}
