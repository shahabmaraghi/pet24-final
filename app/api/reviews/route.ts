import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Review from "@/lib/models/Review";
import { requireAdmin, requireAuth } from "@/lib/api-helpers";

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
  const { session, error } = await requireAuth();
  if (error) return error;
  try {
    await dbConnect();
    const body = await req.json();
    if (!body.productId || !body.text || !body.rating) {
      return NextResponse.json({ error: "امتیاز و متن نظر الزامی است." }, { status: 400 });
    }
    const review = await Review.create({
      productId: body.productId,
      userId: session!.user.id,
      author: session!.user.name || "کاربر",
      rating: body.rating,
      text: body.text,
      status: "pending",
    });
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("POST /api/reviews failed", error);
    return NextResponse.json({ error: "ثبت نظر انجام نشد." }, { status: 500 });
  }
}
