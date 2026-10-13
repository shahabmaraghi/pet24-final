import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-helpers";
import { dbConnect } from "@/lib/db";
import Breed from "@/lib/models/Breed";
import { PET_SPECIES } from "@/lib/store-pet";
import { asBreedSize, breedKeywords, serializeBreed } from "@/lib/store-breed";
import { ensureBreeds } from "@/lib/ensure-breeds";

const SPECIES = new Set(PET_SPECIES.map((item) => item.id));

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const species = searchParams.get("species") || "";
  const includeInactive = searchParams.get("all") === "true";
  try {
    await dbConnect();
    await ensureBreeds();
    const filter: Record<string, unknown> = {};
    if (species && SPECIES.has(species as (typeof PET_SPECIES)[number]["id"])) filter.species = species;
    if (!includeInactive) filter.active = { $ne: false };
    const items = await Breed.find(filter).sort({ species: 1, title: 1 });
    return NextResponse.json(items.map(serializeBreed));
  } catch (err) {
    console.error("GET /api/breeds failed", err);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    const body = await req.json().catch(() => ({}));
    const title = String(body.title || "").trim();
    const species = String(body.species || "");
    if (title.length < 2) return NextResponse.json({ error: "نام نژاد را وارد کنید." }, { status: 400 });
    if (!SPECIES.has(species as (typeof PET_SPECIES)[number]["id"])) {
      return NextResponse.json({ error: "گونه را انتخاب کنید." }, { status: 400 });
    }
    const size = asBreedSize(body.size);
    const keywords = breedKeywords(species as (typeof PET_SPECIES)[number]["id"], size);
    await dbConnect();
    const duplicate = await Breed.findOne({ species, title });
    if (duplicate) return NextResponse.json({ error: "این نژاد از قبل ثبت شده است." }, { status: 409 });
    const aliases = Array.isArray(body.aliases)
      ? body.aliases.map(String).filter(Boolean)
      : String(body.aliases || "")
          .split(/[,،]/)
          .map((part) => part.trim())
          .filter(Boolean);
    const breed = await Breed.create({
      species,
      title,
      nameEn: String(body.nameEn || "").trim(),
      aliases,
      size,
      ...keywords,
      active: body.active !== false,
    });
    return NextResponse.json(serializeBreed(breed), { status: 201 });
  } catch (err) {
    console.error("POST /api/breeds failed", err);
    return NextResponse.json({ error: "ثبت نژاد انجام نشد." }, { status: 500 });
  }
}
