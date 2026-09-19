export function categoryIdFromName(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "");
  return slug || `cat-${Date.now()}`;
}
