import { withMongoRetry } from "@/lib/db";
import Pet from "@/lib/models/Pet";
import { serializePublicPet, type PublicPet } from "@/lib/store-pet";

export async function getPublicPets(limit = 120): Promise<PublicPet[]> {
  return withMongoRetry(async () => {
    const items = await Pet.find().sort({ createdAt: -1 }).limit(limit).lean();
    return items.map(serializePublicPet);
  });
}

export async function getPublicPet(id: string): Promise<PublicPet | null> {
  if (!/^[a-fA-F0-9]{24}$/.test(id)) return null;
  return withMongoRetry(async () => {
    const item = await Pet.findById(id).lean();
    return item ? serializePublicPet(item) : null;
  });
}
