import { isIranCity, isIranProvince } from "@/lib/iran-locations";
import { isPetSpecies, speciesLabel, type PetSpecies } from "@/lib/store-pet";

export const REHOMING_STATUSES = ["pending", "approved", "rejected"] as const;
export type RehomingStatus = (typeof REHOMING_STATUSES)[number];

export type PublicRehoming = {
  id: string;
  petName: string;
  species: PetSpecies;
  province: string;
  city: string;
  description: string;
  image: string;
  phone: string;
  ownerName: string;
};

export type OwnerRehoming = PublicRehoming & {
  status: RehomingStatus;
  createdAt: string;
};

const STATUS_LABELS: Record<RehomingStatus, string> = {
  pending: "در انتظار تأیید",
  approved: "منتشر شده",
  rejected: "رد شده",
};

export function rehomingStatusLabel(status?: string) {
  if (status === "approved" || status === "rejected" || status === "pending") return STATUS_LABELS[status];
  return STATUS_LABELS.pending;
}

export function isRehomingImage(url: string) {
  if (url.startsWith("/uploads/rehoming/") && !url.includes("..")) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && (parsed.hostname === "res.cloudinary.com" || parsed.hostname.endsWith(".cloudinary.com"));
  } catch {
    return false;
  }
}

function asStatus(value: unknown): RehomingStatus {
  return value === "approved" || value === "rejected" ? value : "pending";
}

function asIso(value: unknown) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

export function serializePublicRehoming(doc: any): PublicRehoming {
  const obj = typeof doc?.toObject === "function" ? doc.toObject() : doc;
  const species = isPetSpecies(obj.species) ? obj.species : "other";
  return {
    id: String(obj._id ?? obj.id),
    petName: String(obj.petName ?? "").trim(),
    species,
    province: String(obj.province || "").trim(),
    city: String(obj.city || "").trim(),
    description: String(obj.description || "").trim(),
    image: String(obj.image || "").trim(),
    phone: String(obj.phone || "").trim(),
    ownerName: String(obj.ownerName || "").trim() || "کاربر Pet24",
  };
}

export function serializeOwnerRehoming(doc: any): OwnerRehoming {
  const obj = typeof doc?.toObject === "function" ? doc.toObject() : doc;
  return {
    ...serializePublicRehoming(obj),
    status: asStatus(obj.status),
    createdAt: asIso(obj.createdAt),
  };
}

export function rehomingFromBody(body: Record<string, unknown>) {
  const petName = String(body.petName || "").trim();
  const description = String(body.description || "").trim();
  const image = String(body.image || "").trim();
  const phone = String(body.phone || "").trim();
  const province = String(body.province || "").trim();
  const city = String(body.city || "").trim();
  const species = isPetSpecies(body.species) ? body.species : null;
  const fail = (error: string) => ({ error, value: null });

  if (petName.length < 2 || petName.length > 40) return fail("نام حیوان را وارد کنید.");
  if (!species) return fail("گونه حیوان را انتخاب کنید.");
  if (!isIranProvince(province) || !isIranCity(province, city)) return fail("استان و شهر را انتخاب کنید.");
  if (description.length < 15 || description.length > 2000) return fail("توضیح آگهی باید بین ۱۵ تا ۲۰۰۰ حرف باشد.");
  if (!isRehomingImage(image)) return fail("تصویر آگهی را بارگذاری کنید.");
  if (!/^0\d{10}$/.test(phone)) return fail("شماره تماس معتبر نیست.");

  return {
    error: "",
    value: {
      petName,
      species,
      province,
      city,
      description,
      image,
      phone,
    },
  };
}

export function rehomingSpeciesLabel(id?: string) {
  return speciesLabel(id);
}
