import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Lazy: only actually connects when awaited, and only if MONGODB_URI is set.
// (Building this eagerly at import time — even if unused — created an unhandled
// promise rejection whenever MONGODB_URI was missing, which could crash the dev server.)
function getClientPromise(): Promise<MongoClient> {
  if (!uri) {
    return Promise.reject(
      new Error("Missing MONGODB_URI env var — set it in .env.local (see .env.example) and restart the dev server.")
    );
  }
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) global._mongoClientPromise = new MongoClient(uri).connect();
    return global._mongoClientPromise;
  }
  return new MongoClient(uri).connect();
}

const clientPromise = uri ? getClientPromise() : getClientPromise().catch((e) => { throw e; });
// Prevent Node's unhandledRejection crash when this module is imported but the
// promise is never awaited (e.g. adapter disabled because MONGODB_URI is unset).
clientPromise.catch(() => {});

export default clientPromise;


