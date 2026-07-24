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
import { pillar, timelineEntry, processStep, groupStat } from "./groupContent";
import { award, systemFeature, sisPoint } from "./award";
import { lead } from "./lead";

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
  pillar,
  timelineEntry,
  processStep,
  groupStat,
  award,
  systemFeature,
  sisPoint,
  lead,
];
