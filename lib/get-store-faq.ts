import { withMongoRetry } from "@/lib/db";
import Faq from "@/lib/models/Faq";
import { ensureFaqs } from "@/lib/ensure-faqs";
import { serializeFaq } from "@/lib/store-faq";

export async function getStoreFaqs() {
  return withMongoRetry(async () => {
    await ensureFaqs();
    const items = await Faq.find({ active: { $ne: false } }).sort({ order: 1, createdAt: 1 }).maxTimeMS(8000);
    return items.map(serializeFaq);
  });
}
