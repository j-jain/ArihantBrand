"use client";

import { useSearchParams } from "next/navigation";
import { InquiryForm } from "@/components";
import { submitLeadAction } from "@/app/actions/lead";
import type { LeadInput, SiteSettings } from "@/content/types";

type Intent = LeadInput["intent"];
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
