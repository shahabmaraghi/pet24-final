import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Order from "@/lib/models/Order";
import { requireAuth, requireAdmin } from "@/lib/api-helpers";

export async function GET(req: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all");

  if (all === "true") {
    const admin = await requireAdmin();
    if (admin.error) return admin.error;
    const orders = await Order.find().populate("userId", "name email").sort({ createdAt: -1 });
    return NextResponse.json(orders);
  }

  const orders = await Order.find({ userId: session!.user.id }).sort({ createdAt: -1 });
  return NextResponse.json(orders);
}
