import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Bengali } from "next/font/google";
import { getT } from "@/i18n/server";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const bengali = Noto_Sans_Bengali({ subsets: ["bengali"], variable: "--font-bengali", display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Animal Rescue Dhaka", template: "%s · Animal Rescue Dhaka" },
  description: "Report an animal in need in Dhaka, get a volunteer rescuer assigned, and track every step of the rescue.",
  openGraph: { title: "Animal Rescue Dhaka", description: "Report and track animal rescues across Dhaka.", type: "website", images: ["/hero.jpg"] },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf8f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1618" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale } = await getT();
  return (
    <html lang={locale} className={`${inter.variable} ${bengali.variable}`}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
