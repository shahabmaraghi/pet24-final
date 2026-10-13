import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireAuth } from "@/lib/api-helpers";
import { accountOwnerKey } from "@/lib/account-owner";
import { dbConnect } from "@/lib/db";
import Pet from "@/lib/models/Pet";
import { petUpdateFromBody, serializePet } from "@/lib/store-pet";

async function findOwnedPet(id: string, ownerKey: string) {
  if (!Types.ObjectId.isValid(id)) return null;
  return Pet.findOne({ _id: id, ownerKey });
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { session, error } = await requireAuth();
  if (error || !session) return error;
  const ownerKey = accountOwnerKey(session);
  if (!ownerKey) return NextResponse.json({ error: "حساب نامعتبر است." }, { status: 400 });

  try {
    await dbConnect();
    const pet = await findOwnedPet(id, ownerKey);
    if (!pet) return NextResponse.json({ error: "پروفایل حیوان یافت نشد." }, { status: 404 });
    return NextResponse.json(serializePet(pet));
  } catch (err) {
    console.error("GET /api/pets/[id] failed", err);
    return NextResponse.json({ error: "بارگذاری پروفایل انجام نشد." }, { status: 503 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { session, error } = await requireAuth();
  if (error || !session) return error;
  const ownerKey = accountOwnerKey(session);
  if (!ownerKey) return NextResponse.json({ error: "حساب نامعتبر است." }, { status: 400 });

  try {
    const body = await req.json().catch(() => ({}));
    const update = petUpdateFromBody(body);
    if (typeof update.name === "string" && String(update.name).trim().length < 2) {
      return NextResponse.json({ error: "نام حیوان را وارد کنید." }, { status: 400 });
    }

    await dbConnect();
    const pet = await findOwnedPet(id, ownerKey);
    if (!pet) return NextResponse.json({ error: "پروفایل حیوان یافت نشد." }, { status: 404 });
    pet.set(update);
    await pet.save();
    return NextResponse.json(serializePet(pet));
  } catch (err) {
    console.error("PATCH /api/pets/[id] failed", err);
    return NextResponse.json({ error: "ذخیره پروفایل انجام نشد." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { session, error } = await requireAuth();
  if (error || !session) return error;
  const ownerKey = accountOwnerKey(session);
  if (!ownerKey) return NextResponse.json({ error: "حساب نامعتبر است." }, { status: 400 });

  try {
    await dbConnect();
    const pet = await findOwnedPet(id, ownerKey);
    if (!pet) return NextResponse.json({ error: "پروفایل حیوان یافت نشد." }, { status: 404 });
    await pet.deleteOne();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/pets/[id] failed", err);
    return NextResponse.json({ error: "حذف پروفایل انجام نشد." }, { status: 500 });
  }
}
