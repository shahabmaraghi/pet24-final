import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Review from "@/lib/models/Review";
import { requireAdmin } from "@/lib/api-helpers";

// PATCH: admin approves/rejects and/or replies to a review
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await requireAdmin();
  if (error) return error;
  await dbConnect();
  const body = await req.json();
  const update: any = {};
  if (body.status) update.status = body.status;
  if (body.adminReply !== undefined) update.adminReply = body.adminReply;
  const review = await Review.findByIdAndUpdate(id, update, { new: true });
  if (!review) return NextResponse.json({ error: "نظر یافت نشد." }, { status: 404 });
  return NextResponse.json(review);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await requireAdmin();
  if (error) return error;
  await dbConnect();
  await Review.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
