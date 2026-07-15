import Image from "next/image";
import Link from "next/link";
import type { SiteSettings } from "@/content/types";
import { ContactChannels } from "./ContactChannels";
import { MapPinIcon } from "./icons";
import { businessLinks, primaryNav } from "./nav";

interface SiteFooterProps {
  settings: SiteSettings;
}

/** Charcoal full-bleed footer: three unit contact columns, nav, full NAP and
 *  legal line, with an oversized cropped chevron motif as quiet texture. */
export function SiteFooter({ settings }: SiteFooterProps) {
  const year = new Date().getFullYear();
  const nap = `${settings.addressLine}, ${settings.locality}, ${settings.city}, ${settings.state} ${settings.postalCode}`;
  const footerNav = [...businessLinks, ...primaryNav];

  return (
    <footer className="on-dark relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-1/2 -translate-y-1/2 opacity-[0.08]"
      >
        <Image
          src="/images/motifs/chevron.png"
          alt=""
          width={620}
          height={620}
          className="h-auto w-[38rem] max-w-none"
        />
      </div>

      <div className="container-site section-pad relative">
        <ContactChannels contacts={settings.contacts} compact />

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
