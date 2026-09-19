import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Order from "@/lib/models/Order";
import { requireAuth, requireAdmin } from "@/lib/api-helpers";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { session, error } = await requireAuth();
  if (error) return error;
  await dbConnect();
  const order = await Order.findById(id);
  if (!order) return NextResponse.json({ error: "سفارش یافت نشد." }, { status: 404 });
  if (order.userId.toString() !== session!.user.id && session!.user.role !== "admin") {
    return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 });
  }
  return NextResponse.json(order);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await requireAdmin();
  if (error) return error;
  await dbConnect();
  const body = await req.json(); // { status }
  const order = await Order.findByIdAndUpdate(id, { status: body.status }, { new: true });
  if (!order) return NextResponse.json({ error: "سفارش یافت نشد." }, { status: 404 });
  return NextResponse.json(order);
}
