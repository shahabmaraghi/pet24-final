import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import { serializeVet, vetFromBody } from "@/lib/store-vet";
import { findVetForSession } from "@/lib/vet-access";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error || !session) return error;
  try {
    const vet = await findVetForSession(session);
    if (!vet) return NextResponse.json({ error: "پنل دامپزشک برای این حساب فعال نیست." }, { status: 404 });
    return NextResponse.json(serializeVet(vet, 0, true));
  } catch (err) {
    console.error("GET /api/vet/me failed", err);
    return NextResponse.json({ error: "بارگذاری حساب دامپزشک انجام نشد." }, { status: 503 });
  }
}

export async function PATCH(req: Request) {
  const { session, error } = await requireAuth();
  if (error || !session) return error;
  try {
    const vet = await findVetForSession(session);
    if (!vet) return NextResponse.json({ error: "پنل دامپزشک برای این حساب فعال نیست." }, { status: 404 });
    const body = await req.json().catch(() => ({}));
    const parsed = vetFromBody({ ...body, accountEmail: vet.accountEmail || "" });
    if (!parsed.value) return NextResponse.json({ error: parsed.error }, { status: 400 });
    Object.assign(vet, parsed.value);
    await vet.save();
    return NextResponse.json(serializeVet(vet, 0, true));
  } catch (err) {
    console.error("PATCH /api/vet/me failed", err);
    return NextResponse.json({ error: "به‌روزرسانی اطلاعات تماس انجام نشد." }, { status: 500 });
  }
}
