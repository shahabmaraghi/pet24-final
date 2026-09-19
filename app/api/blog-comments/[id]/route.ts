import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import BlogComment from "@/lib/models/BlogComment";
import { requireAdmin } from "@/lib/api-helpers";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await requireAdmin();
  if (error) return error;
  await dbConnect();
  const body = await req.json();
  const update: any = {};
  if (body.status) update.status = body.status;
  if (body.adminReply !== undefined) update.adminReply = body.adminReply;
  const comment = await BlogComment.findByIdAndUpdate(id, update, { new: true });
  if (!comment) return NextResponse.json({ error: "نظر یافت نشد." }, { status: 404 });
  return NextResponse.json(comment);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await requireAdmin();
  if (error) return error;
  await dbConnect();
  await BlogComment.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
