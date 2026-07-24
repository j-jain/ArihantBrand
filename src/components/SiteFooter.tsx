import Link from "next/link";
import type { SiteSettings } from "@/content/types";
import { mapsUrl } from "@/lib/seo";
import { ContactChannels } from "./ContactChannels";
import { MapPinIcon } from "./icons";
import { NetworkMap } from "./motion/NetworkMap";
import {
  businessLinks,
  intentLinks,
  partnerLink,
  primaryNav,
  secondaryNav,
} from "./nav";

interface SiteFooterProps {
  settings: SiteSettings;
}

/** Charcoal full-bleed footer. A top row pairs a Besley reach line and the unit
 *  contact channels with a dotted NetworkMap of the Northeast (Guwahati hub);
 *  the nav, full NAP and legal line run full-width beneath it. */
export function SiteFooter({ settings }: SiteFooterProps) {
  const year = new Date().getFullYear();
  const nap = `${settings.addressLine}, ${settings.locality}, ${settings.city}, ${settings.state} ${settings.postalCode}`;
  const directionsUrl = mapsUrl(settings);
  const footerNav = [...businessLinks, partnerLink, ...primaryNav, ...secondaryNav];

  return (
    <footer className="on-dark relative overflow-hidden">
      <div className="container-site section-pad relative">
        {/* Top row: reach line + contact channels (left), map (right). On
            mobile the columns stack, so the map falls after the channels. */}
        <div className="footer-top grid items-start lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <h2 className="t-h3 text-on-charcoal">
              From Guwahati to counters across the Northeast.
            </h2>
            <div className="footer-channels mt-8">
              <ContactChannels contacts={settings.contacts} compact />
            </div>
          </div>
          <div className="footer-map mt-12 lg:col-span-5 lg:mt-0">
            <NetworkMap />
          </div>
        </div>

        {/* The three funnels, each deep-linked so the form opens with the
            intent already chosen. Previously the footer's only ask was a
            single generic "Partner With Us" serving all three. */}
        <nav
          className="footer-intents mt-14 flex flex-wrap gap-x-8 gap-y-3"
          aria-label="Start an inquiry"
        >
          {intentLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="footer-intent group inline-flex min-h-11 items-center gap-1.5 font-sans text-on-charcoal"
              style={{ fontWeight: 650 }}
            >
              <span className="underline-offset-4 group-hover:underline">
                {item.label}
              </span>
              <span
                aria-hidden="true"
                className="text-vermillion transition-transform group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          ))}
        </nav>

        <nav
          className="footer-nav mt-10 flex flex-wrap gap-x-6 gap-y-2"
          aria-label="Footer"
        >
          {footerNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="t-small text-on-charcoal-soft transition-colors hover:text-on-charcoal"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* F3: the full NAP with a directions link beside it, so a visitor can
            act on the address rather than copy it out. */}
        <address className="footer-nap mt-10 flex items-start gap-2 not-italic">
          <span className="channel-icon mt-0.5">
            <MapPinIcon />
          </span>
          <span className="flex flex-col gap-1">
            <span className="t-small text-on-charcoal-soft">
              {settings.orgName} · {nap}
            </span>
            <a
              className="t-small w-fit font-semibold text-on-charcoal underline-offset-4 hover:underline"
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Get directions <span aria-hidden="true">↗</span>
            </a>
          </span>
        </address>

        <div className="footer-legal mt-8 flex flex-col gap-2 border-t border-line-dark pt-6">
          <p className="t-small text-on-charcoal-soft">
            © {year} {settings.orgName}, {settings.city}
          </p>
          {/* F5: registration identifiers and the privacy note. The GST and CIN
              fields are blank until the client supplies them; each line renders
              only when its value exists, so nothing ships as a placeholder. */}
          {settings.gstin || settings.cin ? (
            <p className="t-small text-on-charcoal-soft">
              {[
                settings.gstin ? `GSTIN ${settings.gstin}` : null,
                settings.cin ? `CIN ${settings.cin}` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          ) : null}
          <p className="t-small text-on-charcoal-soft">
            We use the details you send us only to answer your enquiry. We do not
            sell or share them.
          </p>
          <p
            className="t-label mt-1 text-on-charcoal-soft"
            style={{ letterSpacing: "0.12em" }}
          >
            Integrity · Discipline · Trust
          </p>
        </div>

        {/* Clears the mobile StickyActionBar so the legal line stays reachable. */}
        <div aria-hidden="true" className="h-20 md:hidden" />
      </div>
    </footer>
  );
}
