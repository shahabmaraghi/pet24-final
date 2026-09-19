import { NextResponse } from "next/server";
import { dbConnect, withMongoRetry } from "@/lib/db";
import BlogPost from "@/lib/models/BlogPost";
import { requireAdmin } from "@/lib/api-helpers";
import { serializeBlogPost } from "@/lib/store-blog";
import { htmlToParagraphs } from "@/lib/html";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 12);
    return await withMongoRetry(async () => {
      const [items, total] = await Promise.all([
        BlogPost.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
        BlogPost.countDocuments(),
      ]);
      return NextResponse.json(
        { items: items.map(serializeBlogPost), total, page, pages: Math.ceil(total / limit) },
        { headers: { "Cache-Control": "no-store" } }
      );
    });
  } catch {
    return NextResponse.json(
      { items: [], total: 0, page: 1, pages: 0, error: "بارگذاری مطالب انجام نشد." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  await dbConnect();
  const body = await req.json();
  if (!body.title) return NextResponse.json({ error: "عنوان الزامی است." }, { status: 400 });
  const content = typeof body.body === "string" ? body.body : String(body.content || "");
  const paragraphs = htmlToParagraphs(content);
  const post = await BlogPost.create({
    title: String(body.title).trim(),
    category: body.category || "عمومی",
    excerpt: body.excerpt || "",
    author: body.author || "تیم Pet24",
    coverImage: body.coverImage ? String(body.coverImage) : "",
    content,
    paragraphs,
  });
  return NextResponse.json(serializeBlogPost(post), { status: 201 });
}
