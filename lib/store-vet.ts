import { isIranCity, isIranProvince } from "@/lib/iran-locations";

export const VET_COMMENT_STATUSES = ["pending", "approved", "rejected"] as const;
export type VetCommentStatus = (typeof VET_COMMENT_STATUSES)[number];

export const RESERVATION_STATUSES = ["pending", "confirmed", "done", "cancelled"] as const;
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export type PublicVet = {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  province: string;
  city: string;
  address: string;
  phone: string;
  images: string[];
  lat: number | null;
  lng: number | null;
  commentCount: number;
};

export type VetListingStatus = "pending" | "approved" | "suspended";

export type ManagedVet = PublicVet & {
  accountEmail: string;
  listingStatus: VetListingStatus;
};

export type VetCommentItem = {
  id: string;
  vetId: string;
  authorName: string;
  text: string;
  status: VetCommentStatus;
  createdAt: string;
};

export type ReservationItem = {
  id: string;
  vetId: string;
  vetName: string;
  customerName: string;
  customerPhone: string;
  petName: string;
  date: string;
  time: string;
  note: string;
  status: ReservationStatus;
  createdAt: string;
};

const COMMENT_LABELS: Record<VetCommentStatus, string> = {
  pending: "در انتظار تأیید",
  approved: "منتشر شده",
  rejected: "رد شده",
};

const RESERVATION_LABELS: Record<ReservationStatus, string> = {
  pending: "در انتظار تأیید",
  confirmed: "تأیید شده",
  done: "انجام شده",
  cancelled: "لغو شده",
};

export function commentStatusLabel(status?: string) {
  if (status === "approved" || status === "rejected" || status === "pending") return COMMENT_LABELS[status];
  return COMMENT_LABELS.pending;
}

export function reservationStatusLabel(status?: string) {
  if (status === "confirmed" || status === "done" || status === "cancelled" || status === "pending") {
    return RESERVATION_LABELS[status];
  }
  return RESERVATION_LABELS.pending;
}

export function isVetImage(url: string) {
  if (url.startsWith("/uploads/vets/") && !url.includes("..")) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && (parsed.hostname === "res.cloudinary.com" || parsed.hostname.endsWith(".cloudinary.com"));
  } catch {
    return false;
  }
}

function asNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function asIso(value: unknown) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

export function serializeVet(doc: any, commentCount = 0, includeAccount = false): PublicVet | ManagedVet {
  const obj = typeof doc?.toObject === "function" ? doc.toObject() : doc;
  const lat = asNumber(obj.lat);
  const lng = asNumber(obj.lng);
  const images = Array.isArray(obj.images) ? obj.images.map((item: unknown) => String(item || "").trim()).filter(Boolean) : [];
  const publicVet: PublicVet = {
    id: String(obj._id ?? obj.id),
    name: String(obj.name || "").trim(),
    specialty: String(obj.specialty || "").trim(),
    bio: String(obj.bio || "").trim(),
    province: String(obj.province || "").trim(),
    city: String(obj.city || "").trim(),
    address: String(obj.address || "").trim(),
    phone: String(obj.phone || "").trim(),
    images,
    lat,
    lng,
    commentCount,
  };
  if (!includeAccount) return publicVet;
  const listingStatus: VetListingStatus =
    obj.status === "pending" || obj.status === "suspended" ? obj.status : "approved";
  return { ...publicVet, accountEmail: String(obj.accountEmail || "").trim(), listingStatus };
}

export function isListedVet(doc: unknown) {
  const status = doc && typeof doc === "object" && "status" in doc ? (doc as { status?: unknown }).status : undefined;
  return status !== "pending" && status !== "suspended";
}

export function listingStatusLabel(status?: string) {
  if (status === "pending") return "در انتظار تأیید مدیر";
  if (status === "suspended") return "معلق";
  return "منتشر شده";
}

export function serializeVetComment(doc: any): VetCommentItem {
  const obj = typeof doc?.toObject === "function" ? doc.toObject() : doc;
  const status = obj.status === "approved" || obj.status === "rejected" ? obj.status : "pending";
  return {
    id: String(obj._id ?? obj.id),
    vetId: String(obj.vetId?._id ?? obj.vetId ?? ""),
    authorName: String(obj.authorName || "").trim() || "کاربر Pet24",
    text: String(obj.text || "").trim(),
    status,
    createdAt: asIso(obj.createdAt),
  };
}

export function serializeReservation(doc: any): ReservationItem {
  const obj = typeof doc?.toObject === "function" ? doc.toObject() : doc;
  const vet = obj.vetId && typeof obj.vetId === "object" ? obj.vetId : null;
  const status = obj.status === "confirmed" || obj.status === "done" || obj.status === "cancelled" ? obj.status : "pending";
  return {
    id: String(obj._id ?? obj.id),
    vetId: String(vet?._id ?? obj.vetId ?? ""),
    vetName: String(vet?.name || obj.vetName || "").trim(),
    customerName: String(obj.customerName || "").trim(),
    customerPhone: String(obj.customerPhone || "").trim(),
    petName: String(obj.petName || "").trim(),
    date: String(obj.date || ""),
    time: String(obj.time || ""),
    note: String(obj.note || "").trim(),
    status,
    createdAt: asIso(obj.createdAt),
  };
}

function validCoord(lat: number | null, lng: number | null) {
  return lat != null && lng != null && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function vetFromBody(body: Record<string, unknown>) {
  const name = String(body.name || "").trim();
  const specialty = String(body.specialty || "").trim();
  const bio = String(body.bio || "").trim();
  const province = String(body.province || "").trim();
  const city = String(body.city || "").trim();
  const address = String(body.address || "").trim();
  const phone = String(body.phone || "").trim();
  const accountEmail = String(body.accountEmail || "").trim().toLowerCase();
  const lat = asNumber(body.lat);
  const lng = asNumber(body.lng);
  const images = Array.isArray(body.images) ? body.images.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 6) : [];
  const fail = (error: string) => ({ error, value: null });

  if (name.length < 2 || name.length > 80) return fail("نام دامپزشک یا کلینیک را وارد کنید.");
  if (specialty.length > 80) return fail("تخصص خیلی طولانی است.");
  if (bio.length > 1000) return fail("معرفی باید کوتاه‌تر از ۱۰۰۰ حرف باشد.");
  if (!isIranProvince(province) || !isIranCity(province, city)) return fail("استان و شهر را انتخاب کنید.");
  if (address.length < 5 || address.length > 300) return fail("آدرس را کامل وارد کنید.");
  if (!/^0\d{10}$/.test(phone)) return fail("شماره تماس معتبر نیست.");
  if (accountEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountEmail)) return fail("ایمیل حساب دامپزشک معتبر نیست.");
  if (!images.length || images.some((url) => !isVetImage(url))) return fail("حداقل یک تصویر کلینیک بارگذاری کنید.");
  if (!validCoord(lat, lng)) return fail("مختصات نقشه را وارد کنید.");

  return {
    error: "",
    value: { name, specialty, bio, province, city, address, phone, accountEmail: accountEmail || null, images, lat, lng },
  };
}

export function vetContactFromBody(body: Record<string, unknown>) {
  const province = String(body.province || "").trim();
  const city = String(body.city || "").trim();
  const address = String(body.address || "").trim();
  const phone = String(body.phone || "").trim();
  const lat = asNumber(body.lat);
  const lng = asNumber(body.lng);
  const fail = (error: string) => ({ error, value: null });

  if (!isIranProvince(province) || !isIranCity(province, city)) return fail("استان و شهر را انتخاب کنید.");
  if (address.length < 5 || address.length > 300) return fail("آدرس را کامل وارد کنید.");
  if (!/^0\d{10}$/.test(phone)) return fail("شماره تماس معتبر نیست.");
  if (!validCoord(lat, lng)) return fail("مختصات نقشه را وارد کنید.");
  return { error: "", value: { province, city, address, phone, lat, lng } };
}

export function reservationFromBody(body: Record<string, unknown>) {
  const customerName = String(body.customerName || "").trim();
  const customerPhone = String(body.customerPhone || "").trim();
  const petName = String(body.petName || "").trim();
  const date = String(body.date || "").trim();
  const time = String(body.time || "").trim();
  const note = String(body.note || "").trim();
  const fail = (error: string) => ({ error, value: null });
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tehran" }).format(new Date());

  if (customerName.length < 2) return fail("نام خود را وارد کنید.");
  if (!/^0\d{10}$/.test(customerPhone)) return fail("شماره تماس معتبر نیست.");
  if (petName.length < 2) return fail("نام حیوان را وارد کنید.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < today) return fail("تاریخ نوبت را از امروز به بعد انتخاب کنید.");
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return fail("ساعت نوبت معتبر نیست.");
  if (note.length > 500) return fail("توضیح نوبت خیلی طولانی است.");
  return { error: "", value: { customerName, customerPhone, petName, date, time, note } };
}
