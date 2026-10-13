import Faq from "@/lib/models/Faq";
import { SEED_FAQS } from "@/lib/store-faq";

export async function ensureFaqs() {
  const count = await Faq.countDocuments();
  if (count > 0) return;
  await Faq.insertMany(SEED_FAQS, { ordered: false }).catch(() => {});
}
