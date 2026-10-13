import { petAge } from "@/lib/pet-care";
import { asBreedSize, breedKeywords, breedSizeLabel, type StoreBreed } from "@/lib/store-breed";
import { speciesLabel, type PetSpecies, type StorePet } from "@/lib/store-pet";
import type { StoreProduct } from "@/lib/store-product";

export type SuggestedItem = {
  product: StoreProduct;
  why: string;
};

export type SuggestionPlan = {
  food: SuggestedItem[];
  accessories: SuggestedItem[];
  reasons: string[];
  categoryId: string;
  matchLabel: string;
};

type SizeClass = "toy" | "small" | "medium" | "large" | "giant";

type BreedProfile = {
  aliases: string[];
  species: PetSpecies;
  size: SizeClass;
  title: string;
  foodKeywords: string[];
  accessoryKeywords: string[];
  avoidKeywords: string[];
};

const SIZE_LABEL: Record<SizeClass, string> = {
  toy: breedSizeLabel("toy"),
  small: breedSizeLabel("small"),
  medium: breedSizeLabel("medium"),
  large: breedSizeLabel("large"),
  giant: breedSizeLabel("giant"),
};

const SPECIES_CATEGORIES: Record<PetSpecies, string[]> = {
  dog: ["dog", "accessories", "health"],
  cat: ["cat", "accessories", "health"],
  rabbit: ["rabbit", "accessories", "health"],
  bird: ["birds", "health"],
  fish: ["fish", "health"],
  rodent: ["rodents", "accessories", "health"],
  other: ["accessories", "health"],
};

const SPECIES_WORDS: Record<PetSpecies, string[]> = {
  dog: ["سگ", "توله", "puppy", "dog"],
  cat: ["گربه", "kitten", "cat"],
  rabbit: ["خرگوش", "rabbit"],
  bird: ["پرنده", "قناری", "مرغ عشق", "عروس", "bird"],
  fish: ["ماهی", "آکواریوم", "fish"],
  rodent: ["همستر", "جونده", "hamster"],
  other: [],
};

const ALLERGEN_ALIASES: Record<string, string[]> = {
  مرغ: ["مرغ", "chicken", "poultry"],
  گوشت: ["گوشت", "beef"],
  ماهی: ["ماهی", "fish"],
  شیر: ["شیر", "لبنیات", "dairy", "lactose"],
  گندم: ["گندم", "گلوتن", "wheat", "gluten"],
  سویا: ["سویا", "soy"],
  تخم: ["تخم", "تخم‌مرغ", "egg"],
  ذرت: ["ذرت", "corn"],
  پیاز: ["پیاز", "onion"],
  سیر: ["سیر", "garlic"],
  شکلات: ["شکلات", "chocolate"],
};

function toProfile(item: StoreBreed): BreedProfile {
  const size = asBreedSize(item.size);
  const generated = breedKeywords(item.species, size);
  return {
    aliases: [item.title, item.nameEn, ...(item.aliases || [])].filter(Boolean),
    species: item.species,
    size,
    title: item.title,
    foodKeywords: item.foodKeywords.length ? item.foodKeywords : generated.foodKeywords,
    accessoryKeywords: item.accessoryKeywords.length ? item.accessoryKeywords : generated.accessoryKeywords,
    avoidKeywords: item.avoidKeywords.length ? item.avoidKeywords : generated.avoidKeywords,
  };
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\s_\-‌]+/g, " ")
    .trim();
}

function haystack(product: StoreProduct) {
  const specs = (product.specs || []).map((spec) => `${spec.k} ${spec.v}`).join(" ");
  return normalize(`${product.name} ${product.desc} ${product.type} ${specs}`);
}

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => term && text.includes(normalize(term)));
}

export function suggestionCategories(species: PetSpecies) {
  return SPECIES_CATEGORIES[species] || SPECIES_CATEGORIES.other;
}

export function avoidTerms(pet: StorePet) {
  const raw = `${pet.allergies} ${pet.dietaryRestrictions}`
    .split(/[,،/\n]| و /g)
    .map((part) => part.trim())
    .filter((part) => part.length >= 2);
  const terms = new Set<string>();
  for (const part of raw) {
    const key = Object.keys(ALLERGEN_ALIASES).find((alias) => part.includes(alias));
    if (key) ALLERGEN_ALIASES[key].forEach((item) => terms.add(item.toLowerCase()));
    else terms.add(part.toLowerCase());
  }
  return [...terms];
}

function sizeFromWeight(pet: StorePet): SizeClass | null {
  if (pet.weightKg == null) return null;
  if (pet.species === "dog") {
    if (pet.weightKg < 5) return "toy";
    if (pet.weightKg < 10) return "small";
    if (pet.weightKg < 20) return "medium";
    if (pet.weightKg < 40) return "large";
    return "giant";
  }
  if (pet.species === "cat") return pet.weightKg >= 6 ? "medium" : "small";
  return null;
}

export function matchBreed(pet: StorePet, catalog: StoreBreed[] = []): BreedProfile {
  const breed = normalize(pet.breed);
  if (breed) {
    const found = catalog.find((item) => {
      if (item.species !== pet.species) return false;
      const names = [item.title, item.nameEn, ...(item.aliases || [])];
      return names.some((alias) => {
        const id = normalize(alias);
        return Boolean(id) && (breed === id || breed.includes(id) || id.includes(breed));
      });
    });
    if (found) return toProfile(found);
  }
  const size = sizeFromWeight(pet) || (pet.species === "dog" ? "medium" : "small");
  const generated = breedKeywords(pet.species, size);
  return {
    aliases: [pet.breed].filter(Boolean),
    species: pet.species,
    size,
    title: pet.breed.trim() || speciesLabel(pet.species),
    ...generated,
  };
}

export function suggestionSearchTerms(pet: StorePet, catalog: StoreBreed[] = []) {
  const profile = matchBreed(pet, catalog);
  return [...new Set([pet.breed, profile.title, ...profile.foodKeywords, ...profile.accessoryKeywords].map((item) => item.trim()).filter((item) => item.length >= 2))].slice(0, 10);
}

function isLiveAnimal(product: StoreProduct) {
  return /حیوان زنده/.test(`${product.type} ${product.name}`);
}

function isFood(product: StoreProduct) {
  const type = normalize(product.type || "");
  if (/غذا و خوراک|خوراک|treat/.test(type)) return true;
  const name = normalize(product.name);
  return /غذای |غذا سگ|غذا گربه|غذا ماهی|غذا مخصوص|علوفه|دانه مخصوص/.test(name);
}

function maxCarryKg(product: StoreProduct) {
  const match = haystack(product).match(/تا\s*(\d+(?:\.\d+)?)\s*کیلو/);
  return match ? Number(match[1]) : null;
}

function whyFor(product: StoreProduct, pet: StorePet, profile: BreedProfile, kind: "food" | "accessory") {
  const text = haystack(product);
  if (pet.breed && includesAny(text, [pet.breed, profile.title, ...profile.aliases])) {
    return `مخصوص نژاد ${profile.title}`;
  }
  if (kind === "food" && includesAny(text, profile.foodKeywords)) {
    return `غذای مناسب ${SIZE_LABEL[profile.size]} مثل ${profile.title}`;
  }
  if (kind === "accessory" && includesAny(text, profile.accessoryKeywords)) {
    return `لوازم مناسب نگهداری ${profile.title}`;
  }
  const age = petAge(pet.birthday);
  if (age && age.years < 1 && includesAny(text, ["توله", "جوان", "بچه", "puppy", "kitten"])) {
    return `متناسب با سن پایین ${pet.name}`;
  }
  if (/پوست|حساسیت/.test(`${pet.specialNeeds} ${pet.allergies}`) && includesAny(text, ["ضدحساسیت", "شامپو"])) {
    return "مناسب پوست حساس این پروفایل";
  }
  return `از محصولات ${speciesLabel(pet.species)} فروشگاه برای ${pet.name}`;
}

function scoreProduct(product: StoreProduct, pet: StorePet, profile: BreedProfile, kind: "food" | "accessory") {
  const text = haystack(product);
  const age = petAge(pet.birthday);
  const ownWords = SPECIES_WORDS[pet.species] || [];
  const otherWords = Object.entries(SPECIES_WORDS)
    .filter(([id]) => id !== pet.species)
    .flatMap(([, words]) => words);
  let score = 0;

  if (product.categoryId === pet.species || (pet.species === "bird" && product.categoryId === "birds") || (pet.species === "rodent" && product.categoryId === "rodents")) {
    score += 40;
  }
  if (includesAny(text, [pet.breed, profile.title, ...profile.aliases].filter(Boolean))) score += 80;
  if (includesAny(text, profile.foodKeywords) && kind === "food") score += 36;
  if (includesAny(text, profile.accessoryKeywords) && kind === "accessory") score += 28;
  if (includesAny(text, profile.avoidKeywords)) score -= 55;
  if ((profile.size === "large" || profile.size === "giant") && includesAny(text, ["سایز متوسط", "سایز کوچک"])) score -= 18;
  if ((profile.size === "toy" || profile.size === "small") && includesAny(text, ["سایز بزرگ", "نژاد بزرگ"])) score -= 18;
  if (product.categoryId === "accessories") score += kind === "accessory" ? 14 : 2;
  if (product.categoryId === "health") score += pet.allergies || pet.specialNeeds ? 20 : 6;
  if (product.featured) score += 6;
  if ((product.stock ?? 0) > 0) score += 5;
  if (includesAny(text, ownWords)) score += 12;
  if (includesAny(text, otherWords) && !includesAny(text, ownWords)) score -= 45;
  if (age && age.years < 1 && includesAny(text, ["توله", "جوان", "بچه", "puppy", "kitten"])) score += 20;
  if (age && age.years >= 1 && includesAny(text, ["بالغ", "بزرگسال", "adult"])) score += 12;
  if (/پوست|حساسیت|خارش/.test(`${pet.specialNeeds} ${pet.allergies}`) && includesAny(text, ["ضدحساسیت", "شامپو", "پوست"])) score += 18;
  const limit = maxCarryKg(product);
  if (kind === "accessory" && limit && pet.weightKg && pet.weightKg > limit) score -= 70;
  return score;
}

export function buildSuggestionPlan(pet: StorePet, products: StoreProduct[], catalog: StoreBreed[] = []): SuggestionPlan {
  const profile = matchBreed(pet, catalog);
  const avoided = avoidTerms(pet);
  const age = petAge(pet.birthday);
  const reasons: string[] = [
    pet.breed
      ? `${pet.name} نژاد ${profile.title} است؛ غذا و لوازم مناسب ${SIZE_LABEL[profile.size]} از فروشگاه انتخاب شد.`
      : `چون ${pet.name} ${speciesLabel(pet.species)} است، محصولات همین گونه از فروشگاه پیشنهاد شد.`,
  ];
  const avoidedLabels = `${pet.allergies} ${pet.dietaryRestrictions}`
    .split(/[,،/\n]| و /g)
    .map((part) => part.trim())
    .filter((part) => part.length >= 2)
    .slice(0, 3);
  if (avoidedLabels.length > 0) {
    reasons.push(`محصولات حاوی ${avoidedLabels.join("، ")} به‌خاطر آلرژی یا محدودیت غذایی حذف شدند.`);
  }
  if (age && age.years < 1) reasons.push(`سن ${pet.name} کمتر از یک سال است؛ اولویت با غذای سن پایین‌تر است.`);
  if (pet.weightKg != null) {
    reasons.push(`وزن ${pet.weightKg.toLocaleString("fa-IR")} کیلوگرم با کلاس ${SIZE_LABEL[profile.size]} هماهنگ شد.`);
  }

  const usable = products.filter((item) => !isLiveAnimal(item));
  const food = usable
    .filter((item) => isFood(item))
    .filter((item) => !includesAny(haystack(item), avoided))
    .map((item) => ({ item, score: scoreProduct(item, pet, profile, "food"), why: whyFor(item, pet, profile, "food") }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((entry) => ({ product: entry.item, why: entry.why }));

  if (food.length === 0) {
    reasons.push(`غذای مخصوص ${SIZE_LABEL[profile.size]} فعلاً در فروشگاه موجود نیست؛ دسته ${speciesLabel(pet.species)} را ببینید.`);
  }

  const foodIds = new Set(food.map((item) => item.product.id));
  const accessories = usable
    .filter((item) => !isFood(item) && !foodIds.has(item.id))
    .map((item) => ({ item, score: scoreProduct(item, pet, profile, "accessory"), why: whyFor(item, pet, profile, "accessory") }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((entry) => ({ product: entry.item, why: entry.why }));

  return {
    food,
    accessories,
    reasons: reasons.slice(0, 4),
    categoryId: suggestionCategories(pet.species)[0] || "accessories",
    matchLabel: pet.breed ? `${profile.title} · ${SIZE_LABEL[profile.size]}` : speciesLabel(pet.species),
  };
}
