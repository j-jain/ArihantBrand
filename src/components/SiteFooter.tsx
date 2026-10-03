import type { SiteSettings } from "@/content/types";
import { mapsUrl } from "@/lib/seo";
import { ContactChannels } from "./ContactChannels";
import { MapPinIcon } from "./icons";
import { NetworkMap } from "./motion/NetworkMap";

interface SiteFooterProps {
  settings: SiteSettings;
}

/** Charcoal full-bleed footer, kept lean (change round 5). A top row pairs a
 *  Besley reach line and the unit contact channels with a dotted NetworkMap of
 *  the Northeast (Guwahati hub); one slim bottom line carries the copyright,
 *  the address and a directions link.
 *
 *  The intent links, the footer nav, the motto and the privacy note went in
 *  round 5: the header already carries the nav and the asks, and the privacy
 *  note now sits under each form's submit button, where it is read. */
export function SiteFooter({ settings }: SiteFooterProps) {
  const year = new Date().getFullYear();
  const nap = `${settings.addressLine}, ${settings.locality}, ${settings.city}, ${settings.state} ${settings.postalCode}`;
  const directionsUrl = mapsUrl(settings);
  // GSTIN and CIN print only once the client supplies them (both blank today),
  // so nothing ships as a placeholder.
  const registration = [
    settings.gstin ? `GSTIN ${settings.gstin}` : null,
    settings.cin ? `CIN ${settings.cin}` : null,
  ].filter(Boolean);

  return (
    <footer className="on-dark relative overflow-hidden">
      <div className="container-site section-pad relative">
        {/* Top row: reach line + contact channels (left), map (right). On
            mobile the columns stack, so the map falls after the channels. */}
        <div className="footer-top grid items-start md:grid-cols-12 md:gap-16">
          <div className="md:col-span-7">
            <h2 className="t-h3 text-on-charcoal">
              From Guwahati to counters across the Northeast.
            </h2>
            <div className="footer-channels mt-8">
              <ContactChannels contacts={settings.contacts} compact />
            </div>
          </div>
          <div className="footer-map mt-12 md:col-span-5 md:mt-0">
            <NetworkMap />
          </div>
        </div>

        {/* The one bottom line: copyright, the full NAP and directions. */}
        <div className="footer-base t-small mt-14 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line-dark pt-6 text-on-charcoal-soft">
          <p>
            © {year} {settings.orgName}, {settings.city}
          </p>
          <address className="footer-nap flex items-center gap-2 not-italic">
            <span className="channel-icon">
              <MapPinIcon />
            </span>
            <span>{nap}</span>
          </address>
          <a
            className="footer-dir font-semibold text-on-charcoal underline-offset-4 hover:underline"
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Get directions <span aria-hidden="true">↗</span>
          </a>
          {registration.length ? <p>{registration.join(" · ")}</p> : null}
        </div>

        {/* Clears the mobile StickyActionBar so the bottom line stays reachable. */}
        <div aria-hidden="true" className="h-20 md:hidden" />
      </div>
    </footer>
  );
}
