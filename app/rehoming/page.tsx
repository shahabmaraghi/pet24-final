import type { Metadata } from "next";
import { RehomingBoard } from "@/components/rehoming-board";
import { getApprovedRehomings } from "@/lib/get-public-rehoming";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "واگذاری",
  description: "آگهی‌های واگذاری حیوانات خانگی که پس از تأیید مدیریت منتشر شده‌اند.",
  alternates: { canonical: "/rehoming" },
};

export default async function RehomingPage() {
  let listings: Awaited<ReturnType<typeof getApprovedRehomings>> = [];
  try {
    listings = await getApprovedRehomings();
  } catch {
    listings = [];
  }
  return <RehomingBoard listings={listings} />;
}
