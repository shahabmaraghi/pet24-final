import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { requireAdmin } from "@/lib/api-helpers";
import { uploadBuffer } from "@/lib/cloudinary";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const formData = await req.formData();
    const file = formData.get("file") ?? formData.get("upload");
    if (!file || typeof file === "string" || !("arrayBuffer" in file) || file.size === 0) {
      return NextResponse.json({ error: "فایلی ارسال نشده است." }, { status: 400 });
    }
    const mime = "type" in file ? String(file.type) : "";
    if (!ALLOWED.has(mime)) {
      return NextResponse.json({ error: "فقط تصویر JPG، PNG، WEBP یا GIF مجاز است." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "حجم تصویر باید کمتر از ۵ مگابایت باشد." }, { status: 400 });
    }

    const folder = String(formData.get("folder") || "products").replace(/[^a-z0-9_-]/gi, "") || "products";
    const buffer = Buffer.from(await file.arrayBuffer());
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      const result = await uploadBuffer(buffer, `pet24/${folder}`);
      return NextResponse.json({ url: result.secure_url, id: result.public_id, urls: { default: result.secure_url } });
    }

    const ext = mime === "image/png" ? ".png" : mime === "image/webp" ? ".webp" : mime === "image/gif" ? ".gif" : ".jpg";
    const filename = `${randomUUID()}${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buffer);
    const url = `/uploads/${folder}/${filename}`;
    return NextResponse.json({ url, urls: { default: url } });
  } catch {
    return NextResponse.json({ error: "بارگذاری تصویر انجام نشد." }, { status: 500 });
  }
}
