/**
 * Lead capture (server-only util).
 *
 * `submitLead` validates with zod, then stores the lead:
 *  - to Sanity as a `lead` document when a write token is configured, else
 *  - appended as one JSON line to `.leads/leads.ndjson` (gitignored) so dev and
 *    demo work with no external services.
 *
 * It never throws to the caller: validation problems and storage failures both
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
import { getWriteClient, sanityWriteConfigured } from "@/lib/sanity";

const GENERIC_STORAGE_ERROR =
  "Could not submit — please call or WhatsApp us instead.";

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
  intent: z.enum(["retailer", "brand", "franchise", "other"]),
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

async function appendLeadToFile(record: Record<string, unknown>): Promise<void> {
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

  const record = {
    ...parsed.data,
    createdAt: new Date().toISOString(),
    status: "new" as const,
  };

  try {
    if (sanityWriteConfigured()) {
      await getWriteClient().create({ _type: "lead", ...record });
    } else {
      await appendLeadToFile(record);
    }
    return { ok: true };
  } catch (err) {
    console.error("[leads] storage failure:", err);
    return { ok: false, error: GENERIC_STORAGE_ERROR };
  }
}
