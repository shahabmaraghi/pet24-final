import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Review from "@/lib/models/Review";
import { requireAuth } from "@/lib/api-helpers";

// GET /api/reviews?productId=...  -> approved reviews for a product (public)
// GET /api/reviews?status=pending -> admin moderation queue (handled in [id] PATCH for status change)
export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const status = searchParams.get("status") || "approved";
  if (!productId) {
    // admin listing across all products
    const items = await Review.find({ status }).populate("productId", "name").sort({ createdAt: -1 });
    return NextResponse.json(items);
  }
  const items = await Review.find({ productId, status: "approved" }).sort({ createdAt: -1 });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;
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
}
