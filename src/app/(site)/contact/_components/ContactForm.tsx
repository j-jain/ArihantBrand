"use client";

import { useSearchParams } from "next/navigation";
import { InquiryForm } from "@/components";
import { submitLeadAction } from "@/app/actions/lead";
import type { LeadInput, SiteSettings } from "@/content/types";

type Intent = LeadInput["intent"];
/** Matches InquiryForm's chooser exactly. `careers` is a valid stored intent on
 *  old leads but is no longer offered, so a stale ?intent=careers link falls
 *  through to the chooser rather than opening a step 2 with no chip. */
const INTENTS: readonly Intent[] = ["retailer", "brand", "franchise", "other"];

/** Client wrapper so /contact stays statically rendered: the server page never
 *  reads searchParams. `useSearchParams()` runs here inside a <Suspense>
 *  boundary and maps ?intent= to the form's default intent. `contacts` flows
 *  through so the form can show the routed unit on step 2. */
export function ContactForm({
  whatsapp,
  contacts,
}: {
  whatsapp?: string;
  contacts?: SiteSettings["contacts"];
}) {
  const params = useSearchParams();
  const raw = params.get("intent");
  const defaultIntent = INTENTS.includes(raw as Intent)
    ? (raw as Intent)
    : undefined;

  return (
    <InquiryForm
      action={submitLeadAction}
      defaultIntent={defaultIntent}
      sourcePage="/contact"
      whatsapp={whatsapp}
      contacts={contacts}
    />
  );
}

/** The same form with no intent, for the page's Suspense fallback
 *  (performance pass). useSearchParams() keeps ContactForm out of the static
 *  HTML, so with a `null` fallback the page's main element only appeared once
 *  JS had run, and the column jumped as it did. This prints the form's first
 *  step (the intent chooser, nothing typed into it yet) in the served HTML;
 *  ContactForm takes over on hydration and opens step 2 for an ?intent= link. */
export function ContactFormStatic({
  whatsapp,
  contacts,
}: {
  whatsapp?: string;
  contacts?: SiteSettings["contacts"];
}) {
  return (
    <InquiryForm
      action={submitLeadAction}
      sourcePage="/contact"
      whatsapp={whatsapp}
      contacts={contacts}
    />
  );
}
