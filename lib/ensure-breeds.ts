import Breed from "@/lib/models/Breed";
import { SEED_BREEDS, seedBreedDoc } from "@/lib/breed-catalog";

function key(species: string, title: string) {
  return `${species}:${title.trim().toLowerCase()}`;
}

export async function ensureBreeds() {
  const existing = await Breed.find({}, { species: 1, title: 1 }).lean();
  const have = new Set(existing.map((item) => key(String(item.species || ""), String(item.title || ""))));
  const missing = SEED_BREEDS.filter((item) => !have.has(key(item.species, item.title))).map(seedBreedDoc);
  if (missing.length > 0) {
    await Breed.insertMany(missing, { ordered: false }).catch(() => {});
  }
}
