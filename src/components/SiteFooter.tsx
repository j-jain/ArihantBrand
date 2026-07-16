import Link from "next/link";
import type { SiteSettings } from "@/content/types";
import { ContactChannels } from "./ContactChannels";
import { MapPinIcon } from "./icons";
import { NetworkMap } from "./motion/NetworkMap";
import { businessLinks, partnerLink, primaryNav } from "./nav";

interface SiteFooterProps {
  settings: SiteSettings;
}

/** Charcoal full-bleed footer. A top row pairs a Besley reach line and the unit
 *  contact channels with a dotted NetworkMap of the Northeast (Guwahati hub);
 *  the nav, full NAP and legal line run full-width beneath it. */
export function SiteFooter({ settings }: SiteFooterProps) {
  const year = new Date().getFullYear();
  const nap = `${settings.addressLine}, ${settings.locality}, ${settings.city}, ${settings.state} ${settings.postalCode}`;
  const footerNav = [...businessLinks, partnerLink, ...primaryNav];

  return (
    <footer className="on-dark relative overflow-hidden">
      <div className="container-site section-pad relative">
        {/* Top row: reach line + contact channels (left), map (right). On
            mobile the columns stack, so the map falls after the channels. */}
        <div className="grid items-start lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <h2 className="t-h3 text-on-charcoal">
              From Guwahati to counters across the Northeast.
            </h2>
            <div className="mt-8">
              <ContactChannels contacts={settings.contacts} compact />
            </div>
          </div>
          <div className="mt-12 lg:col-span-5 lg:mt-0">
            <NetworkMap />
          </div>
        </div>

        <nav
          className="mt-14 flex flex-wrap gap-x-6 gap-y-2"
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

        <address className="mt-10 flex items-start gap-2 not-italic">
          <span className="channel-icon mt-0.5">
            <MapPinIcon />
          </span>
          <p className="t-small text-on-charcoal-soft">
            {settings.orgName} · {nap}
          </p>
        </address>

        <div className="mt-8 flex flex-col gap-1 border-t border-line-dark pt-6">
          <p className="t-small text-on-charcoal-soft">
            © {year} {settings.orgName}, {settings.city}
          </p>
          <p
            className="t-label text-on-charcoal-soft"
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
