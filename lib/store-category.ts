export type StoreCategory = {
  id: string;
  name: string;
  tint: string;
  image?: string;
  active: boolean;
};

export function serializeCategory(item: {
  _id?: unknown;
  id?: unknown;
  name?: unknown;
  tint?: unknown;
  image?: unknown;
  active?: unknown;
}): StoreCategory {
  return {
    id: String(item.id ?? ""),
    name: String(item.name ?? ""),
    tint: String(item.tint || "#6b7280"),
    image: item.image ? String(item.image) : undefined,
    active: item.active !== false,
  };
}

export const ACTIVE_CATEGORY_FILTER = { active: { $ne: false } };
