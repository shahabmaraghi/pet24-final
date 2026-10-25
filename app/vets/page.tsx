import type { Metadata } from "next";
import { VetDirectory } from "@/components/vet-directory";
import { getPublicVets } from "@/lib/get-public-vets";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "دامپزشکان",
  description: "فهرست دامپزشکان و کلینیک‌های حیوانات خانگی به تفکیک شهر، با امکان رزرو نوبت.",
  alternates: { canonical: "/vets" },
};

export default async function VetsPage() {
  let vets: Awaited<ReturnType<typeof getPublicVets>> = [];
  try {
    vets = await getPublicVets();
  } catch {
    vets = [];
  }
  return <VetDirectory vets={vets} />;
}
