import { withMongoRetry } from "@/lib/db";
import Vet from "@/lib/models/Vet";
import VetComment from "@/lib/models/VetComment";
import { isListedVet, serializeVet, serializeVetComment, type PublicVet, type VetCommentItem } from "@/lib/store-vet";

async function commentCounts(ids: unknown[]) {
  if (!ids.length) return new Map<string, number>();
  const rows = await VetComment.aggregate([
    { $match: { status: "approved", vetId: { $in: ids } } },
    { $group: { _id: "$vetId", count: { $sum: 1 } } },
  ]);
  return new Map<string, number>(rows.map((row: { _id: unknown; count: number }) => [String(row._id), row.count]));
}

export async function getPublicVets(): Promise<PublicVet[]> {
  return withMongoRetry(async () => {
    const items = await Vet.find({ status: { $nin: ["pending", "suspended"] } }).sort({ name: 1 }).lean();
    const counts = await commentCounts(items.map((item) => item._id));
    return items.map((item) => serializeVet(item, counts.get(String(item._id)) || 0) as PublicVet);
  });
}

export async function getPublicVet(id: string): Promise<{ vet: PublicVet; comments: VetCommentItem[] } | null> {
  if (!/^[a-fA-F0-9]{24}$/.test(id)) return null;
  return withMongoRetry(async () => {
    const item = await Vet.findById(id).lean();
    if (!item || Array.isArray(item) || !isListedVet(item)) return null;
    const comments = await VetComment.find({ vetId: item._id, status: "approved" }).sort({ createdAt: -1 }).limit(50).lean();
    return {
      vet: serializeVet(item, comments.length) as PublicVet,
      comments: comments.map(serializeVetComment),
    };
  });
}
