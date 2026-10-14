import { CATEGORIES } from "@/lib/data";

export function decodeCategoryParam(value: string) {
  const raw = value.trim();
  try {
    return decodeURIComponent(raw).trim();
  } catch {
    return raw;
  }
}

export function canonicalCategoryId(value: string) {
  const raw = decodeCategoryParam(value);
  const seed = CATEGORIES.find((item) => item.id === raw || item.name === raw);
  return seed?.id || raw;
}

export function categoryIdAliases(value: string) {
  const raw = decodeCategoryParam(value);
  const seed = CATEGORIES.find((item) => item.id === raw || item.name === raw);
  const ids = new Set<string>([raw]);
  if (seed) {
    ids.add(seed.id);
    ids.add(seed.name);
  }
  return [...ids].filter(Boolean);
}

export function categoryLookupFilter(value: string) {
  const aliases = categoryIdAliases(value);
  return { $or: [{ id: { $in: aliases } }, { name: { $in: aliases } }] };
}

export function categoryIdFromName(name: string) {
  const seed = CATEGORIES.find((item) => item.name === name.trim());
  if (seed) return seed.id;
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "");
  return slug || `cat-${Date.now()}`;
}
