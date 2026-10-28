import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import {
  SiteFooter,
  SiteHeader,
  SmoothScroll,
  StickyActionBar,
  WhatsAppFab,
} from "@/components";
import { getBusinesses, getSiteSettings } from "@/lib/content";

/** The public site shell: paper header, the main content region (the skip-link
 *  target), the charcoal footer, and the mobile sticky action bar. Contact
 *  defaults for the action bar come from site settings. */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [settings, businesses] = await Promise.all([getSiteSettings(), getBusinesses()]);
  // The header's Businesses menu line, editable in the Studio ("Menu line").
  // A unit with none set falls back to the seed's line inside the header.
  const menuLines = Object.fromEntries(
    businesses.filter((b) => b.tagline).map((b) => [b.unit, b.tagline]),
  );

  return (
    <>
      <SmoothScroll />
      <SiteHeader whatsapp={settings.defaultWhatsapp} menuLines={menuLines} />
      {/* tabIndex -1 so the skip link can land focus here, not only scroll
          (change round 9: under Lenis the click was intercepted and focus
          never moved). */}
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <SiteFooter settings={settings} />
      {/* Two halves of one job: the bar carries phones, the FAB carries
          laptops. Both route WhatsApp by page and both stand down over the
          page's own CTA bands. */}
      <StickyActionBar
        tel={`+${settings.defaultWhatsapp}`}
        whatsapp={settings.defaultWhatsapp}
        contacts={settings.contacts}
      />
      <WhatsAppFab fallback={settings.defaultWhatsapp} />
      {/* Vercel Web Analytics: page views for the public site only, so the
          Studio is never counted. Cookieless and served from the site's own
          domain (/_vercel/insights), so no consent banner is needed. */}
      <Analytics />
    </>
  );
}
