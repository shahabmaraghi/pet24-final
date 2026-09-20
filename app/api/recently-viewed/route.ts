import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireAuth } from "@/lib/api-helpers";
import { dbConnect } from "@/lib/db";
import User from "@/lib/models/User";
import Product from "@/lib/models/Product";
import { serializeProduct } from "@/lib/store-product";

const MAX_RECENT = 16;

async function findAccountUser(session: { user: { id?: string; email?: string | null } }) {
  const email = session.user.email?.trim().toLowerCase();
  if (email) {
    const byEmail = await User.findOne({ email });
    if (byEmail) return byEmail;
  }
  const id = session.user.id;
  if (id && id !== "admin" && Types.ObjectId.isValid(id)) {
    return User.findById(id);
  }
  return null;
}

export async function GET() {
  const { session, error } = await requireAuth();
  if (error || !session) return error;
  try {
    await dbConnect();
    const user = await findAccountUser(session);
    const viewed = Array.isArray(user?.recentlyViewed) ? user.recentlyViewed : [];
    const ids: string[] = viewed
      .map((item: { productId?: string }) => String(item.productId || ""))
      .filter((id: string) => id.length > 0);
    const objectIds = ids
      .filter((id: string) => Types.ObjectId.isValid(id))
      .map((id: string) => new Types.ObjectId(id));
    const products = objectIds.length > 0 ? await Product.find({ _id: { $in: objectIds } }) : [];
    const byId = new Map(products.map((item) => [String(item._id), serializeProduct(item)]));
    const items = ids.map((id: string) => byId.get(id)).filter(Boolean);
    return NextResponse.json({ items });
  } catch (err) {
    console.error("GET /api/recently-viewed failed", err);
    return NextResponse.json({ items: [] });
  }
}

export async function POST(req: Request) {
  const { session, error } = await requireAuth();
  if (error || !session) return error;
  try {
    const body = await req.json().catch(() => ({}));
    const productId = String(body.productId || "").trim();
    if (!productId) return NextResponse.json({ error: "محصول نامعتبر است." }, { status: 400 });

    await dbConnect();
    const user = await findAccountUser(session);
    if (!user) return NextResponse.json({ ok: true });

    const next = [
      { productId, viewedAt: new Date() },
      ...(Array.isArray(user.recentlyViewed) ? user.recentlyViewed : []).filter(
        (item: { productId?: string }) => String(item.productId) !== productId
      ),
    ].slice(0, MAX_RECENT);
    user.recentlyViewed = next;
    await user.save();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/recently-viewed failed", err);
    return NextResponse.json({ error: "ذخیره بازدید انجام نشد." }, { status: 500 });
  }
}
