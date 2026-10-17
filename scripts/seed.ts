/**
 * One-off seed script: populates MongoDB from the existing static catalog in lib/data.ts.
 * Run with: npm run seed
 */
import path from "path";
import { config as loadEnv } from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Product from "../lib/models/Product";
import Category from "../lib/models/Category";
import BlogPost from "../lib/models/BlogPost";
import Slide from "../lib/models/Slide";
import User from "../lib/models/User";
import Breed from "../lib/models/Breed";
import Faq from "../lib/models/Faq";
import Brand from "../lib/models/Brand";
import { CATEGORIES, PRODUCTS, BLOG_POSTS, SLIDES } from "../lib/data";
import { SEED_BREEDS, seedBreedDoc } from "../lib/breed-catalog";
import { SEED_FAQS } from "../lib/store-faq";
import { SEED_BRANDS } from "../lib/store-brand";

loadEnv({ path: path.join(process.cwd(), ".env") });
loadEnv({ path: path.join(process.cwd(), ".env.local"), override: true });

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI — set it in .env.local and run npm run seed again.");
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 20000,
    socketTimeoutMS: 45000,
  });
  console.log("Connected. Seeding...");

  await Category.deleteMany({});
  await Product.deleteMany({});
  await BlogPost.deleteMany({});
  await Slide.deleteMany({});

  await Category.insertMany(CATEGORIES.map((c, i) => ({ ...c, order: i })));
  await Product.insertMany(PRODUCTS.map(({ id, ...p }) => p));
  await BlogPost.insertMany(BLOG_POSTS.map(({ id, ...p }) => p));
  await Slide.insertMany(SLIDES.map((s, i) => ({ ...s, order: i })));
  await Breed.deleteMany({});
  await Breed.insertMany(SEED_BREEDS.map(seedBreedDoc));
  if ((await Faq.countDocuments()) === 0) {
    await Faq.insertMany(SEED_FAQS);
  }
  if ((await Brand.countDocuments()) === 0) {
    await Brand.insertMany(SEED_BRANDS);
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@pet24.ir";
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!", 10);
    await User.create({ name: "مدیر Pet24", email: adminEmail, password: hashed, role: "admin" });
    console.log(`Admin created: ${adminEmail}`);
  }

  console.log("Seed complete.");
  await mongoose.disconnect();
}

async function main() {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      await seed();
      return;
    } catch (error) {
      lastError = error;
      await mongoose.disconnect().catch(() => {});
      if (attempt < 4) {
        console.log(`Seed failed (attempt ${attempt}/4), retrying...`);
        await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
      }
    }
  }
  throw lastError;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
