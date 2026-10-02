import type { Metadata, Viewport } from "next";
import { Analytics } from "@/components/Analytics";
import { besley, archivo } from "./fonts";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://arihantgroup.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  // No title template: each page's generateMetadata sets its own complete title.
  title: "Arihant Group: Garment Distribution & Retail in Northeast India",
  description:
    "Northeast India's leading readymade garments distribution and retail house, Guwahati.",
};

/** Mobile browser chrome only — no effect on desktop rendering.
 *  `viewportFit: "cover"` lets the sticky action bar and the menu sheet pad
 *  themselves against `env(safe-area-inset-*)` on notched handsets. Zoom is
 *  deliberately left unrestricted (no maximumScale / userScalable). */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // sRGB of --paper: oklch(0.985 0.002 30)
  themeColor: "#faf9f8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: the intro gate below adds data-intro to <html>
    // before React hydrates, and HeroIntro removes it again.
    <html lang="en" className={`${besley.variable} ${archivo.variable}`} suppressHydrationWarning>
      <head>
        {/* Hero intro gate. Runs while the HTML is parsed, so the hero is held
            hidden before the first paint instead of painting finished and then
            resetting when React hydrates. Motion users only; with no JS it
            never runs, and a CSS failsafe (motion.css) shows the hero anyway
            if HeroIntro never arrives. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(matchMedia("(prefers-reduced-motion: no-preference)").matches)document.documentElement.setAttribute("data-intro","")}catch(e){}})()`,
          }}
        />
      </head>
      <body className="flex min-h-dvh flex-col bg-paper font-sans text-ink antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
