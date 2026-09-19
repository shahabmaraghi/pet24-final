"use client";
import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, User as UserIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BLOG_TINTS } from "@/lib/data";
import type { StoreBlogPost } from "@/lib/store-blog";
import { paragraphsToHtml, sanitizeHtml } from "@/lib/html";

type Comment = { id: string; name: string; text: string; date: string; status: "approved" | "pending" | "rejected" };

const commentSchema = z.object({
  name: z.string().min(2, "نام را وارد کنید"),
  text: z.string().min(5, "متن نظر باید حداقل ۵ کاراکتر باشد"),
});
type CommentForm = z.infer<typeof commentSchema>;

function tintFor(id: string) {
  const seed = id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return BLOG_TINTS[seed % BLOG_TINTS.length];
}

function mapComment(item: { _id?: string; id?: string; author?: string; text?: string; createdAt?: string; status?: string }): Comment {
  const created = item.createdAt ? new Date(item.createdAt) : null;
  return {
    id: String(item._id || item.id),
    name: String(item.author || ""),
    text: String(item.text || ""),
    date: created ? created.toLocaleDateString("fa-IR") : "",
    status: item.status === "pending" || item.status === "rejected" ? item.status : "approved",
  };
}

export function BlogPostView({ post }: { post: StoreBlogPost }) {
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [submitted, setSubmitted] = React.useState(false);
  const [commentError, setCommentError] = React.useState("");
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CommentForm>({
    resolver: zodResolver(commentSchema),
    defaultValues: { name: "", text: "" },
  });

  React.useEffect(() => {
    fetch(`/api/blog-comments?postId=${encodeURIComponent(post.id)}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((items) => {
        if (Array.isArray(items)) setComments(items.map(mapComment));
      })
      .catch(() => {});
  }, [post.id]);

  const onSubmit = async (data: CommentForm) => {
    setCommentError("");
    setSubmitted(false);
    try {
      const res = await fetch("/api/blog-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, author: data.name, text: data.text }),
      });
      const saved = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCommentError(saved.error || "ثبت نظر انجام نشد.");
        return;
      }
      reset();
      setSubmitted(true);
    } catch {
      setCommentError("ثبت نظر انجام نشد.");
    }
  };

  const tint = tintFor(post.id);
  const approved = comments.filter((c) => c.status === "approved");
  const html = sanitizeHtml(post.content || paragraphsToHtml(post.paragraphs));

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b bg-[#fffdf9]">
        <div className="mx-auto flex max-w-[900px] items-center gap-4 px-6 py-4">
          <Link href="/" className="text-[22px] font-extrabold text-primary">Pet24</Link>
          <div className="flex-1" />
          <nav className="flex items-center gap-6">
            <Link href="/about" className="text-sm font-semibold text-muted-foreground hover:text-primary">درباره ما</Link>
            <Link href="/blog" className="text-sm font-semibold text-muted-foreground hover:text-primary">بلاگ</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[760px] flex-1 px-6 py-9 pb-16">
        <div className="mb-4 text-[13px] text-muted-foreground"><Link href="/blog" className="text-muted-foreground">بلاگ</Link> / {post.category}</div>
        <div className="mb-2.5 text-[13px] font-bold text-primary">{post.category}</div>
        <h1 className="mb-3 text-2xl font-extrabold leading-relaxed">{post.title}</h1>
        <div className="mb-6 flex items-center gap-4 text-[13px] text-muted-foreground">
          <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{post.date}</span>
          <span className="flex items-center gap-1.5"><UserIcon className="h-3.5 w-3.5" />{post.author}</span>
        </div>
        {post.coverImage ? (
          <img src={post.coverImage} alt={post.title} className="h-[320px] w-full rounded-2xl object-cover" />
        ) : (
          <div
            className="flex h-[320px] items-center justify-center rounded-2xl text-sm"
            style={{ backgroundImage: `repeating-linear-gradient(135deg,${tint}22,${tint}22 10px,${tint}3a 10px,${tint}3a 20px)`, color: tint }}
          >
            تصویر پست
          </div>
        )}

        {html ? (
          <div className="blog-html mt-7 text-base text-foreground/90" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <div className="mt-7 text-base leading-loose text-muted-foreground">محتوای این پست به‌زودی تکمیل می‌شود.</div>
        )}

        <section className="mt-12 border-t pt-8">
          <h2 className="mb-5 text-lg font-extrabold text-primary">نظرات ({approved.length})</h2>
          {approved.length > 0 ? (
            <div className="mb-7 flex flex-col gap-3.5">
              {approved.map((c) => (
                <div key={c.id} className="rounded-xl border bg-card p-4">
                  <div className="mb-1.5 flex justify-between"><span className="text-[13px] font-bold">{c.name}</span><span className="text-xs text-muted-foreground">{c.date}</span></div>
                  <div className="text-sm leading-relaxed text-muted-foreground">{c.text}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-6 rounded-xl py-6 text-center text-sm text-muted-foreground">هنوز نظری ثبت نشده. اولین نفری باشید که نظر می‌دهد.</div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border bg-card p-5">
            <h3 className="mb-3.5 text-[15px] font-bold text-primary">ثبت نظر جدید</h3>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>نام شما</Label>
                <Input {...register("name")} placeholder="نام شما" />
                {errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>متن نظر شما</Label>
                <Textarea {...register("text")} placeholder="متن نظر شما" rows={3} />
                {errors.text && <span className="text-xs text-destructive">{errors.text.message}</span>}
              </div>
              <Button type="submit" className="self-start px-6 font-bold">ارسال نظر</Button>
              {submitted && <div className="text-[13px] text-primary">نظر شما ثبت شد و پس از تایید مدیر نمایش داده می‌شود.</div>}
              {commentError && <div className="text-[13px] text-destructive">{commentError}</div>}
            </div>
          </form>
        </section>
      </main>

      <footer className="mt-auto bg-[#1f1c17] px-6 py-8 text-center text-xs text-[#c9c3b2]">© ۱۴۰۵ Pet24 — تمامی حقوق محفوظ است.</footer>
    </div>
  );
}
