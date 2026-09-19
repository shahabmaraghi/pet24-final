export type StoreSlide = {
  id: string;
  catId: string;
  tag: string;
  title: string;
  subtitle: string;
  from: string;
  to: string;
  order: number;
};

export function serializeSlide(doc: any): StoreSlide {
  const obj = typeof doc?.toObject === "function" ? doc.toObject() : doc;
  return {
    id: String(obj._id ?? obj.id),
    catId: String(obj.catId || "dog"),
    tag: String(obj.tag || "ویژه"),
    title: String(obj.title ?? ""),
    subtitle: String(obj.subtitle ?? ""),
    from: String(obj.from || "#3f7a5c"),
    to: String(obj.to || "#1f4d38"),
    order: Number(obj.order || 0),
  };
}

export function slideUpdateFromBody(body: Record<string, unknown>) {
  const update: Record<string, unknown> = {};
  if (typeof body.title === "string") update.title = body.title.trim();
  if (typeof body.subtitle === "string") update.subtitle = body.subtitle.trim();
  if (typeof body.tag === "string") update.tag = body.tag.trim();
  if (typeof body.catId === "string") update.catId = body.catId.trim();
  if (typeof body.from === "string") update.from = body.from;
  if (typeof body.to === "string") update.to = body.to;
  if (typeof body.image === "string") update.image = body.image;
  if (body.order !== undefined) update.order = Number(body.order) || 0;
  return update;
}
