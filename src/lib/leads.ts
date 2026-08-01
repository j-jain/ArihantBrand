/**
 * Lead capture (server-only util).
 *
 * `submitLead` validates with zod, then EMAILS the lead. It is deliberately not
 * written to Sanity: free-plan datasets are public and the project id ships in
 * the browser bundle, so a `lead` document holding a prospect's name, phone and
 * email would be readable by anyone. Marketing copy can live in a public
 * dataset; personal data cannot.
 *
 * That inverts an assumption this file used to make. Storage and notification
 * were separate so an alerting outage could never lose a lead. There is no
 * separate storage now, so a failed send MUST reach the visitor as "could not
 * submit, please call" rather than be logged and swallowed. Anything else
 * silently drops business.
 *
 * With no email provider configured the lead is appended to
 * `.leads/leads.ndjson` (gitignored) so local development works offline. On a
 * host with a disposable filesystem that file is worthless, so there we refuse
 * the submission instead of pretending it landed.
 *
 * It never throws to the caller: validation problems and delivery failures both
 * come back as `{ ok: false, error }`.
 *
 * Note: this is a plain util. The `"use server"` directive lives in the
 * page-level action files that call this, not here. The honeypot field is
 * checked by the caller before calling `submitLead`.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";

import type { LeadInput, LeadResult } from "@/content/types";
import { emailNotifierConfigured, resendLeadNotifier } from "@/lib/notify-email";

const GENERIC_STORAGE_ERROR =
  "Could not submit. Please call or WhatsApp us instead.";

const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s\-().]/g, ""))
  .refine(
    (v) => /^(\+?91)?[6-9]\d{9}$/.test(v),
    "Enter a valid 10-digit Indian mobile number.",
  )
  // Normalise to the bare 10-digit number for storage.
  .transform((v) => v.replace(/^\+?91/, ""));

/** Shared zod schema for inquiry submissions. Output is assignable to LeadInput. */
export const leadInputSchema = z.object({
  intent: z.enum(["retailer", "brand", "franchise", "careers", "other"]),
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name.")
    .max(80, "That name is too long."),
  phone: phoneSchema,
  email: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.string().trim().email("Enter a valid email, or leave it blank.").optional(),
  ),
  city: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.string().trim().max(80).optional(),
  ),
  company: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.string().trim().max(120).optional(),
  ),
  message: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.string().trim().max(2000).optional(),
  ),
  sourcePage: z.string().trim().min(1).default("/"),
});

/* ------------------------------------------------------------------ */
/* Delivery                                                             */
/*                                                                      */
/* The provider stays pluggable so a WhatsApp Business or Interakt       */
/* provider can replace email later without touching the call sites.     */
/* `setLeadNotifier()` overrides the default; the default resolves from  */
/* the environment on each call, because module-level side effects are   */
/* not a reliable place to configure anything in a serverless runtime.   */
/* ------------------------------------------------------------------ */

/** A lead as stored: the validated input plus its storage metadata. */
export interface StoredLead extends LeadInput {
  createdAt: string;
  status: "new";
}

export interface LeadNotifier {
  /** Shown in logs so it is obvious which provider ran. */
  readonly name: string;
  notify(lead: StoredLead): Promise<void>;
}

let override: LeadNotifier | null = null;

/** Install a provider explicitly. Used by tests; production resolves from env. */
export function setLeadNotifier(next: LeadNotifier): void {
  override = next;
}

/** The provider that would handle a lead right now, or null if none is set up. */
export function currentLeadNotifier(): LeadNotifier | null {
  if (override) return override;
  return emailNotifierConfigured() ? resendLeadNotifier : null;
}

/** True on a host whose filesystem does not survive the request, where the
 *  `.leads` file fallback would quietly discard the enquiry. */
function filesystemIsDisposable(): boolean {
  return Boolean(process.env.VERCEL);
}

async function appendLeadToFile(record: StoredLead): Promise<void> {
  const dir = path.join(process.cwd(), ".leads");
  await fs.mkdir(dir, { recursive: true });
  await fs.appendFile(
    path.join(dir, "leads.ndjson"),
    JSON.stringify(record) + "\n",
    "utf8",
  );
}

export async function submitLead(data: LeadInput): Promise<LeadResult> {
  const parsed = leadInputSchema.safeParse(data);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      error: first?.message ?? "Please check the form and try again.",
    };
  }

  const record: StoredLead = {
    ...parsed.data,
    createdAt: new Date().toISOString(),
    status: "new" as const,
  };

  const provider = currentLeadNotifier();

  if (!provider) {
    // Nothing can carry this enquiry anywhere. On a disposable filesystem the
    // file fallback is a lie, so say so rather than return ok and lose it.
    if (filesystemIsDisposable()) {
      console.error(
        "[leads] no email provider configured (RESEND_API_KEY / LEAD_NOTIFY_TO / LEAD_NOTIFY_FROM). Enquiry refused rather than dropped.",
      );
      return { ok: false, error: GENERIC_STORAGE_ERROR };
    }
    try {
      await appendLeadToFile(record);
      console.warn("[leads] no email provider configured; wrote to .leads/leads.ndjson");
      return { ok: true };
    } catch (err) {
      console.error("[leads] file fallback failed:", err);
      return { ok: false, error: GENERIC_STORAGE_ERROR };
    }
  }

  try {
    await provider.notify(record);
    return { ok: true };
  } catch (err) {
    console.error(`[leads] provider "${provider.name}" failed:`, err);
    return { ok: false, error: GENERIC_STORAGE_ERROR };
  }
}
