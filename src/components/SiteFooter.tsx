import type { SiteSettings } from "@/content/types";
import { mapsEmbedUrl, mapsUrl } from "@/lib/seo";
import { ContactAccordion, ContactChannels } from "./ContactChannels";
import { MapPinIcon } from "./icons";
import { NetworkMap } from "./motion/NetworkMap";

interface SiteFooterProps {
  settings: SiteSettings;
}

/** Charcoal full-bleed footer, kept lean (change round 5). A top row pairs a
 *  Besley reach line and the unit contact channels with a dotted NetworkMap of
 *  the Northeast (Guwahati hub); under it the office on a live Google Map
 *  (change round 7); one slim bottom line carries the copyright and the
 *  address, which is itself the Google Maps link.
 *
 *  The intent links, the footer nav, the motto and the privacy note went in
 *  round 5: the header already carries the nav and the asks, and the privacy
 *  note now sits under each form's submit button, where it is read. */
export function SiteFooter({ settings }: SiteFooterProps) {
  const year = new Date().getFullYear();
  const nap = `${settings.addressLine}, ${settings.locality}, ${settings.city}, ${settings.state} ${settings.postalCode}`;
  const directionsUrl = mapsUrl(settings);
  // The card on the map reads like the building's own sign: its name, the
  // landmarks a person asks for, then locality and postcode.
  const [building, ...landmarks] = settings.addressLine.split(",").map((part) => part.trim());
  // GSTIN and CIN print only once the client supplies them (both blank today),
  // so nothing ships as a placeholder.
  const registration = [
    settings.gstin ? `GSTIN ${settings.gstin}` : null,
    settings.cin ? `CIN ${settings.cin}` : null,
  ].filter(Boolean);

  return (
    <footer className="on-dark relative overflow-hidden">
      <div className="site-footer__inner container-site section-pad relative">
        {/* Top row: reach line + contact channels (left), map (right). On a
            phone the reach line sits beside the map and the three units fold
            into an accordion (mobile.css section 6). */}
        <div className="footer-top grid items-start md:grid-cols-12 md:gap-16">
          <div className="footer-top__copy md:col-span-7">
            <h2 className="t-h3 text-on-charcoal">
              From Guwahati to counters across the Northeast.
            </h2>
            <div className="footer-channels mt-8">
              <ContactChannels contacts={settings.contacts} compact />
            </div>
            <ContactAccordion
              contacts={settings.contacts}
              name="footer-units"
              className="md:hidden"
            />
          </div>
          <div className="footer-map mt-12 md:col-span-5 md:mt-0">
            <NetworkMap />
          </div>
        </div>

        {/* The office on a live map (change round 7: the client wanted a map
            to click, not only a link). The frame is Google's own widget, so a
            reader can pan, zoom and take directions in place; it loads lazily,
            only as the footer comes near. The card is the plain link to the
            exact pin, for anyone who would rather open the Maps app. */}
        <div className="footer-office mt-14">
          <div className="footer-office__map">
            <iframe
              className="footer-office__frame"
              src={mapsEmbedUrl(settings)}
              title={`${building}, ${settings.locality}, ${settings.city}, on Google Maps`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <a
            className="footer-office__card group"
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${nap}, open in Google Maps (opens in a new tab)`}
          >
            <span className="footer-office__pin" aria-hidden="true">
              <MapPinIcon />
            </span>
            <span className="flex flex-col gap-1">
              <span className="footer-office__name">{building}</span>
              {landmarks.length ? (
                <span className="t-small text-ink-soft">{landmarks.join(", ")}</span>
              ) : null}
              <span className="t-small text-ink-soft">
                {settings.locality}, {settings.city} {settings.postalCode}
              </span>
              <span className="footer-office__go t-small">
                Open in Google Maps <span aria-hidden="true">↗</span>
              </span>
            </span>
          </a>
        </div>

        {/* The one bottom line: copyright and the full NAP, as the map link. */}
        <div className="footer-base t-small mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line-dark pt-6 text-on-charcoal-soft">
          <p>
            © {year} {settings.orgName}, {settings.city}
          </p>
          {/* The address IS the map link (change round 6): it opens the
              office on Google Maps, the exact pin once the Studio has it. */}
          <address className="not-italic">
            <a
              className="footer-nap group inline-flex items-center gap-2 text-on-charcoal-soft transition-colors hover:text-on-charcoal"
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${nap}, on Google Maps (opens in a new tab)`}
            >
              <span className="channel-icon">
                <MapPinIcon />
              </span>
              <span className="underline decoration-line-dark decoration-1 underline-offset-4 transition-colors group-hover:decoration-current">
                {nap}
              </span>
              <span aria-hidden="true" className="footer-nap__arrow font-semibold text-on-charcoal">
                ↗
              </span>
            </a>
          </address>
          {registration.length ? <p>{registration.join(" · ")}</p> : null}
        </div>

        {/* Clears the mobile StickyActionBar so the bottom line stays reachable. */}
        <div aria-hidden="true" className="m-dock-spacer h-20 md:hidden" />
      </div>
    </footer>
  );
}
