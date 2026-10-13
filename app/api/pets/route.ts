import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import { accountOwnerKey } from "@/lib/account-owner";
import { dbConnect } from "@/lib/db";
import Pet from "@/lib/models/Pet";
import { isPetSpecies, petUpdateFromBody, serializePet } from "@/lib/store-pet";

const MAX_PETS = 20;

export async function GET() {
  const { session, error } = await requireAuth();
  if (error || !session) return error;
  const ownerKey = accountOwnerKey(session);
  if (!ownerKey) return NextResponse.json({ error: "حساب نامعتبر است." }, { status: 400 });

  try {
    await dbConnect();
    const pets = await Pet.find({ ownerKey }).sort({ createdAt: -1 });
    return NextResponse.json({ items: pets.map(serializePet) });
  } catch (err) {
    console.error("GET /api/pets failed", err);
    return NextResponse.json({ error: "بارگذاری پروفایل حیوانات انجام نشد." }, { status: 503 });
  }
}

export async function POST(req: Request) {
  const { session, error } = await requireAuth();
  if (error || !session) return error;
  const ownerKey = accountOwnerKey(session);
  if (!ownerKey) return NextResponse.json({ error: "حساب نامعتبر است." }, { status: 400 });

  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body.name || "").trim();
    if (name.length < 2) return NextResponse.json({ error: "نام حیوان را وارد کنید." }, { status: 400 });
    if (!isPetSpecies(body.species)) return NextResponse.json({ error: "گونه حیوان را انتخاب کنید." }, { status: 400 });

    await dbConnect();
    const count = await Pet.countDocuments({ ownerKey });
    if (count >= MAX_PETS) {
      return NextResponse.json({ error: "حداکثر ۲۰ پروفایل حیوان خانگی می‌توانید ثبت کنید." }, { status: 400 });
    }

    const pet = await Pet.create({
      ownerKey,
      ...petUpdateFromBody(body),
      name,
    });
    return NextResponse.json(serializePet(pet), { status: 201 });
  } catch (err) {
    console.error("POST /api/pets failed", err);
    return NextResponse.json({ error: "ثبت پروفایل انجام نشد." }, { status: 500 });
  }
}
