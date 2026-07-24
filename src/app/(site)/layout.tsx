import type { ReactNode } from "react";
import {
  SiteFooter,
  SiteHeader,
  SmoothScroll,
  StickyActionBar,
  WhatsAppFab,
} from "@/components";
import { getSiteSettings } from "@/lib/content";

/** The public site shell: paper header, the main content region (the skip-link
 *  target), the charcoal footer, and the mobile sticky action bar. Contact
 *  defaults for the action bar come from site settings. */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <>
      <SmoothScroll />
      <SiteHeader whatsapp={settings.defaultWhatsapp} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter settings={settings} />
      {/* Two halves of one job: the bar carries phones, the FAB carries
          laptops. Both route WhatsApp by page and both stand down over the
          page's own CTA bands. */}
      <StickyActionBar
        tel={`+${settings.defaultWhatsapp}`}
        whatsapp={settings.defaultWhatsapp}
      />
      <WhatsAppFab fallback={settings.defaultWhatsapp} />
    </>
  );
}
