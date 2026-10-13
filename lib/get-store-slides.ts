import { withMongoRetry } from "@/lib/db";
import Slide from "@/lib/models/Slide";
import { serializeSlide, type StoreSlide } from "@/lib/store-slide";

export type { StoreSlide };

export async function getStoreSlides(): Promise<StoreSlide[]> {
  return withMongoRetry(async () => {
    const items = await Slide.find().sort({ order: 1 }).maxTimeMS(8000);
    return items.map(serializeSlide);
  });
}
