import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Review from "@/lib/models/Review";
import { getSession, requireAdmin } from "@/lib/api-helpers";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const status = searchParams.get("status") || "approved";
    if (!productId) {
      const { error } = await requireAdmin();
      if (error) return error;
      const filter = status === "all" ? {} : { status };
      const items = await Review.find(filter).populate("productId", "name").sort({ createdAt: -1 });
      return NextResponse.json(items);
    }
    const items = await Review.find({ productId, status: "approved" }).sort({ createdAt: -1 });
    return NextResponse.json(items);
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
