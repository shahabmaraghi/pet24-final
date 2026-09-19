import { postBodyFromDoc } from "@/lib/html";

export type StoreBlogPost = {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  author: string;
  date: string;
  paragraphs: string[];
  content: string;
  coverImage?: string;
};

function rawDoc(doc: any) {
  if (!doc) return {};
  if (doc._doc) return { ...doc.toObject?.(), ...doc._doc, _id: doc._id };
  return doc;
}

export function serializeBlogPost(doc: any): StoreBlogPost {
  const obj = rawDoc(doc);
  const created = obj.createdAt ? new Date(obj.createdAt) : null;
  const content = postBodyFromDoc(obj);
  return {
    id: String(obj._id ?? obj.id),
    title: String(obj.title ?? ""),
    category: String(obj.category ?? ""),
    excerpt: String(obj.excerpt ?? ""),
    author: String(obj.author ?? ""),
    date: created ? created.toLocaleDateString("fa-IR") : "",
    paragraphs: Array.isArray(obj.paragraphs) ? obj.paragraphs.map(String) : [],
    content,
    coverImage: obj.coverImage ? String(obj.coverImage) : "",
  };
}
