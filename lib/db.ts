import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;
const CONNECT_TIMEOUT_MS = 8000;

let cached = (global as any)._mongoose;
if (!cached) cached = (global as any)._mongoose = { conn: null, promise: null };

mongoose.set("bufferCommands", false);

export async function resetMongoCache() {
  cached.conn = null;
  cached.promise = null;
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect().catch(() => {});
  }
}

export function isMongoUnavailable(error: unknown) {
  const name = String((error as { name?: string })?.name || "");
  const message = String((error as { message?: string })?.message || error);
  return /whitelist|ServerSelection|TLS|ECONNRESET|ENOTFOUND|ETIMEDOUT|ECONNREFUSED|MongoNetwork|MongoPoolCleared|not ready/i.test(`${name} ${message}`);
}

export function isTransientMongoError(error: unknown) {
  const name = String((error as { name?: string })?.name || "");
  const message = String((error as { message?: string })?.message || error);
  return /ECONNRESET|ENOTFOUND|ETIMEDOUT|ECONNREFUSED|buffering timed out|TLS|MongoNetwork|MongoServerSelection|MongoPoolCleared|ExpiredSession|session that has ended|not ready|whitelist/i.test(`${name} ${message}`);
}

export async function withMongoRetry<T>(fn: () => Promise<T>, attempts = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      await dbConnect();
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isTransientMongoError(error) || attempt === attempts) throw error;
      await resetMongoCache();
      await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
    }
  }
  throw lastError;
}

export async function dbConnect() {
  if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI env var — set it in .env.local (see .env.example) and restart the dev server.");
  }
  if (cached.conn && mongoose.connection.readyState === 1) return cached.conn;

  if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
    cached.conn = null;
    cached.promise = null;
  }

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
          serverSelectionTimeoutMS: CONNECT_TIMEOUT_MS,
          connectTimeoutMS: CONNECT_TIMEOUT_MS,
          socketTimeoutMS: 20000,
          maxPoolSize: 8,
          family: 4,
        });
      }
      cached.conn = await cached.promise;
      if (mongoose.connection.readyState !== 1) {
        throw new Error("MongoDB connection is not ready.");
      }
      return cached.conn;
    } catch (error) {
      cached.conn = null;
      cached.promise = null;
      if (attempt === 2) throw error;
      await mongoose.disconnect().catch(() => {});
      await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
    }
  }
}
