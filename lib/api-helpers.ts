import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) return { session: null, error: NextResponse.json({ error: "احراز هویت لازم است." }, { status: 401 }) };
  return { session, error: null };
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session?.user) return { session: null, error: NextResponse.json({ error: "احراز هویت لازم است." }, { status: 401 }) };
  if (session.user.role !== "admin") return { session: null, error: NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 403 }) };
  return { session, error: null };
}
