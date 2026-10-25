"use client";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// Admin/account panels own their full-page chrome (sidebar nav), so skip the shop header/footer there.
const NO_CHROME_PREFIXES = ["/admin", "/account", "/blog", "/login", "/register", "/vet"];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = NO_CHROME_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (bare) return <>{children}</>;

  const fullBleed =
    pathname === "/" ||
    pathname === "/pets" ||
    pathname.startsWith("/pets/") ||
    pathname === "/rehoming" ||
    pathname.startsWith("/rehoming/") ||
    pathname === "/vets" ||
    pathname.startsWith("/vets/");

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className={fullBleed ? "w-full grow pb-16" : "mx-auto w-full max-w-[1280px] grow px-6 py-8 pb-16"}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
