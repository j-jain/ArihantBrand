import type { Metadata } from "next";
import { besley, archivo } from "./fonts";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://arihantgroup.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  // No title template: each page's generateMetadata sets its own complete title.
  title: "Arihant Group — Garment Distribution & Retail, Northeast India",
  description:
    "Northeast India's leading readymade garments distribution and retail house, Guwahati.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${besley.variable} ${archivo.variable}`}>
      <body className="flex min-h-dvh flex-col bg-paper font-sans text-ink antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
