import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RehomingDetail } from "@/components/rehoming-board";
import { getApprovedRehoming } from "@/lib/get-public-rehoming";
import { rehomingSpeciesLabel } from "@/lib/store-rehoming";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const item = await getApprovedRehoming(id).catch(() => null);
  if (!item) return { title: "آگهی پیدا نشد", robots: { index: false, follow: true } };
  const description = `آگهی واگذاری ${item.petName}، ${rehomingSpeciesLabel(item.species)}.`;
  return {
    title: `واگذاری ${item.petName}`,
    description,
    alternates: { canonical: `/rehoming/${item.id}` },
    openGraph: {
      title: item.petName,
      description,
      images: item.image ? [{ url: item.image }] : undefined,
    },
  };
}

export default async function RehomingProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getApprovedRehoming(id).catch(() => null);
  if (!item) notFound();
  return <RehomingDetail item={item} />;
}
