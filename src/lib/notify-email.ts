/**
 * Email delivery for inquiry-form leads (server-only).
 *
 * Leads are NOT stored in Sanity. Sanity's free plan only offers public
 * datasets, and the project id is compiled into the browser bundle, so anyone
 * could read every document. That is fine for marketing copy, which is
 * published on the site anyway, and unacceptable for a prospect's name, phone
 * number and email. So the enquiry is emailed and never written to the CMS.
 *
 * Resend's REST API is called directly with `fetch` rather than via the `resend`
 * package: one POST with three fields does not justify a dependency in the
 * server bundle.
 *
 * This throws on failure ON PURPOSE. Email is the whole delivery path now, not
 * a courtesy on top of durable storage, so a failed send has to reach the
 * visitor as "could not submit, please call" rather than be logged and
 * swallowed. See `submitLead` in src/lib/leads.ts.
 */

import type { LeadNotifier, StoredLead } from "@/lib/leads";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/** True when every value the provider needs is present. */
export function emailNotifierConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY &&
      process.env.LEAD_NOTIFY_TO &&
      process.env.LEAD_NOTIFY_FROM,
  );
}

const INTENT_LABEL: Record<StoredLead["intent"], string> = {
  retailer: "Retailer",
  brand: "Brand",
  franchise: "Franchise",
  careers: "Careers",
  other: "General",
};

/** The timestamp as the Guwahati office reads it, not as UTC. */
function formatIst(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso));
}

/** Plain text, not HTML: it reads correctly in every client, cannot land in a
 *  spam filter for its markup, and is easy to forward. */
function body(lead: StoredLead): string {
  const lines = [
    `${INTENT_LABEL[lead.intent]} enquiry from the website.`,
    "",
    `Name     ${lead.name}`,
    `Phone    +91 ${lead.phone}`,
  ];
  if (lead.email) lines.push(`Email    ${lead.email}`);
  if (lead.city) lines.push(`City     ${lead.city}`);
  if (lead.company) lines.push(`Company  ${lead.company}`);
  lines.push("", `Received ${formatIst(lead.createdAt)} IST`, `Page     ${lead.sourcePage}`);
  if (lead.message) lines.push("", "Message:", lead.message);
  lines.push(
    "",
    "----",
    "Sent by the Arihant Group website contact form.",
    "Reply to this email to answer the sender directly.",
  );
  return lines.join("\n");
}

export const resendLeadNotifier: LeadNotifier = {
  name: "resend",
  async notify(lead: StoredLead): Promise<void> {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.LEAD_NOTIFY_FROM,
        // Comma separated addresses are allowed, so the whole family can be on it.
        to: (process.env.LEAD_NOTIFY_TO ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        // Hitting reply answers the prospect instead of the robot.
        ...(lead.email ? { reply_to: lead.email } : {}),
        subject: `${INTENT_LABEL[lead.intent]} enquiry: ${lead.name}`,
        text: body(lead),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Resend returned ${res.status}: ${detail.slice(0, 300)}`);
    }
  },
};
