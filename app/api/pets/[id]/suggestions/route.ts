import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireAuth } from "@/lib/api-helpers";
import { accountOwnerKey } from "@/lib/account-owner";
import { dbConnect } from "@/lib/db";
import Pet from "@/lib/models/Pet";
import Product from "@/lib/models/Product";
import Breed from "@/lib/models/Breed";
import { serializePet } from "@/lib/store-pet";
import { serializeProduct } from "@/lib/store-product";
import { serializeBreed } from "@/lib/store-breed";
import { ensureBreeds } from "@/lib/ensure-breeds";
import { buildSuggestionPlan, suggestionCategories, suggestionSearchTerms } from "@/lib/pet-suggestions";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { session, error } = await requireAuth();
  if (error || !session) return error;
  const ownerKey = accountOwnerKey(session);
  if (!ownerKey) return NextResponse.json({ error: "حساب نامعتبر است." }, { status: 400 });
  if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "پروفایل حیوان یافت نشد." }, { status: 404 });

  try {
    await dbConnect();
    const petDoc = await Pet.findOne({ _id: id, ownerKey });
    if (!petDoc) return NextResponse.json({ error: "پروفایل حیوان یافت نشد." }, { status: 404 });
    const pet = serializePet(petDoc);
    await ensureBreeds();
    const catalog = (await Breed.find({ species: pet.species, active: { $ne: false } })).map(serializeBreed);
    const terms = suggestionSearchTerms(pet, catalog);
    const nameMatches = terms.map((term) => ({
      name: { $regex: term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" },
    }));
    const products = await Product.find({
      type: { $not: /حیوان زنده/i },
      $or: [{ categoryId: { $in: suggestionCategories(pet.species) } }, ...nameMatches],
    })
      .sort({ featured: -1, createdAt: -1 })
      .limit(120)
      .maxTimeMS(8000);
    return NextResponse.json(buildSuggestionPlan(pet, products.map(serializeProduct), catalog));
  } catch (err) {
    console.error("GET /api/pets/[id]/suggestions failed", err);
    return NextResponse.json({ error: "بارگذاری پیشنهادها انجام نشد." }, { status: 503 });
  }
}
