import Link from "next/link";
import { BlogPostView } from "@/components/blog-post-view";
import { getStoreBlogPost } from "@/lib/get-store-blog";

export const dynamic = "force-dynamic";

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
