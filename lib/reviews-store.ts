"use client";
import * as React from "react";

export type Review = { id: string; productId: string | number; author: string; rating: number; text: string; date: string };

function idSeed(productId: string | number) {
  const text = String(productId);
  let seed = 0;
  for (let i = 0; i < text.length; i++) seed += text.charCodeAt(i) * (i + 1);
  return seed;
}

const STORAGE_KEY = "pet24_reviews";

function readAll(): Review[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}
function writeAll(reviews: Review[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

// deterministic baseline so every product shows a sensible rating before real reviews exist
export function baseRating(productId: string | number) {
  const seed = (idSeed(productId) * 37) % 13;
  return Math.round((3.8 + (seed / 13) * 1.2) * 10) / 10;
}
export function baseCount(productId: string | number) {
  return 12 + (idSeed(productId) % 40);
}

export function useReviews(productId: string | number) {
  const [reviews, setReviews] = React.useState<Review[]>([]);

  React.useEffect(() => {
    setReviews(readAll().filter((r) => r.productId === productId));
  }, [productId]);

  const addReview = (author: string, rating: number, text: string) => {
    const all = readAll();
    const newReview: Review = {
      id: crypto.randomUUID(),
      productId,
      author,
      rating,
      text,
      date: new Date().toLocaleDateString("fa-IR"),
    };
    const updated = [newReview, ...all];
    writeAll(updated);
    setReviews(updated.filter((r) => r.productId === productId));
  };

  const base = baseRating(productId);
  const baseN = baseCount(productId);
  const userSum = reviews.reduce((s, r) => s + r.rating, 0);
  const rating = Math.round(((base * baseN + userSum) / (baseN + reviews.length)) * 10) / 10;
  const count = baseN + reviews.length;

  return { reviews, addReview, rating, count };
}
