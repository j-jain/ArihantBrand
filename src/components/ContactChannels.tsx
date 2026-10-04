import { Fragment, type CSSProperties } from "react";
import type { UnitContact } from "@/content/types";
import { cn } from "./cn";
import { MailIcon, PhoneIcon, WhatsAppIcon } from "./icons";

interface ContactChannelsProps {
  contacts: UnitContact[];
  compact?: boolean;
}

/** Group phone into 5-5 (94350 45528) for readability. */
function formatPhone(phone: string): string {
  return phone.replace(/(\d{5})(\d{5})/, "$1 $2");
}

/** Per-unit contact rows (no cards): business name, floor, click-to-call,
 *  WhatsApp and email. Colours use the dark-scope indirection vars, so the
 *  same component reads correctly on paper and inside a `.on-dark` footer. */
export function ContactChannels({
  contacts,
  compact = false,
}: ContactChannelsProps) {
  const textVar: CSSProperties = { color: "var(--_text)" };
  const softVar: CSSProperties = { color: "var(--_text-soft)" };

  return (
    <div
      className={cn(
        "channels grid gap-x-8 gap-y-10",
        compact ? "sm:grid-cols-3" : "sm:grid-cols-2 md:grid-cols-3",
      )}
    >
      {contacts.map((contact) => (
        <div key={contact.unit} className="channels__unit flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <p
              className="font-display"
              style={{
                ...textVar,
                fontWeight: 700,
                fontSize: compact ? "1.1rem" : "1.3rem",
                lineHeight: 1.2,
              }}
            >
              {contact.businessName}
            </p>
            <p className="t-small" style={softVar}>
              {contact.floor}
            </p>
          </div>

          <UnitLinks contact={contact} />
        </div>
      ))}
    </div>
  );
}

/** One unit's call, WhatsApp and email rows. */
function UnitLinks({ contact, className }: { contact: UnitContact; className?: string }) {
  return (
    <ul className={cn("flex flex-col", className)}>
      {contact.phones.map((person) => (
        <li key={person.phone}>
          <a className="channel-link" href={`tel:+91${person.phone}`}>
            <span className="channel-icon">
              <PhoneIcon />
            </span>
            <span>
              <span style={{ fontWeight: 650 }}>{person.name}</span>
              {" · "}
              {formatPhone(person.phone)}
            </span>
          </a>
        </li>
      ))}
      <li>
        <a
          className="channel-link"
          href={`https://wa.me/${contact.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="channel-icon">
            <WhatsAppIcon />
          </span>
          <span>WhatsApp</span>
        </a>
      </li>
      <li>
        <a className="channel-link" href={`mailto:${contact.email}`}>
          <span className="channel-icon">
            <MailIcon />
          </span>
          {/* Break only before the "@" and the dots after it, never
              mid-word: "accounts@arihantmar / keting.net" read as two
              addresses. */}
          <span>
            {contact.email.split(/(?=[@.])/).map((part, i) => (
              <Fragment key={i}>
                {i > 0 ? <wbr /> : null}
                {part}
              </Fragment>
            ))}
          </span>
        </a>
      </li>
    </ul>
  );
}

/** Phone footer: the same rows per unit, folded under the unit's name so the
 *  three units cost three lines until one is opened. A native exclusive
 *  accordion (`details` sharing a `name`), so it works without JS. Rendered
 *  beside ContactChannels and shown only on a phone (the caller hides it from
 *  768px up, and the mobile layer hides the open list on a phone). */
export function ContactAccordion({
  contacts,
  name,
  className,
}: {
  contacts: UnitContact[];
  name: string;
  className?: string;
}) {
  return (
    <div className={cn("footer-units", className)}>
      {contacts.map((contact) => (
        <details key={contact.unit} name={name} className="faq-item footer-unit">
          <summary className="faq-summary footer-unit__head">
            <span className="footer-unit__name">{contact.businessName}</span>
            <span className="footer-unit__floor">{contact.floor}</span>
          </summary>
          <UnitLinks contact={contact} className="footer-unit__links" />
        </details>
      ))}
    </div>
  );
}
