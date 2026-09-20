import { NextResponse } from "next/server";
import { dbConnect, withMongoRetry } from "@/lib/db";
import Review from "@/lib/models/Review";
import { getSession, requireAdmin } from "@/lib/api-helpers";

function serializeReview(doc: {
  _id?: unknown;
  id?: unknown;
  author?: string;
  text?: string;
  rating?: number;
  status?: string;
  adminReply?: string;
  createdAt?: Date | string;
  productId?: unknown;
}) {
  const product = doc.productId && typeof doc.productId === "object" && "name" in (doc.productId as object)
    ? (doc.productId as { _id?: unknown; name?: string })
    : null;
  return {
    id: String(doc._id ?? doc.id ?? ""),
    author: String(doc.author || ""),
    text: String(doc.text || ""),
    rating: Number(doc.rating || 0),
    status: doc.status === "rejected" || doc.status === "pending" ? doc.status : "approved",
    adminReply: String(doc.adminReply || ""),
    createdAt: doc.createdAt,
    productName: String(product?.name || ""),
    productId: String(product?._id ?? doc.productId ?? ""),
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const status = searchParams.get("status") || "approved";

  if (!productId) {
    const { error } = await requireAdmin();
    if (error) return error;
    try {
      const filter = status === "all" ? {} : { status };
      const items = await withMongoRetry(async () => {
        try {
          return await Review.find(filter).populate({ path: "productId", select: "name", strictPopulate: false }).sort({ createdAt: -1 }).lean();
        } catch {
          return await Review.find(filter).sort({ createdAt: -1 }).lean();
        }
      });
      return NextResponse.json(items.map(serializeReview));
    } catch (error) {
      console.error("GET /api/reviews failed", error);
      return NextResponse.json({ error: "بارگذاری نظرات انجام نشد." }, { status: 503 });
    }
  }

  try {
    const items = await withMongoRetry(() =>
      Review.find({ productId, status: "approved" }).sort({ createdAt: -1 }).lean()
    );
    return NextResponse.json(items.map(serializeReview));
  } catch (error) {
    console.error("GET /api/reviews failed", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await getSession();
    const body = await req.json();
    const author = String(body.author || session?.user?.name || "").trim();
    const text = String(body.text || "").trim();
    const rating = Number(body.rating);
    if (!body.productId || !text || !author || !Number.isFinite(rating)) {
      return NextResponse.json({ error: "نام، امتیاز و متن نظر الزامی است." }, { status: 400 });
    }
    const userId =
      session?.user?.id && /^[a-fA-F0-9]{24}$/.test(session.user.id) ? session.user.id : undefined;
    const review = await Review.create({
      productId: body.productId,
      ...(userId ? { userId } : {}),
      author,
      rating: Math.min(5, Math.max(1, Math.round(rating))),
      text,
      status: "pending",
    });
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("POST /api/reviews failed", error);
    return NextResponse.json({ error: "ثبت نظر انجام نشد." }, { status: 500 });
  }
}
