"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LayoutGrid, Package, Tag, GalleryHorizontal, ClipboardList, Users, LogOut, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PawLogo } from "@/components/paw-logo";
import { ImageUploader } from "@/components/image-uploader";
import { ProductImage } from "@/components/product-image";
import { PostEditor } from "@/components/post-editor";
import { htmlPlainText, paragraphsToHtml, sanitizeHtml } from "@/lib/html";
import { fmt } from "@/lib/data";

const productSchema = z.object({
  name: z.string().min(2, "نام محصول را وارد کنید"),
  category: z.string().min(1, "دسته‌بندی را انتخاب کنید"),
  price: z.coerce.number().min(1, "قیمت معتبر وارد کنید"),
  stock: z.coerce.number().min(0, "موجودی معتبر وارد کنید"),
});
type ProductFormData = z.infer<typeof productSchema>;

const postSchema = z.object({
  title: z.string().min(3, "عنوان پست را وارد کنید"),
  category: z.string().min(1, "دسته را وارد کنید"),
  author: z.string().min(2, "نام نویسنده را وارد کنید"),
  excerpt: z.string().min(5, "خلاصه را وارد کنید"),
  body: z.string().refine(
    (val) => htmlPlainText(val).length >= 10 || /<img\s/i.test(val) || /<figure[\s>]/i.test(val),
    "متن پست را وارد کنید"
  ),
});
type PostFormData = z.infer<typeof postSchema>;
const slideSchema = z.object({
  title: z.string().min(2, "عنوان اسلاید را وارد کنید"),
  subtitle: z.string().min(2, "زیرعنوان را وارد کنید"),
});
type SlideFormData = z.infer<typeof slideSchema>;

const TABS = [
  { id: "dashboard", label: "داشبورد", Icon: LayoutGrid },
  { id: "products", label: "محصولات", Icon: Package },
  { id: "categories", label: "دسته‌بندی‌ها", Icon: Tag },
  { id: "slider", label: "اسلایدر", Icon: GalleryHorizontal },
  { id: "orders", label: "سفارش‌ها", Icon: ClipboardList },
  { id: "posts", label: "پست‌های بلاگ", Icon: ClipboardList },
  { id: "comments", label: "نظرات بلاگ", Icon: ClipboardList },
  { id: "users", label: "کاربران", Icon: Users },
] as const;
type TabId = (typeof TABS)[number]["id"];

type AdminProduct = { id: string; name: string; categoryId: string; category: string; price: number; stock: number; images: string[] };
type AdminPost = { id: string; title: string; category: string; author: string; date: string; excerpt: string; paragraphs: string[]; content?: string; coverImage?: string };
type AdminSlide = { id: string; title: string; subtitle: string; tint: string };
type AdminComment = { id: string; name: string; text: string; status: "approved" | "pending" | "rejected"; postTitle: string };
type AdminOrder = { id: string; customer: string; userId: string; total: number; date: string; status: string };
type AdminUser = { id: string; name: string; phone: string; email: string; orders: number };

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending_payment: "در انتظار پرداخت",
  paid: "پرداخت شده",
  processing: "پردازش",
  shipped: "ارسال شده",
  delivered: "تحویل شده",
  cancelled: "لغو شده",
};
const ORDER_STATUS_KEYS = Object.keys(ORDER_STATUS_LABEL);

export default function AdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [tab, setTab] = React.useState<TabId>("dashboard");
  const [navOpen, setNavOpen] = React.useState(false);

  React.useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && session?.user?.role !== "admin")) {
      router.replace("/login");
    }
  }, [status, session, router]);

  React.useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "admin") return;
    fetch("/api/categories?all=true", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((items) => {
        if (!Array.isArray(items)) return;
        setCategories(items.map((item: { id: string; name: string; active?: boolean }) => ({
          id: String(item.id),
          name: String(item.name),
          active: item.active !== false,
        })));
      })
      .catch(() => {});
    fetch("/api/products?limit=100", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => {
        const items = Array.isArray(data.items) ? data.items : [];
        setProducts(items.map((item: { id: string; name: string; categoryId: string; price: number; stock?: number; images?: string[] }) => ({
          id: String(item.id),
          name: String(item.name),
          categoryId: String(item.categoryId),
          category: "",
          price: Number(item.price),
          stock: Number(item.stock ?? 0),
          images: Array.isArray(item.images) ? item.images.map(String) : [],
        })));
      })
      .catch(() => {});
    fetch("/api/blog?limit=50", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => {
        const items = Array.isArray(data.items) ? data.items : [];
        setPosts(items.map((item: AdminPost) => ({
          id: String(item.id),
          title: String(item.title),
          category: String(item.category || ""),
          author: String(item.author || ""),
          date: String(item.date || ""),
          excerpt: String(item.excerpt || ""),
          paragraphs: Array.isArray(item.paragraphs) ? item.paragraphs : [],
          content: String(item.content || ""),
          coverImage: String(item.coverImage || ""),
        })));
      })
      .catch(() => {});
    fetch("/api/slider", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((items) => {
        if (!Array.isArray(items)) return;
        setSlides(items.map((item: { _id?: string; id?: string; title: string; subtitle?: string; from?: string }) => ({
          id: String(item.id || item._id),
          title: String(item.title),
          subtitle: String(item.subtitle || ""),
          tint: String(item.from || "#2f7d4f"),
        })));
      })
      .catch(() => {});
    fetch("/api/blog-comments?status=all", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((items) => {
        if (!Array.isArray(items)) return;
        setComments(items.map((item: { _id?: string; id?: string; author?: string; text?: string; status?: string; postId?: { title?: string } }) => ({
          id: String(item._id || item.id),
          name: String(item.author || ""),
          text: String(item.text || ""),
          status: (item.status === "rejected" || item.status === "pending" ? item.status : "approved") as AdminComment["status"],
          postTitle: String(item.postId?.title || ""),
        })));
      })
      .catch(() => {});
    fetch("/api/orders?all=true", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((items) => {
        if (!Array.isArray(items)) return;
        const mapped: AdminOrder[] = items.map((item: { _id?: string; id?: string; userId?: { _id?: string; name?: string; email?: string } | string; address?: { name?: string }; total?: number; createdAt?: string; status?: string }) => {
          const created = item.createdAt ? new Date(item.createdAt) : null;
          const user = typeof item.userId === "object" && item.userId ? item.userId : null;
          return {
            id: String(item._id || item.id),
            customer: String(user?.name || item.address?.name || user?.email || "کاربر"),
            userId: String(user?._id || item.userId || ""),
            total: Number(item.total || 0),
            date: created ? created.toLocaleDateString("fa-IR") : "",
            status: String(item.status || "pending_payment"),
          };
        });
        setOrders(mapped);
      })
      .catch(() => {});
    fetch("/api/users", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((items) => {
        if (!Array.isArray(items)) return;
        setUsers(items.map((item: { _id?: string; id?: string; name?: string; phone?: string; email?: string }) => ({
          id: String(item._id || item.id),
          name: String(item.name || "کاربر"),
          phone: String(item.phone || "—"),
          email: String(item.email || ""),
          orders: 0,
        })));
      })
      .catch(() => {});
  }, [status, session]);

  const [products, setProducts] = React.useState<AdminProduct[]>([]);
  const [editingId, setEditingId] = React.useState<string | null | undefined>(undefined);
  const [productBusy, setProductBusy] = React.useState(false);
  const [productError, setProductError] = React.useState("");
  const [productImages, setProductImages] = React.useState<string[]>([]);
  const productForm = useForm<ProductFormData>({ resolver: zodResolver(productSchema), defaultValues: { name: "", category: "", price: 0, stock: 0 } });
  const [categories, setCategories] = React.useState<{ id: string; name: string; active: boolean }[]>([]);
  const [newCategoryName, setNewCategoryName] = React.useState("");
  const [categoryBusy, setCategoryBusy] = React.useState(false);
  const [categoryError, setCategoryError] = React.useState("");
  const [categoryConfirm, setCategoryConfirm] = React.useState<{ id: string; name: string; active: boolean } | null>(null);
  const [slides, setSlides] = React.useState<AdminSlide[]>([]);
  const [editingSlideId, setEditingSlideId] = React.useState<string | null | undefined>(undefined);
  const [slideBusy, setSlideBusy] = React.useState(false);
  const [slideError, setSlideError] = React.useState("");
  const slideForm = useForm<SlideFormData>({ resolver: zodResolver(slideSchema), defaultValues: { title: "", subtitle: "" } });
  const [orders, setOrders] = React.useState<AdminOrder[]>([]);
  const [orderError, setOrderError] = React.useState("");
  const [posts, setPosts] = React.useState<AdminPost[]>([]);
  const [editingPostId, setEditingPostId] = React.useState<string | null | undefined>(undefined);
  const [postBusy, setPostBusy] = React.useState(false);
  const [postError, setPostError] = React.useState("");
  const [postCover, setPostCover] = React.useState("");
  const [postEditorKey, setPostEditorKey] = React.useState(0);
  const postHtmlRef = React.useRef("");
  const postForm = useForm<PostFormData>({ resolver: zodResolver(postSchema), defaultValues: { title: "", category: "", author: "تیم Pet24", excerpt: "", body: "" } });
  const [comments, setComments] = React.useState<AdminComment[]>([]);
  const [users, setUsers] = React.useState<AdminUser[]>([]);

  if (status !== "authenticated" || session?.user?.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        در حال بررسی دسترسی...
      </div>
    );
  }

  const totalSales = orders.reduce((s, o) => s + o.total, 0);

  const startAddProduct = () => {
    const defaultCategory = categories.find((c) => c.active)?.id || categories[0]?.id || "";
    setEditingId(null);
    productForm.reset({ name: "", category: defaultCategory, price: 0, stock: 0 });
    setProductImages([]);
  };
  const setCategoryActive = async (id: string, active: boolean) => {
    setCategoryBusy(true);
    setCategoryError("");
    setCategoryConfirm(null);
    try {
      const res = await fetch(`/api/categories/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setCategoryError(data.error || (active ? "فعال‌سازی دسته‌بندی انجام نشد." : "غیرفعال‌سازی دسته‌بندی انجام نشد."));
        return;
      }
      setCategories((current) => current.map((item) => (item.id === id ? { ...item, active } : item)));
    } catch {
      setCategoryError(active ? "فعال‌سازی دسته‌بندی انجام نشد." : "غیرفعال‌سازی دسته‌بندی انجام نشد.");
    } finally {
      setCategoryBusy(false);
    }
  };
  const startEditProduct = (p: AdminProduct) => {
    setEditingId(p.id);
    productForm.reset({ name: p.name, category: p.categoryId, price: p.price, stock: p.stock });
    setProductImages(p.images || []);
  };
  const saveProduct = async (data: ProductFormData) => {
    setProductBusy(true);
    setProductError("");
    try {
      const payload = { name: data.name, categoryId: data.category, price: data.price, stock: data.stock, featured: true, desc: "", type: "عمومی", images: productImages };
      const res = await fetch(editingId ? `/api/products/${editingId}` : "/api/products", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const saved = await res.json();
      if (!res.ok) {
        setProductError(saved.error || "ذخیره محصول انجام نشد.");
        return;
      }
      const rec: AdminProduct = {
        id: String(saved.id),
        name: String(saved.name),
        categoryId: String(saved.categoryId),
        category: categories.find((c) => c.id === saved.categoryId)?.name || "",
        price: Number(saved.price),
        stock: Number(saved.stock ?? 0),
        images: Array.isArray(saved.images) ? saved.images.map(String) : productImages,
      };
      setProducts((ps) => (ps.some((p) => p.id === rec.id) ? ps.map((p) => (p.id === rec.id ? rec : p)) : [rec, ...ps]));
      setEditingId(undefined);
      setProductImages([]);
    } catch {
      setProductError("ذخیره محصول انجام نشد.");
    } finally {
      setProductBusy(false);
    }
  };

  const startAddPost = () => {
    setEditingPostId(null);
    postHtmlRef.current = "";
    postForm.reset({ title: "", category: "", author: session?.user?.name || "تیم Pet24", excerpt: "", body: "" });
    setPostCover("");
    setPostEditorKey((key) => key + 1);
  };
  const startEditPost = async (post: AdminPost) => {
    let body = post.content || paragraphsToHtml(post.paragraphs);
    setEditingPostId(post.id);
    postHtmlRef.current = body;
    postForm.reset({
      title: post.title,
      category: post.category,
      author: post.author,
      excerpt: post.excerpt,
      body,
    });
    setPostCover(post.coverImage || "");
    setPostEditorKey((key) => key + 1);
    try {
      const res = await fetch(`/api/blog/${post.id}`, { cache: "no-store" });
      if (!res.ok) return;
      const full = await res.json();
      body = String(full.content || paragraphsToHtml(Array.isArray(full.paragraphs) ? full.paragraphs : []));
      postHtmlRef.current = body;
      postForm.reset({
        title: String(full.title || post.title),
        category: String(full.category || post.category),
        author: String(full.author || post.author),
        excerpt: String(full.excerpt || post.excerpt),
        body,
      });
      setPostCover(String(full.coverImage || post.coverImage || ""));
      setPostEditorKey((key) => key + 1);
    } catch {
      /* keep list payload */
    }
  };
  const savePost = async (data: PostFormData) => {
    setPostBusy(true);
    setPostError("");
    try {
      const body = postHtmlRef.current || data.body;
      const res = await fetch(editingPostId ? `/api/blog/${editingPostId}` : "/api/blog", {
        method: editingPostId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, body, coverImage: postCover }),
      });
      const saved = await res.json();
      if (!res.ok) {
        setPostError(saved.error || "ذخیره پست انجام نشد.");
        return;
      }
      const rec: AdminPost = {
        id: String(saved.id),
        title: String(saved.title),
        category: String(saved.category || ""),
        author: String(saved.author || ""),
        date: String(saved.date || ""),
        excerpt: String(saved.excerpt || ""),
        paragraphs: Array.isArray(saved.paragraphs) ? saved.paragraphs : [],
        content: String(saved.content || body),
        coverImage: String(saved.coverImage || postCover),
      };
      setPosts((current) => (current.some((p) => p.id === rec.id) ? current.map((p) => (p.id === rec.id ? rec : p)) : [rec, ...current]));
      setEditingPostId(undefined);
      setPostCover("");
    } catch {
      setPostError("ذخیره پست انجام نشد.");
    } finally {
      setPostBusy(false);
    }
  };

  const startAddSlide = () => {
    setEditingSlideId(null);
    slideForm.reset({ title: "", subtitle: "" });
  };
  const startEditSlide = (slide: AdminSlide) => {
    setEditingSlideId(slide.id);
    slideForm.reset({ title: slide.title, subtitle: slide.subtitle });
  };
  const saveSlide = async (data: SlideFormData) => {
    setSlideBusy(true);
    setSlideError("");
    try {
      const res = await fetch(editingSlideId ? `/api/slider/${editingSlideId}` : "/api/slider", {
        method: editingSlideId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          tag: "ویژه",
                      catId: categories.find((c) => c.active)?.id || categories[0]?.id || "dog",
          from: "#2f7d4f",
          to: "#1f4d38",
        }),
      });
      const saved = await res.json();
      if (!res.ok) {
        setSlideError(saved.error || "ذخیره اسلاید انجام نشد.");
        return;
      }
      const rec: AdminSlide = {
        id: String(saved.id || saved._id),
        title: String(saved.title),
        subtitle: String(saved.subtitle || ""),
        tint: String(saved.from || "#2f7d4f"),
      };
      setSlides((current) => (current.some((s) => s.id === rec.id) ? current.map((s) => (s.id === rec.id ? rec : s)) : [...current, rec]));
      setEditingSlideId(undefined);
    } catch {
      setSlideError("ذخیره اسلاید انجام نشد.");
    } finally {
      setSlideBusy(false);
    }
  };

  const NavList = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <div className="mb-5 flex items-center gap-2.5 px-1">
        <PawLogo size={36} />
        <div className="font-extrabold text-primary">پنل مدیریت</div>
      </div>
      {TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => { setTab(t.id); setEditingId(undefined); setEditingPostId(undefined); setEditingSlideId(undefined); onNavigate?.(); }}
          className={`flex items-center gap-2.5 rounded-[10px] px-3.5 py-3 text-sm font-semibold ${tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}
        >
          <t.Icon className="h-[17px] w-[17px] shrink-0" strokeWidth={1.8} />{t.label}
        </button>
      ))}
      <div className="mt-auto flex flex-col gap-1">
        <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-2 rounded-[10px] px-3.5 py-3 text-sm font-semibold text-destructive">
          <LogOut className="h-4 w-4" />خروج از حساب
        </button>
        <Link href="/" className="px-3.5 py-3 text-[13px] text-muted-foreground">بازگشت به فروشگاه</Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-20 flex items-center gap-3 border-b bg-card px-4 py-3.5 md:hidden">
        <Sheet open={navOpen} onOpenChange={setNavOpen}>
          <SheetTrigger asChild>
            <button className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border"><Menu className="h-[18px] w-[18px] text-primary" /></button>
          </SheetTrigger>
          <SheetContent side="right" className="flex flex-col gap-1 p-5"><NavList onNavigate={() => setNavOpen(false)} /></SheetContent>
        </Sheet>
        <div className="text-[15px] font-extrabold text-primary">پنل مدیریت</div>
      </div>

      <div className="grid min-h-screen md:grid-cols-[230px_1fr]">
        <aside className="hidden flex-col gap-1 border-l bg-card p-3.5 md:flex">
          <NavList />
        </aside>

        <main className="p-5 md:p-8">
          {tab === "dashboard" && (
            <>
              <h1 className="mb-5 text-[22px] font-extrabold text-primary">داشبورد</h1>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  { label: "فروش کل", value: fmt(totalSales) + " تومان" },
                  { label: "تعداد سفارش", value: orders.length },
                  { label: "تعداد محصولات", value: products.length },
                  { label: "موجودی کم", value: products.filter((p) => p.stock < 5).length, danger: true },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl border bg-card p-5">
                    <div className="mb-2 text-xs text-muted-foreground">{s.label}</div>
                    <div className={`text-xl font-extrabold ${s.danger ? "text-destructive" : "text-primary"}`}>{s.value}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "products" && (
            <>
              <div className="mb-5 flex items-center justify-between"><h1 className="text-[22px] font-extrabold text-primary">محصولات</h1><Button type="button" onClick={startAddProduct} className="font-bold">افزودن محصول</Button></div>
              {productError && <p className="mb-3 text-sm text-destructive">{productError}</p>}
              {editingId !== undefined && (
                <form onSubmit={productForm.handleSubmit(saveProduct)} className="mb-5 grid gap-3 rounded-2xl border bg-card p-5 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
                  <div className="col-span-full flex flex-col gap-1.5">
                    <Label>نام محصول</Label>
                    <Input {...productForm.register("name")} placeholder="نام محصول" />
                    {productForm.formState.errors.name && <span className="text-xs text-destructive">{productForm.formState.errors.name.message}</span>}
                  </div>
                  <ImageUploader
                    values={productImages}
                    onChange={setProductImages}
                    folder="products"
                    label="تصاویر محصول"
                    disabled={productBusy}
                  />
                  <div className="flex flex-col gap-1.5">
                    <Label>دسته‌بندی</Label>
                    <Select value={productForm.watch("category")} onValueChange={(v) => productForm.setValue("category", v, { shouldValidate: true })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.active ? c.name : `${c.name} (غیرفعال)`}</SelectItem>)}</SelectContent>
                    </Select>
                    {productForm.formState.errors.category && <span className="text-xs text-destructive">{productForm.formState.errors.category.message}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>قیمت (تومان)</Label>
                    <Input type="number" {...productForm.register("price")} placeholder="قیمت (تومان)" />
                    {productForm.formState.errors.price && <span className="text-xs text-destructive">{productForm.formState.errors.price.message}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>موجودی</Label>
                    <Input type="number" {...productForm.register("stock")} placeholder="موجودی" />
                    {productForm.formState.errors.stock && <span className="text-xs text-destructive">{productForm.formState.errors.stock.message}</span>}
                  </div>
                  <div className="col-span-full flex gap-2.5"><Button type="submit" disabled={productBusy} className="font-bold">ذخیره</Button><Button type="button" variant="outline" onClick={() => { setEditingId(undefined); setProductImages([]); }}>انصراف</Button></div>
                </form>
              )}
              <div className="rounded-2xl border bg-card">
                <Table>
                  <TableHeader><TableRow><TableHead>تصویر</TableHead><TableHead>نام</TableHead><TableHead>دسته</TableHead><TableHead>قیمت</TableHead><TableHead>موجودی</TableHead><TableHead></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {products.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <ProductImage src={p.images[0]} alt={p.name} className="h-11 w-11 rounded-lg" />
                        </TableCell>
                        <TableCell>{p.name}</TableCell><TableCell>{categories.find((c) => c.id === p.categoryId)?.name || p.category}</TableCell><TableCell>{fmt(p.price)}</TableCell><TableCell>{p.stock}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <button onClick={() => startEditProduct(p)} className="ml-3.5 font-semibold text-primary">ویرایش</button>
                          <button
                            disabled={productBusy}
                            onClick={async () => {
                              setProductBusy(true);
                              setProductError("");
                              try {
                                const res = await fetch(`/api/products/${p.id}`, { method: "DELETE" });
                                if (!res.ok) {
                                  setProductError("حذف محصول انجام نشد.");
                                  return;
                                }
                                setProducts((ps) => ps.filter((x) => x.id !== p.id));
                              } catch {
                                setProductError("حذف محصول انجام نشد.");
                              } finally {
                                setProductBusy(false);
                              }
                            }}
                            className="font-semibold text-destructive"
                          >حذف</button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          {tab === "categories" && (
            <>
              <h1 className="mb-5 text-[22px] font-extrabold text-primary">دسته‌بندی‌ها</h1>
              <div className="mb-5 flex flex-wrap gap-2.5">
                <Input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="نام دسته جدید" className="max-w-[280px] flex-1" />
                <Button
                  disabled={categoryBusy}
                  onClick={async () => {
                    const name = newCategoryName.trim();
                    if (!name) return;
                    setCategoryBusy(true);
                    setCategoryError("");
                    try {
                      const res = await fetch("/api/categories", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name }),
                      });
                      const data = await res.json();
                      if (!res.ok) {
                        setCategoryError(data.error || "ذخیره دسته‌بندی انجام نشد.");
                        return;
                      }
                      setCategories((current) => [...current, { id: String(data.id), name: String(data.name), active: data.active !== false }]);
                      setNewCategoryName("");
                    } catch {
                      setCategoryError("ذخیره دسته‌بندی انجام نشد.");
                    } finally {
                      setCategoryBusy(false);
                    }
                  }}
                  className="font-bold"
                >افزودن</Button>
              </div>
              {categoryError && <p className="mb-3 text-sm text-destructive">{categoryError}</p>}
              <div className="flex max-w-[560px] flex-col gap-2">
                {categories.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-3 rounded-[10px] border bg-card px-4 py-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">{c.name}</div>
                      <div className={`text-xs font-bold ${c.active ? "text-primary" : "text-muted-foreground"}`}>
                        {c.active ? "فعال" : "غیرفعال"}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        disabled={categoryBusy || c.active}
                        onClick={() => setCategoryConfirm({ id: c.id, name: c.name, active: true })}
                        className={`rounded-full border px-3 py-1 text-[13px] font-semibold ${c.active ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                      >فعال</button>
                      <button
                        type="button"
                        disabled={categoryBusy || !c.active}
                        onClick={() => setCategoryConfirm({ id: c.id, name: c.name, active: false })}
                        className={`rounded-full border px-3 py-1 text-[13px] font-semibold ${!c.active ? "border-destructive bg-destructive text-destructive-foreground" : "text-muted-foreground"}`}
                      >غیرفعال</button>
                    </div>
                  </div>
                ))}
              </div>
              <Dialog open={!!categoryConfirm} onOpenChange={(open) => { if (!open && !categoryBusy) setCategoryConfirm(null); }}>
                <DialogContent className="max-w-[420px]">
                  <DialogHeader>
                    <DialogTitle>{categoryConfirm?.active ? "فعال کردن دسته‌بندی" : "غیرفعال کردن دسته‌بندی"}</DialogTitle>
                    <DialogDescription>
                      {categoryConfirm?.active
                        ? `آیا از فعال کردن دسته «${categoryConfirm.name}» مطمئن هستید؟ این دسته دوباره در فروشگاه نمایش داده می‌شود.`
                        : `آیا از غیرفعال کردن دسته «${categoryConfirm?.name}» مطمئن هستید؟ این دسته از منوی فروشگاه مخفی می‌شود.`}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button type="button" variant="outline" disabled={categoryBusy} onClick={() => setCategoryConfirm(null)}>انصراف</Button>
                    <Button
                      type="button"
                      disabled={categoryBusy || !categoryConfirm}
                      variant={categoryConfirm?.active ? "default" : "destructive"}
                      onClick={() => categoryConfirm && setCategoryActive(categoryConfirm.id, categoryConfirm.active)}
                    >تایید</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}

          {tab === "slider" && (
            <>
              <div className="mb-5 flex items-center justify-between">
                <h1 className="text-[22px] font-extrabold text-primary">اسلایدر صفحه اصلی</h1>
                <Button type="button" onClick={startAddSlide} className="font-bold">افزودن اسلاید</Button>
              </div>
              {slideError && <p className="mb-3 text-sm text-destructive">{slideError}</p>}
              {editingSlideId !== undefined && (
                <form onSubmit={slideForm.handleSubmit(saveSlide)} className="mb-5 flex flex-col gap-3 rounded-2xl border bg-card p-5">
                  <div className="flex flex-col gap-1.5">
                    <Label>عنوان</Label>
                    <Input {...slideForm.register("title")} placeholder="عنوان اسلاید" />
                    {slideForm.formState.errors.title && <span className="text-xs text-destructive">{slideForm.formState.errors.title.message}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>زیرعنوان</Label>
                    <Input {...slideForm.register("subtitle")} placeholder="زیرعنوان" />
                    {slideForm.formState.errors.subtitle && <span className="text-xs text-destructive">{slideForm.formState.errors.subtitle.message}</span>}
                  </div>
                  <div className="flex gap-2.5">
                    <Button type="submit" disabled={slideBusy} className="font-bold">ذخیره</Button>
                    <Button type="button" variant="outline" onClick={() => setEditingSlideId(undefined)}>انصراف</Button>
                  </div>
                </form>
              )}
              <div className="flex flex-col gap-2.5">
                {slides.map((sl) => (
                  <div key={sl.id} className="flex items-center gap-4 rounded-xl border bg-card p-3.5">
                    <div className="h-10 w-14 shrink-0 rounded-lg" style={{ background: sl.tint }} />
                    <div className="flex-1"><div className="text-sm font-bold">{sl.title}</div><div className="text-xs text-muted-foreground">{sl.subtitle}</div></div>
                    <button onClick={() => startEditSlide(sl)} className="text-[13px] font-semibold text-primary">ویرایش</button>
                    <button
                      disabled={slideBusy}
                      onClick={async () => {
                        setSlideBusy(true);
                        setSlideError("");
                        try {
                          const res = await fetch(`/api/slider/${sl.id}`, { method: "DELETE" });
                          if (!res.ok) {
                            setSlideError("حذف اسلاید انجام نشد.");
                            return;
                          }
                          setSlides((current) => current.filter((item) => item.id !== sl.id));
                        } catch {
                          setSlideError("حذف اسلاید انجام نشد.");
                        } finally {
                          setSlideBusy(false);
                        }
                      }}
                      className="text-[13px] font-semibold text-destructive"
                    >حذف</button>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "orders" && (
            <>
              <h1 className="mb-5 text-[22px] font-extrabold text-primary">سفارش‌ها</h1>
              {orderError && <p className="mb-3 text-sm text-destructive">{orderError}</p>}
              <div className="rounded-2xl border bg-card">
                <Table>
                  <TableHeader><TableRow><TableHead>شماره</TableHead><TableHead>مشتری</TableHead><TableHead>مبلغ</TableHead><TableHead>تاریخ</TableHead><TableHead>وضعیت</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">هنوز سفارشی ثبت نشده است.</TableCell></TableRow>
                    ) : orders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono text-xs">{o.id.slice(-8)}</TableCell><TableCell>{o.customer}</TableCell><TableCell>{fmt(o.total)}</TableCell><TableCell>{o.date}</TableCell>
                        <TableCell>
                          <Select
                            value={o.status}
                            onValueChange={async (v) => {
                              const previous = o.status;
                              setOrders((os) => os.map((x) => (x.id === o.id ? { ...x, status: v } : x)));
                              setOrderError("");
                              try {
                                const res = await fetch(`/api/orders/${o.id}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ status: v }),
                                });
                                if (!res.ok) {
                                  setOrders((os) => os.map((x) => (x.id === o.id ? { ...x, status: previous } : x)));
                                  setOrderError("به‌روزرسانی وضعیت سفارش انجام نشد.");
                                }
                              } catch {
                                setOrders((os) => os.map((x) => (x.id === o.id ? { ...x, status: previous } : x)));
                                setOrderError("به‌روزرسانی وضعیت سفارش انجام نشد.");
                              }
                            }}
                          >
                            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                            <SelectContent>{ORDER_STATUS_KEYS.map((s) => <SelectItem key={s} value={s}>{ORDER_STATUS_LABEL[s]}</SelectItem>)}</SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          {tab === "posts" && (
            <>
              <div className="mb-5 flex items-center justify-between">
                <h1 className="text-[22px] font-extrabold text-primary">پست‌های بلاگ</h1>
                <Button type="button" onClick={startAddPost} className="font-bold">افزودن پست</Button>
              </div>
              {postError && <p className="mb-3 text-sm text-destructive">{postError}</p>}
              {editingPostId !== undefined && (
                <form onSubmit={postForm.handleSubmit(savePost)} className="mb-5 flex flex-col gap-3 rounded-2xl border bg-card p-5">
                  <ImageUploader
                    values={postCover ? [postCover] : []}
                    onChange={(urls) => setPostCover(urls[0] || "")}
                    max={1}
                    folder="posts"
                    label="تصویر پست"
                    disabled={postBusy}
                  />
                  <div className="flex flex-col gap-1.5">
                    <Label>عنوان</Label>
                    <Input {...postForm.register("title")} placeholder="عنوان پست" />
                    {postForm.formState.errors.title && <span className="text-xs text-destructive">{postForm.formState.errors.title.message}</span>}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <Label>دسته</Label>
                      <Input {...postForm.register("category")} placeholder="مثلا تغذیه" />
                      {postForm.formState.errors.category && <span className="text-xs text-destructive">{postForm.formState.errors.category.message}</span>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label>نویسنده</Label>
                      <Input {...postForm.register("author")} placeholder="نام نویسنده" />
                      {postForm.formState.errors.author && <span className="text-xs text-destructive">{postForm.formState.errors.author.message}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>خلاصه</Label>
                    <Textarea {...postForm.register("excerpt")} placeholder="خلاصه کوتاه پست" rows={2} />
                    {postForm.formState.errors.excerpt && <span className="text-xs text-destructive">{postForm.formState.errors.excerpt.message}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>متن پست</Label>
                    <Controller
                      control={postForm.control}
                      name="body"
                      render={({ field }) => (
                        <PostEditor
                          key={postEditorKey}
                          initialData={field.value}
                          disabled={postBusy}
                          onChange={(html) => {
                            postHtmlRef.current = html;
                            field.onChange(html);
                          }}
                        />
                      )}
                    />
                    {postForm.formState.errors.body && <span className="text-xs text-destructive">{postForm.formState.errors.body.message}</span>}
                    {postForm.watch("body") ? (
                      <div className="rounded-xl border bg-muted/40 p-4">
                        <div className="mb-2 text-xs font-bold text-muted-foreground">پیش‌نمایش مطلب</div>
                        <div
                          className="blog-html text-sm text-foreground/90"
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(postForm.watch("body")) }}
                        />
                      </div>
                    ) : null}
                  </div>
                  <div className="flex gap-2.5">
                    <Button type="submit" disabled={postBusy} className="font-bold">ذخیره</Button>
                    <Button type="button" variant="outline" onClick={() => { setEditingPostId(undefined); setPostCover(""); }}>انصراف</Button>
                  </div>
                </form>
              )}
              <div className="rounded-2xl border bg-card">
                <Table>
                  <TableHeader><TableRow><TableHead>تصویر</TableHead><TableHead>عنوان</TableHead><TableHead>دسته</TableHead><TableHead>نویسنده</TableHead><TableHead>تاریخ</TableHead><TableHead></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {posts.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">پستی ثبت نشده. روی «افزودن پست» بزنید.</TableCell></TableRow>
                    ) : posts.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <ProductImage src={p.coverImage} alt={p.title} className="h-11 w-11 rounded-lg" />
                        </TableCell>
                        <TableCell>{p.title}</TableCell><TableCell>{p.category}</TableCell><TableCell>{p.author}</TableCell><TableCell>{p.date}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <button onClick={() => startEditPost(p)} className="ml-3.5 font-semibold text-primary">ویرایش</button>
                          <button
                            disabled={postBusy}
                            onClick={async () => {
                              setPostBusy(true);
                              setPostError("");
                              try {
                                const res = await fetch(`/api/blog/${p.id}`, { method: "DELETE" });
                                if (!res.ok) {
                                  setPostError("حذف پست انجام نشد.");
                                  return;
                                }
                                setPosts((current) => current.filter((item) => item.id !== p.id));
                              } catch {
                                setPostError("حذف پست انجام نشد.");
                              } finally {
                                setPostBusy(false);
                              }
                            }}
                            className="font-semibold text-destructive"
                          >حذف</button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          {tab === "comments" && (
            <>
              <h1 className="mb-5 text-[22px] font-extrabold text-primary">نظرات بلاگ</h1>
              <div className="flex flex-col gap-2.5">
                {comments.length === 0 && (
                  <div className="rounded-xl border bg-card py-8 text-center text-sm text-muted-foreground">نظری برای بررسی وجود ندارد.</div>
                )}
                {comments.map((c) => (
                  <div key={c.id} className="rounded-xl border bg-card p-4">
                    <div className="mb-1.5 flex justify-between">
                      <span className="text-[13px] font-bold">{c.name}</span>
                      <span className={`text-xs font-bold ${c.status === "approved" ? "text-primary" : c.status === "pending" ? "text-[#c17d2f]" : "text-destructive"}`}>
                        {c.status === "approved" ? "تایید شده" : c.status === "pending" ? "در انتظار تایید" : "رد شده"}
                      </span>
                    </div>
                    <div className="mb-2 text-xs text-muted-foreground">روی پست: {c.postTitle}</div>
                    <div className="mb-3 text-sm leading-relaxed text-muted-foreground">{c.text}</div>
                    {c.status === "pending" && (
                      <div className="flex gap-3.5">
                        <button
                          onClick={async () => {
                            const res = await fetch(`/api/blog-comments/${c.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "approved" }) });
                            if (res.ok) setComments((cs) => cs.map((x) => (x.id === c.id ? { ...x, status: "approved" } : x)));
                          }}
                          className="text-[13px] font-semibold text-primary"
                        >تایید</button>
                        <button
                          onClick={async () => {
                            const res = await fetch(`/api/blog-comments/${c.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "rejected" }) });
                            if (res.ok) setComments((cs) => cs.map((x) => (x.id === c.id ? { ...x, status: "rejected" } : x)));
                          }}
                          className="text-[13px] font-semibold text-destructive"
                        >رد</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "users" && (
            <>
              <h1 className="mb-5 text-[22px] font-extrabold text-primary">کاربران</h1>
              <div className="rounded-2xl border bg-card">
                <Table>
                  <TableHeader><TableRow><TableHead>نام</TableHead><TableHead>موبایل</TableHead><TableHead>تعداد سفارش</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="py-8 text-center text-sm text-muted-foreground">کاربری ثبت نشده است.</TableCell></TableRow>
                    ) : users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>{u.name}</TableCell>
                        <TableCell>{u.phone !== "—" ? u.phone : u.email}</TableCell>
                        <TableCell>{orders.filter((o) => o.userId === u.id).length}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
