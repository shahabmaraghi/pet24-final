import type { PetSpecies } from "@/lib/store-pet";

export const BREED_SIZES = [
  { id: "toy", label: "خیلی کوچک" },
  { id: "small", label: "نژاد کوچک" },
  { id: "medium", label: "جثه متوسط" },
  { id: "large", label: "نژاد بزرگ" },
  { id: "giant", label: "جثه خیلی بزرگ" },
] as const;

export type BreedSize = (typeof BREED_SIZES)[number]["id"];

export type StoreBreed = {
  id: string;
  species: PetSpecies;
  title: string;
  nameEn: string;
  aliases: string[];
  size: BreedSize;
  foodKeywords: string[];
  accessoryKeywords: string[];
  avoidKeywords: string[];
  active: boolean;
};

const SIZE_IDS = new Set(BREED_SIZES.map((item) => item.id));

export function asBreedSize(value: unknown): BreedSize {
  const id = String(value || "") as BreedSize;
  return SIZE_IDS.has(id) ? id : "medium";
}

export function breedSizeLabel(size?: string) {
  return BREED_SIZES.find((item) => item.id === size)?.label || "جثه متوسط";
}

export function breedKeywords(species: PetSpecies, size: BreedSize) {
  if (species === "dog") {
    const foodKeywords =
      size === "large" || size === "giant"
        ? ["نژاد بزرگ", "جثه بزرگ", "بزرگسال", "مفاصل", "large"]
        : size === "toy" || size === "small"
          ? ["نژاد کوچک", "کوچک", "small"]
          : ["متوسط", "بالغ", "medium"];
    return {
      foodKeywords,
      accessoryKeywords: ["قلاده", "بند", "طناب", "ویتامین", "ظرف"],
      avoidKeywords: size === "large" || size === "giant" ? ["نژاد کوچک", "سایز کوچک"] : size === "toy" || size === "small" ? ["نژاد بزرگ"] : [],
    };
  }
  if (species === "cat") {
    return {
      foodKeywords: ["گربه بالغ", "بالغ", "indoor"],
      accessoryKeywords: ["خاک", "خراش", "شامپو"],
      avoidKeywords: ["سگ"],
    };
  }
  if (species === "rabbit") {
    return { foodKeywords: ["یونجه", "علوفه", "خرگوش"], accessoryKeywords: ["قفس"], avoidKeywords: ["سگ", "گربه"] };
  }
  if (species === "bird") {
    return { foodKeywords: ["دانه", "پرنده"], accessoryKeywords: ["قفس"], avoidKeywords: ["سگ"] };
  }
  if (species === "fish") {
    return { foodKeywords: ["غذا ماهی", "فلس", "ماهی"], accessoryKeywords: ["فیلتر", "آکواریوم"], avoidKeywords: ["سگ"] };
  }
  if (species === "rodent") {
    return { foodKeywords: ["همستر", "جونده"], accessoryKeywords: ["قفس", "چرخ"], avoidKeywords: ["سگ"] };
  }
  return { foodKeywords: [], accessoryKeywords: ["ظرف"], avoidKeywords: [] };
}

export function serializeBreed(doc: any): StoreBreed {
  const obj = typeof doc?.toObject === "function" ? doc.toObject() : doc;
  const species = String(obj.species || "other") as PetSpecies;
  const size = asBreedSize(obj.size);
  const generated = breedKeywords(species, size);
  return {
    id: String(obj._id ?? obj.id),
    species,
    title: String(obj.title || "").trim(),
    nameEn: String(obj.nameEn || "").trim(),
    aliases: Array.isArray(obj.aliases) ? obj.aliases.map(String).filter(Boolean) : [],
    size,
    foodKeywords: Array.isArray(obj.foodKeywords) && obj.foodKeywords.length ? obj.foodKeywords.map(String) : generated.foodKeywords,
    accessoryKeywords: Array.isArray(obj.accessoryKeywords) && obj.accessoryKeywords.length ? obj.accessoryKeywords.map(String) : generated.accessoryKeywords,
    avoidKeywords: Array.isArray(obj.avoidKeywords) && obj.avoidKeywords.length ? obj.avoidKeywords.map(String) : generated.avoidKeywords,
    active: obj.active !== false,
  };
}
