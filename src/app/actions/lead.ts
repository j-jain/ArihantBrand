"use server";

import { submitLead } from "@/lib/leads";
import type { LeadInput, LeadResult } from "@/content/types";

export async function submitLeadAction(data: LeadInput): Promise<LeadResult> {
  return submitLead(data);
}
