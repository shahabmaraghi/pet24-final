import type { MetadataRoute } from "next";
import { withMongoRetry } from "@/lib/db";
import Product from "@/lib/models/Product";
import BlogPost from "@/lib/models/BlogPost";
import { getStoreCategories } from "@/lib/get-store-categories";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/discounts`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
  ];

  try {
    const [categories, products, posts] = await Promise.all([
      getStoreCategories().catch(() => []),
      withMongoRetry(async () => Product.find().select("_id updatedAt").sort({ updatedAt: -1 }).limit(1000).lean()),
      withMongoRetry(async () => BlogPost.find().select("_id updatedAt").sort({ updatedAt: -1 }).limit(200).lean()),
    ]);

    for (const category of categories) {
      pages.push({
        url: `${base}/category/${category.id}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }

    for (const product of products as { _id: unknown; updatedAt?: Date }[]) {
      pages.push({
        url: `${base}/product/${String(product._id)}`,
        lastModified: product.updatedAt || now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }

    for (const post of posts as { _id: unknown; updatedAt?: Date }[]) {
      pages.push({
        url: `${base}/blog/${String(post._id)}`,
        lastModified: post.updatedAt || now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // Sitemap still returns public static routes if Mongo is unavailable.
  }

  return pages;
}
