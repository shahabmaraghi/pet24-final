import { withMongoRetry } from "@/lib/db";
import BlogPost from "@/lib/models/BlogPost";
import { serializeBlogPost } from "@/lib/store-blog";

export async function getStoreBlogPosts(limit = 12) {
  return withMongoRetry(async () => {
    const items = await BlogPost.find().sort({ createdAt: -1 }).limit(limit).lean();
    return items.map(serializeBlogPost);
  });
}

export async function getStoreBlogPost(id: string) {
  if (!/^[a-fA-F0-9]{24}$/.test(id)) return null;
  return withMongoRetry(async () => {
    const item = await BlogPost.findById(id).lean();
    return item ? serializeBlogPost(item) : null;
  });
}
