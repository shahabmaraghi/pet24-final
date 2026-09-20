"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter, notFound } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Minus, Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProductCard } from "@/components/product-card";
import { StarRating } from "@/components/star-rating";
import { getCategory, fmt, type Product } from "@/lib/data";
import { useCart } from "@/lib/cart-store";
import { serializeProduct } from "@/lib/store-product";
import { ProductImageSlider } from "@/components/product-image-slider";
import { TrackRecentlyViewed } from "@/components/track-recently-viewed";

const reviewSchema = z.object({
  author: z.string().min(2, "نام باید حداقل ۲ حرف باشد"),
  text: z.string().min(5, "متن نظر باید حداقل ۵ حرف باشد"),
});
type ReviewFormData = z.infer<typeof reviewSchema>;

type ProductReview = {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  adminReply?: string;
};

function mapReview(item: {
  _id?: string;
  id?: string;
  author?: string;
  rating?: number;
  text?: string;
  createdAt?: string;
  adminReply?: string;
}): ProductReview {
  const created = item.createdAt ? new Date(item.createdAt) : null;
  return {
    id: String(item._id || item.id),
    author: String(item.author || ""),
    rating: Number(item.rating || 0),
    text: String(item.text || ""),
    date: created ? created.toLocaleDateString("fa-IR") : "",
    adminReply: item.adminReply ? String(item.adminReply) : undefined,
  };
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [product, setProduct] = React.useState<Product | null | "loading">("loading");
  const [related, setRelated] = React.useState<Product[]>([]);
  const router = useRouter();
  const { addToCart } = useCart();
  const [qty, setQty] = React.useState(1);
  const [reviews, setReviews] = React.useState<ProductReview[]>([]);
  const [formRating, setFormRating] = React.useState(5);
  const [submitted, setSubmitted] = React.useState(false);
  const [reviewError, setReviewError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const reviewForm = useForm<ReviewFormData>({ resolver: zodResolver(reviewSchema), defaultValues: { author: "", text: "" } });

  React.useEffect(() => {
    let cancelled = false;
    fetch(`/api/products/${id}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then(async (item) => {
        if (cancelled) return;
        if (!item) {
          setProduct(null);
          return;
        }
        const current = serializeProduct(item);
        setProduct(current);
        const relatedRes = await fetch(`/api/products?categoryId=${encodeURIComponent(current.categoryId)}&limit=8`, { cache: "no-store" });
        const relatedData = relatedRes.ok ? await relatedRes.json() : { items: [] };
        const others = (relatedData.items || []).map(serializeProduct).filter((p: Product) => String(p.id) !== String(current.id)).slice(0, 4);
        if (!cancelled) setRelated(others);
      })
      .catch(() => {
        if (!cancelled) setProduct(null);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  React.useEffect(() => {
    let cancelled = false;
    fetch(`/api/reviews?productId=${encodeURIComponent(id)}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((items) => {
        if (!cancelled && Array.isArray(items)) setReviews(items.map(mapReview));
      })
      .catch(() => {
        if (!cancelled) setReviews([]);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (product === "loading") {
    return <div className="py-16 text-center text-muted-foreground">در حال بارگذاری...</div>;
  }
  if (!product) notFound();
  const category = getCategory(product.categoryId) ?? { id: product.categoryId, name: "", tint: "#6b7280" };
  const images = product.images?.filter(Boolean) || [];

  const count = reviews.length;
  const rating = count ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / count) * 10) / 10 : 0;

  const onSubmitReview = async (data: ReviewFormData) => {
    setReviewError("");
    setSubmitted(false);
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          author: data.author,
          rating: formRating,
          text: data.text,
        }),
      });
      const saved = await res.json().catch(() => ({}));
      if (!res.ok) {
        setReviewError(saved.error || "ثبت نظر انجام نشد.");
        return;
      }
      reviewForm.reset();
      setFormRating(5);
      setSubmitted(true);
    } catch {
      setReviewError("ثبت نظر انجام نشد.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <TrackRecentlyViewed productId={String(product.id)} />
      <div className="mb-4 text-[13px] text-muted-foreground">
        <Link href="/" className="hover:text-primary">خانه</Link> / <Link href={`/category/${category.id}`} className="hover:text-primary">{category.name}</Link> / {product.name}
      </div>
      <div className="mb-14 grid gap-10 md:grid-cols-2">
        <ProductImageSlider images={images} alt={product.name} />
        <div>
          <div className="mb-2 text-[13px] font-bold text-primary">{category.name}</div>
          <h1 className="mb-3 text-[28px] font-extrabold">{product.name}</h1>
          <div className="mb-5 flex items-center gap-2 text-[14px]">
            <StarRating rating={rating} size={16} />
            <span className="text-muted-foreground">{fmt(rating)} ({fmt(count)} نظر)</span>
          </div>
          <div className="mb-6 flex items-baseline gap-3">
            <div className="text-[26px] font-extrabold text-primary">{fmt(product.price)} تومان</div>
            {product.oldPrice && <div className="text-[15px] text-muted-foreground line-through">{fmt(product.oldPrice)} تومان</div>}
          </div>
          <p className="mb-6 text-[15px] leading-loose text-muted-foreground">{product.desc}</p>
          <div className="mb-5 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-xl border">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-accent"><Minus className="h-4 w-4" /></button>
              <div className="w-10 text-center font-bold">{qty}</div>
              <button onClick={() => setQty((q) => q + 1)} className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-accent"><Plus className="h-4 w-4" /></button>
            </div>
            <Button
              className="min-w-[180px] flex-1 py-6 text-[15px] font-bold shadow-lg"
              onClick={() => { addToCart(product.id, qty); router.push("/cart"); }}
            >
              افزودن به سبد خرید
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2.5 border-t pt-5">
            {product.specs.map((s) => (
              <div key={s.k} className="text-[13px] text-muted-foreground"><span className="font-semibold text-foreground">{s.k}:</span> {s.v}</div>
            ))}
          </div>
        </div>
      </div>
      <div className="mb-14">
        <h2 className="mb-5 flex items-center gap-2 text-xl font-extrabold text-primary">
          <MessageSquare className="h-5 w-5" /> نظرات کاربران ({fmt(count)})
        </h2>
        <form onSubmit={reviewForm.handleSubmit(onSubmitReview)} className="mb-8 flex flex-col gap-3 rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <Label className="shrink-0">امتیاز شما</Label>
            <StarRating rating={formRating} size={22} interactive onChange={setFormRating} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>نام شما</Label>
            <Input {...reviewForm.register("author")} placeholder="نام شما" />
            {reviewForm.formState.errors.author && <span className="text-xs text-destructive">{reviewForm.formState.errors.author.message}</span>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>نظر شما</Label>
            <Textarea {...reviewForm.register("text")} placeholder="نظر خود را درباره این محصول بنویسید..." rows={3} />
            {reviewForm.formState.errors.text && <span className="text-xs text-destructive">{reviewForm.formState.errors.text.message}</span>}
          </div>
          <Button type="submit" className="self-start font-bold" disabled={submitting}>
            {submitting ? "در حال ثبت..." : "ثبت نظر"}
          </Button>
          {submitted && (
            <p className="text-sm font-semibold text-primary">نظر شما ثبت شد و پس از تایید مدیر نمایش داده می‌شود.</p>
          )}
          {reviewError && <p className="text-sm text-destructive">{reviewError}</p>}
        </form>
        {reviews.length > 0 ? (
          <div className="flex flex-col gap-4">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-2xl border bg-card p-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-bold">{r.author}</span>
                  <span className="text-xs text-muted-foreground">{r.date}</span>
                </div>
                <StarRating rating={r.rating} size={14} />
                <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{r.text}</p>
                {r.adminReply && (
                  <p className="mt-3 rounded-xl bg-accent/60 p-3 text-[13px] text-foreground">
                    پاسخ فروشگاه: {r.adminReply}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">هنوز نظری برای این محصول تایید نشده است.</p>
        )}
      </div>
      {related.length > 0 && (
        <>
          <h2 className="mb-5 text-xl font-extrabold text-primary">محصولات مرتبط</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
