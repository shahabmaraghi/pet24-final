import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Cart from "@/lib/models/Cart";
import { requireAuth } from "@/lib/api-helpers";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;
  await dbConnect();
  let cart = await Cart.findOne({ userId: session!.user.id }).populate("items.productId");
  if (!cart) cart = await Cart.create({ userId: session!.user.id, items: [] });
  return NextResponse.json(cart);
}

export async function PUT(req: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;
  await dbConnect();
  const body = await req.json(); // { items: [{ productId, qty }] }
  const cart = await Cart.findOneAndUpdate(
    { userId: session!.user.id },
    { items: body.items || [] },
    { upsert: true, new: true }
  ).populate("items.productId");
  return NextResponse.json(cart);
}

export async function DELETE() {
  const { session, error } = await requireAuth();
  if (error) return error;
  await dbConnect();
  await Cart.findOneAndUpdate({ userId: session!.user.id }, { items: [] }, { upsert: true });
  return NextResponse.json({ ok: true });
}
