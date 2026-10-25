import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-helpers";
import { dbConnect } from "@/lib/db";
import VetComment from "@/lib/models/VetComment";
import { serializeVetComment } from "@/lib/store-vet";

export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const status = new URL(req.url).searchParams.get("status") || "all";
  try {
    await dbConnect();
    const filter = status === "all" ? {} : { status };
    const items = await VetComment.find(filter).sort({ createdAt: -1 }).limit(200).populate({ path: "vetId", select: "name" });
    return NextResponse.json({
      items: items.map((item) => {
        const serialized = serializeVetComment(item);
        const vet = item.vetId && typeof item.vetId === "object" && "name" in item.vetId ? item.vetId : null;
        return { ...serialized, vetName: String((vet as { name?: string } | null)?.name || "") };
      }),
    });
  } catch (err) {
    console.error("GET /api/vet-comments failed", err);
    return NextResponse.json({ error: "بارگذاری نظرها انجام نشد." }, { status: 503 });
  }
}
