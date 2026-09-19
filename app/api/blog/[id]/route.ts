import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import BlogPost from "@/lib/models/BlogPost";
import { requireAdmin } from "@/lib/api-helpers";
import { serializeBlogPost } from "@/lib/store-blog";
import { htmlToParagraphs } from "@/lib/html";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();
  const post = await BlogPost.findById(id).lean();
  if (!post) return NextResponse.json({ error: "پست یافت نشد." }, { status: 404 });
  return NextResponse.json(serializeBlogPost(post), { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await requireAdmin();
  if (error) return error;
  await dbConnect();
  const body = await req.json();
  const content = typeof body.body === "string" ? body.body : String(body.content || "");
  const update: Record<string, unknown> = {};
  if (body.title != null) update.title = String(body.title).trim();
  if (body.category != null) update.category = body.category;
  if (body.excerpt != null) update.excerpt = body.excerpt;
  if (body.author != null) update.author = body.author;
  if (body.coverImage != null) update.coverImage = String(body.coverImage);
  if (typeof body.body === "string" || body.content != null) {
    update.content = content;
    update.paragraphs = htmlToParagraphs(content);
  }
  const post = await BlogPost.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
  if (!post) return NextResponse.json({ error: "پست یافت نشد." }, { status: 404 });
  return NextResponse.json(serializeBlogPost(post));
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await requireAdmin();
  if (error) return error;
  await dbConnect();
  await BlogPost.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
