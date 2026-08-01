import type { SchemaTypeDefinition } from "sanity";

import { siteSettings } from "./siteSettings";
import { businessPoint, cta, stat } from "./objects";
import { business } from "./business";
import { partner } from "./partner";
import { store } from "./store";
import { faq } from "./faq";
import { testimonial } from "./testimonial";
import { post } from "./post";
import { page } from "./page";
import { funnelCard, pillar, valuePanel, timelineEntry, processStep, groupStat } from "./groupContent";
import {
  award,
  marketingReason,
  marketingStep,
  marketingStrength,
} from "./award";
import { lead } from "./lead";
import { leaderPortrait, recognitionPhoto, teamMember } from "./people";
import { photoSlot } from "./photoSlot";

/** All schema types registered with the Studio. Object types (cta, stat,
 *  businessPoint) must be registered too because documents reference them by
 *  name. */
export const schemaTypes: SchemaTypeDefinition[] = [
  // Objects
  businessPoint,
  cta,
  stat,
  // Documents
  siteSettings,
  business,
  partner,
  store,
  faq,
  testimonial,
  post,
  page,
  funnelCard,
  pillar,
  valuePanel,
  timelineEntry,
  processStep,
  groupStat,
  award,
  marketingStrength,
  marketingStep,
  marketingReason,
  photoSlot,
  recognitionPhoto,
  teamMember,
  leaderPortrait,
  lead,
];
