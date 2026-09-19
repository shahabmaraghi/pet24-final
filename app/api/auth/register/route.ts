import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import User from "@/lib/models/User";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  await dbConnect();
  const existing = await User.findOne({ email: parsed.data.email });
  if (existing) return NextResponse.json({ error: "این ایمیل قبلا ثبت شده است." }, { status: 409 });

  const hashed = await bcrypt.hash(parsed.data.password, 10);
  const user = await User.create({ name: parsed.data.name, email: parsed.data.email, password: hashed, role: "user" });
  return NextResponse.json({ id: user._id, name: user.name, email: user.email }, { status: 201 });
}
