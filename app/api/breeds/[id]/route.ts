import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireAdmin } from "@/lib/api-helpers";
import { dbConnect } from "@/lib/db";
import Breed from "@/lib/models/Breed";
import { PET_SPECIES } from "@/lib/store-pet";
import { asBreedSize, breedKeywords, serializeBreed } from "@/lib/store-breed";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await requireAdmin();
  if (error) return error;
  if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "نژاد یافت نشد." }, { status: 404 });
  try {
    const body = await req.json().catch(() => ({}));
    await dbConnect();
    const breed = await Breed.findById(id);
    if (!breed) return NextResponse.json({ error: "نژاد یافت نشد." }, { status: 404 });
    if (typeof body.title === "string" && body.title.trim().length >= 2) breed.title = body.title.trim();
    if (typeof body.nameEn === "string") breed.nameEn = body.nameEn.trim();
    if (typeof body.species === "string" && PET_SPECIES.some((item) => item.id === body.species)) breed.species = body.species;
    if (typeof body.size === "string") breed.size = asBreedSize(body.size);
    if (typeof body.active === "boolean") breed.active = body.active;
    if (body.aliases != null) {
      breed.aliases = Array.isArray(body.aliases)
        ? body.aliases.map(String).filter(Boolean)
        : String(body.aliases)
            .split(/[,،]/)
            .map((part) => part.trim())
            .filter(Boolean);
    }
    const keywords = breedKeywords(breed.species, asBreedSize(breed.size));
    breed.foodKeywords = keywords.foodKeywords;
    breed.accessoryKeywords = keywords.accessoryKeywords;
    breed.avoidKeywords = keywords.avoidKeywords;
    await breed.save();
    return NextResponse.json(serializeBreed(breed));
  } catch (err) {
    console.error("PATCH /api/breeds/[id] failed", err);
    return NextResponse.json({ error: "ذخیره نژاد انجام نشد." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await requireAdmin();
  if (error) return error;
  if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "نژاد یافت نشد." }, { status: 404 });
  try {
    await dbConnect();
    const breed = await Breed.findById(id);
    if (!breed) return NextResponse.json({ error: "نژاد یافت نشد." }, { status: 404 });
    await breed.deleteOne();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/breeds/[id] failed", err);
    return NextResponse.json({ error: "حذف نژاد انجام نشد." }, { status: 500 });
  }
}
