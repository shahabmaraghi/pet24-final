import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/lib/models/User";
import { requireAdmin } from "@/lib/api-helpers";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  await dbConnect();
  const items = await User.find().select("-password").sort({ createdAt: -1 });
  return NextResponse.json(items);
}
