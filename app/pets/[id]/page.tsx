import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PetPassport } from "@/components/pet-profiles";
import { getPublicPet, getPublicPets } from "@/lib/get-public-pets";
import { speciesLabel } from "@/lib/store-pet";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const pet = await getPublicPet(id).catch(() => null);
  if (!pet) return { title: "پروفایل پیدا نشد", robots: { index: false, follow: true } };
  const description = `شناسنامه ${pet.name}، ${speciesLabel(pet.species)}${pet.breed ? `، نژاد ${pet.breed}` : ""}.`;
  return {
    title: `شناسنامه ${pet.name}`,
    description,
    alternates: { canonical: `/pets/${pet.id}` },
    openGraph: {
      title: pet.name,
      description,
      images: pet.photo ? [{ url: pet.photo }] : undefined,
    },
  };
}

export default async function PetProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pet = await getPublicPet(id).catch(() => null);
  if (!pet) notFound();

  const others = await getPublicPets()
    .then((items) => items.filter((item) => item.id !== pet.id && item.species === pet.species).slice(0, 3))
    .catch(() => []);

  return <PetPassport pet={pet} others={others} />;
}
