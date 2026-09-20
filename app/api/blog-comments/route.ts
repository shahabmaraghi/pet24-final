import { NextResponse } from "next/server";
import { dbConnect, withMongoRetry } from "@/lib/db";
import BlogComment from "@/lib/models/BlogComment";
import { getSession, requireAdmin } from "@/lib/api-helpers";

function serializeComment(doc: {
  _id?: unknown;
  id?: unknown;
  author?: string;
  text?: string;
  status?: string;
  createdAt?: Date | string;
  postId?: unknown;
}) {
  const post = doc.postId && typeof doc.postId === "object" && "title" in (doc.postId as object)
    ? (doc.postId as { _id?: unknown; title?: string })
    : null;
  return {
    id: String(doc._id ?? doc.id ?? ""),
    author: String(doc.author || ""),
    text: String(doc.text || ""),
    status: doc.status === "rejected" || doc.status === "pending" ? doc.status : "approved",
    createdAt: doc.createdAt,
    postTitle: String(post?.title || ""),
    postId: String(post?._id ?? doc.postId ?? ""),
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");
  const status = searchParams.get("status") || "approved";
  if (!postId) {
    if (status === "all") {
      const { error } = await requireAdmin();
      if (error) return error;
    }
    try {
      const filter = status === "all" ? {} : { status };
      const items = await withMongoRetry(async () => {
        try {
          return await BlogComment.find(filter).populate({ path: "postId", select: "title", strictPopulate: false }).sort({ createdAt: -1 }).lean();
        } catch {
          return await BlogComment.find(filter).sort({ createdAt: -1 }).lean();
        }
      });
      return NextResponse.json(items.map(serializeComment));
    } catch (error) {
      console.error("GET /api/blog-comments failed", error);
      return NextResponse.json({ error: "بارگذاری نظرات انجام نشد." }, { status: 503 });
    }
  }
  try {
    const items = await withMongoRetry(() =>
      BlogComment.find({ postId, status: "approved" }).sort({ createdAt: -1 }).lean()
    );
    return NextResponse.json(items.map(serializeComment));
  } catch (error) {
    console.error("GET /api/blog-comments failed", error);
    return NextResponse.json([], { status: 200 });
  }
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
