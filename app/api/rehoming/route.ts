import { NextResponse } from "next/server";
import { requireAdmin, requireAuth } from "@/lib/api-helpers";
import { accountOwnerKey } from "@/lib/account-owner";
import { dbConnect } from "@/lib/db";
import Rehoming from "@/lib/models/Rehoming";
import { rehomingFromBody, serializeOwnerRehoming, serializePublicRehoming } from "@/lib/store-rehoming";

const MAX_LISTINGS = 8;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mine = searchParams.get("mine") === "1";
  const status = searchParams.get("status") || "";

  try {
    await dbConnect();

    if (mine) {
      const { session, error } = await requireAuth();
      if (error || !session) return error;
      const ownerKey = accountOwnerKey(session);
      if (!ownerKey) return NextResponse.json({ error: "حساب نامعتبر است." }, { status: 400 });
      const items = await Rehoming.find({ ownerKey }).sort({ createdAt: -1 });
      return NextResponse.json({ items: items.map(serializeOwnerRehoming) });
    }

    if (status && status !== "approved") {
      const { error } = await requireAdmin();
      if (error) return error;
      const filter = status === "all" ? {} : { status };
      const items = await Rehoming.find(filter).sort({ createdAt: -1 }).limit(200);
      return NextResponse.json({ items: items.map(serializeOwnerRehoming) });
    }

    const items = await Rehoming.find({ status: "approved" }).sort({ createdAt: -1 }).limit(80);
    return NextResponse.json({ items: items.map(serializePublicRehoming) });
  } catch (err) {
    console.error("GET /api/rehoming failed", err);
    return NextResponse.json({ error: "بارگذاری آگهی‌ها انجام نشد." }, { status: 503 });
  }
}

export async function POST(req: Request) {
  const { session, error } = await requireAuth();
  if (error || !session) return error;
  const ownerKey = accountOwnerKey(session);
  if (!ownerKey) return NextResponse.json({ error: "حساب نامعتبر است." }, { status: 400 });

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = rehomingFromBody(body);
    if (!parsed.value) return NextResponse.json({ error: parsed.error }, { status: 400 });

    await dbConnect();
    const count = await Rehoming.countDocuments({ ownerKey });
    if (count >= MAX_LISTINGS) {
      return NextResponse.json({ error: "حداکثر ۸ آگهی واگذاری می‌توانید ثبت کنید. آگهی قدیمی را حذف کنید." }, { status: 400 });
    }

    const listing = await Rehoming.create({
      ownerKey,
      ownerName: String(session.user.name || "").trim() || "کاربر Pet24",
      status: "pending",
      ...parsed.value,
    });
    return NextResponse.json(serializeOwnerRehoming(listing), { status: 201 });
  } catch (err) {
    console.error("POST /api/rehoming failed", err);
    return NextResponse.json({ error: "ثبت آگهی انجام نشد." }, { status: 500 });
  }
}
