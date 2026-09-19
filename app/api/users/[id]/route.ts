import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/lib/models/User";
import { requireAdmin } from "@/lib/api-helpers";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await requireAdmin();
  if (error) return error;
  await dbConnect();
  const body = await req.json();
  const update: any = {};
  if (body.role) update.role = body.role;
  if (body.name) update.name = body.name;
  const user = await User.findByIdAndUpdate(id, update, { new: true }).select("-password");
  if (!user) return NextResponse.json({ error: "کاربر یافت نشد." }, { status: 404 });
  return NextResponse.json(user);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await requireAdmin();
  if (error) return error;
  await dbConnect();
  await User.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
