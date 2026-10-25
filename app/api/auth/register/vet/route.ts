import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { isMongoUnavailable, withMongoRetry } from "@/lib/db";
import User from "@/lib/models/User";
import Vet from "@/lib/models/Vet";
import { isIranCity, isIranProvince } from "@/lib/iran-locations";

const ADMIN_EMAIL = (process.env.SEED_ADMIN_EMAIL || "admin@pet24.ir").trim().toLowerCase();

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const phone = String(body.phone || "").trim();
    const specialty = String(body.specialty || "").trim();
    const province = String(body.province || "").trim();
    const city = String(body.city || "").trim();
    const address = String(body.address || "").trim();
    const bio = String(body.bio || "").trim();

    if (name.length < 2) return NextResponse.json({ error: "نام کلینیک یا دامپزشک را وارد کنید." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "ایمیل معتبر نیست." }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: "رمز عبور باید حداقل ۶ کاراکتر باشد." }, { status: 400 });
    if (!/^0\d{10}$/.test(phone)) return NextResponse.json({ error: "شماره تماس معتبر نیست." }, { status: 400 });
    if (!isIranProvince(province) || !isIranCity(province, city)) return NextResponse.json({ error: "استان و شهر را انتخاب کنید." }, { status: 400 });
    if (address.length < 5) return NextResponse.json({ error: "آدرس کلینیک را وارد کنید." }, { status: 400 });
    if (email === ADMIN_EMAIL) return NextResponse.json({ error: "امکان ثبت‌نام با این ایمیل وجود ندارد." }, { status: 409 });

    const result = await withMongoRetry(async () => {
      const existingUser = await User.findOne({ email });
      const existingVet = await Vet.findOne({ accountEmail: email });
      if (existingUser || existingVet) return { conflict: true as const };
      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, phone, password: hashed, role: "user" });
      const vet = await Vet.create({
        name,
        specialty,
        bio,
        province,
        city,
        address,
        phone,
        accountEmail: email,
        images: [],
        status: "pending",
      });
      return { conflict: false as const, user, vet };
    });

    if (result.conflict) return NextResponse.json({ error: "این ایمیل قبلاً ثبت شده است." }, { status: 409 });
    return NextResponse.json({ id: String(result.vet._id) }, { status: 201 });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "این ایمیل قبلاً ثبت شده است." }, { status: 409 });
    }
    console.error("POST /api/auth/register/vet failed", error);
    if (isMongoUnavailable(error)) {
      return NextResponse.json({ error: "اتصال به پایگاه داده برقرار نشد." }, { status: 503 });
    }
    return NextResponse.json({ error: "ثبت‌نام دامپزشک انجام نشد." }, { status: 500 });
  }
}
