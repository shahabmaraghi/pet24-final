import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { isMongoUnavailable, withMongoRetry } from "@/lib/db";
import User from "@/lib/models/User";

const schema = z.object({
  name: z.string().trim().min(2, "نام باید حداقل ۲ حرف باشد"),
  email: z.string().trim().email("ایمیل معتبر نیست"),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^09\d{9}$/.test(value), "شماره موبایل معتبر نیست"),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
});

const ADMIN_EMAIL = (process.env.SEED_ADMIN_EMAIL || "admin@pet24.ir").trim().toLowerCase();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "اطلاعات ثبت‌نام معتبر نیست." }, { status: 400 });
    }

    const name = parsed.data.name;
    const email = parsed.data.email.toLowerCase();
    const phone = parsed.data.phone || undefined;
    if (email === ADMIN_EMAIL) {
      return NextResponse.json({ error: "امکان ثبت‌نام با این ایمیل وجود ندارد." }, { status: 409 });
    }

    const result = await withMongoRetry(async () => {
      const existing = await User.findOne({ email });
      if (existing) return { conflict: true as const };
      const hashed = await bcrypt.hash(parsed.data.password, 10);
      const user = await User.create({ name, email, phone, password: hashed, role: "user" });
      return { conflict: false as const, user };
    });

    if (result.conflict) {
      return NextResponse.json({ error: "این ایمیل قبلا ثبت شده است." }, { status: 409 });
    }
    return NextResponse.json({ id: result.user._id, name: result.user.name, email: result.user.email }, { status: 201 });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "این ایمیل قبلا ثبت شده است." }, { status: 409 });
    }
    console.error("POST /api/auth/register failed", error);
    if (isMongoUnavailable(error)) {
      return NextResponse.json(
        { error: "اتصال به پایگاه داده برقرار نشد. IP این سیستم را در MongoDB Atlas → Network Access اضافه کنید." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "ثبت‌نام انجام نشد. دوباره تلاش کنید." }, { status: 500 });
  }
}
