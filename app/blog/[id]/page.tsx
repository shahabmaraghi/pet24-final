import Link from "next/link";
import type { Metadata } from "next";
import { BlogPostView } from "@/components/blog-post-view";
import { getStoreBlogPost } from "@/lib/get-store-blog";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = await getStoreBlogPost(id).catch(() => null);
  if (!post) return { title: "مطلب پیدا نشد", robots: { index: false, follow: true } };
  return {
    title: post.title,
    description: post.excerpt || post.title,
    alternates: { canonical: `/blog/${post.id}` },
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      type: "article",
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getStoreBlogPost(id).catch(() => null);
  if (!post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <p className="text-sm text-muted-foreground">این مطلب پیدا نشد.</p>
        <Link href="/blog" className="text-sm font-bold text-primary">بازگشت به مجله</Link>
      </div>
    );
  }
  return <BlogPostView post={post} />;
}
