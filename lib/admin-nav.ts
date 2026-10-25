import {
  LayoutGrid,
  Package,
  Tag,
  GalleryHorizontal,
  ClipboardList,
  Users,
  MessageSquare,
  PawPrint,
  CircleHelp,
  Award,
  HeartHandshake,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

export type AdminSectionId =
  | "dashboard"
  | "products"
  | "categories"
  | "brands"
  | "breeds"
  | "slider"
  | "faq"
  | "orders"
  | "posts"
  | "reviews"
  | "comments"
  | "users"
  | "rehoming"
  | "vets";

export type AdminNavItem = {
  id: AdminSectionId;
  label: string;
  href: string;
  Icon: LucideIcon;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { id: "dashboard", label: "داشبورد", href: "/admin", Icon: LayoutGrid },
  { id: "products", label: "محصولات", href: "/admin/products", Icon: Package },
  { id: "categories", label: "دسته‌بندی‌ها", href: "/admin/categories", Icon: Tag },
  { id: "brands", label: "برندها", href: "/admin/brands", Icon: Award },
  { id: "breeds", label: "نژادها", href: "/admin/breeds", Icon: PawPrint },
  { id: "slider", label: "اسلایدر", href: "/admin/slider", Icon: GalleryHorizontal },
  { id: "faq", label: "سؤالات متداول", href: "/admin/faq", Icon: CircleHelp },
  { id: "orders", label: "سفارش‌ها", href: "/admin/orders", Icon: ClipboardList },
  { id: "posts", label: "پست‌های بلاگ", href: "/admin/posts", Icon: ClipboardList },
  { id: "rehoming", label: "واگذاری", href: "/admin/rehoming", Icon: HeartHandshake },
  { id: "vets", label: "دامپزشکان", href: "/admin/vets", Icon: Stethoscope },
  { id: "reviews", label: "نظرات محصولات", href: "/admin/reviews", Icon: MessageSquare },
  { id: "comments", label: "نظرات بلاگ", href: "/admin/comments", Icon: ClipboardList },
  { id: "users", label: "کاربران", href: "/admin/users", Icon: Users },
];

export function isAdminSectionId(value: string): value is AdminSectionId {
  return ADMIN_NAV.some((item) => item.id === value);
}
