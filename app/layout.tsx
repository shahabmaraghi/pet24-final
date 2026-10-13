import type { Metadata } from "next";
import { CartProvider } from "@/lib/cart-store";
import { SiteChrome } from "@/components/site-chrome";
import { AuthProvider } from "@/components/auth-provider";
import { siteUrl } from "@/lib/site";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "pet24 - پلتفرم جامع pet",
    template: "%s | pet24",
  },
  description: "فروشگاه آنلاین لوازم و غذای حیوانات خانگی",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "Pet24",
    title: "pet24 - پلتفرم جامع pet",
    description: "فروشگاه آنلاین لوازم و غذای حیوانات خانگی",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: ["/favicon.svg"],
    apple: [{ url: "/apple-icon", type: "image/png" }],
  },
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
