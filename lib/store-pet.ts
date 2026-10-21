import { isIranCity, isIranProvince } from "@/lib/iran-locations";

export const PET_SPECIES = [
  { id: "dog", label: "سگ" },
  { id: "cat", label: "گربه" },
  { id: "rabbit", label: "خرگوش" },
  { id: "bird", label: "پرنده" },
  { id: "fish", label: "ماهی" },
  { id: "rodent", label: "جونده" },
  { id: "other", label: "سایر" },
] as const;

export const PET_GENDERS = [
  { id: "male", label: "نر" },
  { id: "female", label: "ماده" },
  { id: "unknown", label: "نامشخص" },
] as const;

export type PetSpecies = (typeof PET_SPECIES)[number]["id"];
export type PetGender = (typeof PET_GENDERS)[number]["id"];

export type StorePet = {
  id: string;
  name: string;
  photo: string;
  species: PetSpecies;
  breed: string;
  province: string;
  city: string;
  birthday: string;
  weightKg: number | null;
  gender: PetGender;
  allergies: string;
  dietaryRestrictions: string;
  specialNeeds: string;
  microchipNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
};

export type PublicPet = Pick<
  StorePet,
  "id" | "name" | "photo" | "species" | "breed" | "province" | "city" | "birthday" | "weightKg" | "gender"
>;

const SPECIES_IDS = new Set<string>(PET_SPECIES.map((item) => item.id));
const GENDER_IDS = new Set<string>(PET_GENDERS.map((item) => item.id));

export function speciesLabel(id?: string) {
  return PET_SPECIES.find((item) => item.id === id)?.label || "سایر";
}

export function genderLabel(id?: string) {
  return PET_GENDERS.find((item) => item.id === id)?.label || "نامشخص";
}

export function isPetSpecies(value: unknown): value is PetSpecies {
  return SPECIES_IDS.has(String(value || ""));
}

function asSpecies(value: unknown): PetSpecies {
  return isPetSpecies(value) ? value : "other";
}

function asGender(value: unknown): PetGender {
  const id = String(value || "");
  return GENDER_IDS.has(id) ? (id as PetGender) : "unknown";
}

function asDateInput(value: unknown) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function serializePet(doc: any): StorePet {
  const obj = typeof doc?.toObject === "function" ? doc.toObject() : doc;
  const weight = obj.weightKg != null ? Number(obj.weightKg) : NaN;
  return {
    id: String(obj._id ?? obj.id),
    name: String(obj.name ?? "").trim(),
    photo: String(obj.photo || ""),
    species: asSpecies(obj.species),
    breed: String(obj.breed || "").trim(),
    province: String(obj.province || "").trim(),
    city: String(obj.city || "").trim(),
    birthday: asDateInput(obj.birthday),
    weightKg: Number.isFinite(weight) && weight > 0 ? weight : null,
    gender: asGender(obj.gender),
    allergies: String(obj.allergies || "").trim(),
    dietaryRestrictions: String(obj.dietaryRestrictions || "").trim(),
    specialNeeds: String(obj.specialNeeds || "").trim(),
    microchipNumber: String(obj.microchipNumber || "").trim(),
    emergencyContactName: String(obj.emergencyContactName || "").trim(),
    emergencyContactPhone: String(obj.emergencyContactPhone || "").trim(),
  };
}

export function serializePublicPet(doc: any): PublicPet {
  const pet = serializePet(doc);
  return {
    id: pet.id,
    name: pet.name,
    photo: pet.photo,
    species: pet.species,
    breed: pet.breed,
    province: pet.province,
    city: pet.city,
    birthday: pet.birthday,
    weightKg: pet.weightKg,
    gender: pet.gender,
  };
}

export function petUpdateFromBody(body: Record<string, unknown>) {
  const update: Record<string, unknown> = {};
  if (typeof body.name === "string") update.name = body.name.trim();
  if (typeof body.photo === "string") update.photo = body.photo.trim();
  if (typeof body.species === "string") update.species = asSpecies(body.species);
  if (typeof body.breed === "string") update.breed = body.breed.trim();
  if (typeof body.province === "string") {
    const name = body.province.trim();
    update.province = isIranProvince(name) ? name : "";
  }
  if (typeof body.city === "string") {
    const city = body.city.trim();
    const province =
      typeof update.province === "string"
        ? update.province
        : typeof body.province === "string"
          ? body.province.trim()
          : "";
    update.city = isIranCity(province, city) ? city : "";
  }
  if (typeof body.birthday === "string") {
    const raw = body.birthday.trim();
    update.birthday = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? new Date(`${raw}T12:00:00.000Z`) : null;
  }
  if (body.weightKg === null || body.weightKg === "") {
    update.weightKg = null;
  } else if (body.weightKg != null) {
    const weight = Number(body.weightKg);
    update.weightKg = Number.isFinite(weight) && weight > 0 ? weight : null;
  }
  if (typeof body.gender === "string") update.gender = asGender(body.gender);
  if (typeof body.allergies === "string") update.allergies = body.allergies.trim();
  if (typeof body.dietaryRestrictions === "string") update.dietaryRestrictions = body.dietaryRestrictions.trim();
  if (typeof body.specialNeeds === "string") update.specialNeeds = body.specialNeeds.trim();
  if (typeof body.microchipNumber === "string") update.microchipNumber = body.microchipNumber.trim();
  if (typeof body.emergencyContactName === "string") update.emergencyContactName = body.emergencyContactName.trim();
  if (typeof body.emergencyContactPhone === "string") update.emergencyContactPhone = body.emergencyContactPhone.trim();
  return update;
}
