import type { Metadata } from "next";
import { BlogMagazine } from "@/components/blog-magazine";
import { getStoreBlogPosts } from "@/lib/get-store-blog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "مجله Pet24",
  description: "مقالات مراقبت، تغذیه و نگهداری حیوانات خانگی در مجله Pet24.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  let posts: Awaited<ReturnType<typeof getStoreBlogPosts>> = [];
  let loadError = false;
  try {
    posts = await getStoreBlogPosts(50);
  } catch {
    loadError = true;
  }
  return <BlogMagazine posts={posts} loadError={loadError} />;
}
