import type { Metadata } from "next";
import { PetGallery } from "@/components/pet-profiles";
import { getPublicPets } from "@/lib/get-public-pets";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "شناسنامه حیوانات",
  description: "گالری پروفایل عمومی حیوانات خانگی کاربران Pet24.",
  alternates: { canonical: "/pets" },
};

export default async function PetsPage() {
  let pets: Awaited<ReturnType<typeof getPublicPets>> = [];
  let loadError = false;
  try {
    pets = await getPublicPets();
  } catch {
    loadError = true;
  }
  return <PetGallery pets={pets} loadError={loadError} />;
}
