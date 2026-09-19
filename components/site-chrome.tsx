"use client";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// Admin/account panels own their full-page chrome (sidebar nav), so skip the shop header/footer there.
const NO_CHROME_PREFIXES = ["/admin", "/account", "/blog"];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = NO_CHROME_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (bare) return <>{children}</>;

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1280px] flex-1 px-6 py-8 pb-16">{children}</main>
      <SiteFooter />
    </div>
  );
}
