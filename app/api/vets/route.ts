import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-helpers";
import { dbConnect } from "@/lib/db";
import Vet from "@/lib/models/Vet";
import VetComment from "@/lib/models/VetComment";
import { serializeVet, vetFromBody, type PublicVet } from "@/lib/store-vet";

export async function GET(req: Request) {
  const manage = new URL(req.url).searchParams.get("manage") === "1";
  try {
    await dbConnect();
    if (manage) {
      const { error } = await requireAdmin();
      if (error) return error;
      const items = await Vet.find().sort({ createdAt: -1 });
      return NextResponse.json({ items: items.map((item) => serializeVet(item, 0, true)) });
    }
    const items = await Vet.find({ status: { $nin: ["pending", "suspended"] } }).sort({ name: 1 }).lean();
    const ids = items.map((item) => item._id);
    const counts = ids.length
      ? await VetComment.aggregate([
          { $match: { status: "approved", vetId: { $in: ids } } },
          { $group: { _id: "$vetId", count: { $sum: 1 } } },
        ])
      : [];
    const countMap = new Map(counts.map((row: { _id: unknown; count: number }) => [String(row._id), row.count]));
    return NextResponse.json({
      items: items.map((item) => serializeVet(item, countMap.get(String(item._id)) || 0) as PublicVet),
    });
  } catch (err) {
    console.error("GET /api/vets failed", err);
    return NextResponse.json({ error: "بارگذاری دامپزشک‌ها انجام نشد." }, { status: 503 });
  }
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = vetFromBody(body);
    if (!parsed.value) return NextResponse.json({ error: parsed.error }, { status: 400 });
    await dbConnect();
    if (parsed.value.accountEmail) {
      const taken = await Vet.findOne({ accountEmail: parsed.value.accountEmail });
      if (taken) return NextResponse.json({ error: "این ایمیل به دامپزشک دیگری وصل است." }, { status: 400 });
    }
    const vet = await Vet.create(parsed.value);
    return NextResponse.json(serializeVet(vet, 0, true), { status: 201 });
  } catch (err) {
    console.error("POST /api/vets failed", err);
    return NextResponse.json({ error: "ثبت دامپزشک انجام نشد." }, { status: 500 });
  }
}
