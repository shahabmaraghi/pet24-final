import type { Metadata } from "next";
import { CartProvider } from "@/lib/cart-store";
import { SiteChrome } from "@/components/site-chrome";
import { AuthProvider } from "@/components/auth-provider";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pet24 — فروشگاه حیوانات خانگی",
  description: "فروشگاه آنلاین لوازم و غذای حیوانات خانگی",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
        <CartProvider>
          <AuthProvider>
            <SiteChrome>{children}</SiteChrome>
          </AuthProvider>
        </CartProvider>
      </body>
    </html>
  );
}
