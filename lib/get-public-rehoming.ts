import { withMongoRetry } from "@/lib/db";
import Rehoming from "@/lib/models/Rehoming";
import { serializePublicRehoming, type PublicRehoming } from "@/lib/store-rehoming";

export async function getApprovedRehomings(limit = 80): Promise<PublicRehoming[]> {
  return withMongoRetry(async () => {
    const items = await Rehoming.find({ status: "approved" }).sort({ createdAt: -1 }).limit(limit).lean();
    return items.map(serializePublicRehoming);
  });
}

export async function getApprovedRehoming(id: string): Promise<PublicRehoming | null> {
  if (!/^[a-fA-F0-9]{24}$/.test(id)) return null;
  return withMongoRetry(async () => {
    const item = await Rehoming.findOne({ _id: id, status: "approved" }).lean();
    return item ? serializePublicRehoming(item) : null;
  });
}
