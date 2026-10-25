import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VetProfile } from "@/components/vet-profile";
import { getPublicVet } from "@/lib/get-public-vets";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const result = await getPublicVet(id).catch(() => null);
  if (!result) return { title: "دامپزشک پیدا نشد", robots: { index: false, follow: true } };
  return {
    title: result.vet.name,
    description: result.vet.bio || `${result.vet.name} در ${result.vet.city}`,
    alternates: { canonical: `/vets/${result.vet.id}` },
    openGraph: {
      title: result.vet.name,
      description: result.vet.bio || result.vet.name,
      images: result.vet.images[0] ? [{ url: result.vet.images[0] }] : undefined,
    },
  };
}

export default async function VetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getPublicVet(id).catch(() => null);
  if (!result) notFound();
  return <VetProfile vet={result.vet} comments={result.comments} />;
}
