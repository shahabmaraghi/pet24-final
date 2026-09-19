import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import BlogComment from "@/lib/models/BlogComment";
import { getSession, requireAdmin } from "@/lib/api-helpers";

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");
  const status = searchParams.get("status") || "approved";
  if (!postId) {
    if (status === "all") {
      const { error } = await requireAdmin();
      if (error) return error;
    }
    const filter = status === "all" ? {} : { status };
    const items = await BlogComment.find(filter).populate("postId", "title").sort({ createdAt: -1 });
    return NextResponse.json(items);
  }
  const items = await BlogComment.find({ postId, status: "approved" }).sort({ createdAt: -1 });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await getSession();
  await dbConnect();
  const body = await req.json();
  if (!body.postId || !body.text) return NextResponse.json({ error: "متن نظر الزامی است." }, { status: 400 });
  const author = String(body.author || session?.user?.name || "").trim();
  if (author.length < 2) return NextResponse.json({ error: "نام الزامی است." }, { status: 400 });
  const userId = session?.user?.id && /^[a-fA-F0-9]{24}$/.test(session.user.id) ? session.user.id : undefined;
  try {
    const comment = await BlogComment.create({
      postId: body.postId,
      userId,
      author,
      text: String(body.text).trim(),
      status: "pending",
    });
    return NextResponse.json(comment, { status: 201 });
  } catch {
    return NextResponse.json({ error: "ثبت نظر انجام نشد." }, { status: 400 });
  }
}
