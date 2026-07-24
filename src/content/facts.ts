/**
 * Every published figure on this site, in one place, explicitly scoped.
 *
 * Why this file exists: the same fact used to be typed by hand in seven or
 * eight places, so group-level and unit-level figures drifted apart and read
 * as contradictions ("30+ years" beside "35 years", "45+ brands" beside a wall
 * of 48 logos). Nothing outside this file may state a number that belongs to
 * the business. Copy interpolates from here; components read `groupStats` and
 * `business.stats`, both of which are built from here.
 *
 * Scoping is the point. `facts.group.years` is the age of the house;
 * `facts.marketing.years` is how long the distribution arm has traded. They
 * differ legitimately, and the labels beside them say which is which.
 *
 * Two figures are DERIVED from `partners.ts` so they can never disagree with
 * the logo walls that render them: the group label count and each arm's
 * brand-partner count.
 *
 * Every value here is awaiting client sign-off (change brief, open item X8).
 * See CHANGE-BRIEF-STATUS.md for the questions attached to each one.
 */

import { partners, partnersOf } from "./partners";

/* ------------------------------------------------------------------ */
/* Display helpers — one formatting of a figure, sitewide.              */
/* ------------------------------------------------------------------ */

/** Group en-IN: 15000 -> "15,000". */
export const num = (value: number): string =>
  new Intl.NumberFormat("en-IN").format(value);

/** An approximate floor: 250 -> "250+". */
export const atLeast = (value: number): string => `${num(value)}+`;

/** A floor area: 15000 -> "15,000 sq ft". */
export const sqFt = (value: number): string => `${num(value)} sq ft`;

/* ------------------------------------------------------------------ */
/* Per-arm figures                                                      */
/* ------------------------------------------------------------------ */

const marketing = {
  /** Years Arihant Marketing has distributed. Shorter than the group's age. */
  years: 30,
  /** Retailers on a scheduled visit cycle. */
  retailers: 250,
  /** Brand partners. Derived: this is exactly what the logo wall renders. */
  brands: partnersOf("marketing").length,
  warehouseSqFt: 15000,
  /** Days between two visits to the same retailer. */
  visitCycleDays: 20,
  /** CMAI Best Distributor of India. */
  awardYear: 2015,
  /** Year the distribution house was formally registered. */
  registered: 1999,
} as const;

const apparels = {
  established: 2013,
  warehouseSqFt: 9000,
  /** Consecutive regional exhibitions led on footfall. */
  exhibitions: 4,
  /** Brand partners. Derived from the logo wall, as above. */
  brands: partnersOf("apparels").length,
} as const;

const retail = {
  established: 2023,
  storesOpen: 4,
  storesFitOut: 2,
  storesPlanned: 10,
  /** The horizon the store plan is stated against. */
  planHorizon: "FY 26-27",
} as const;

/* ------------------------------------------------------------------ */
/* Group figures — composed from the arms wherever a total exists, so   */
/* a total can never drift away from its parts.                         */
/* ------------------------------------------------------------------ */

const group = {
  /** Age of the house, counting from the family's first Guwahati counter. */
  years: 35,
  /** Retailers served across the Northeast. */
  retailers: 250,
  /** Labels on the portfolio wall. Derived. */
  labels: partners.length,
  /** Both godowns together. Derived. */
  warehouseSqFt: marketing.warehouseSqFt + apparels.warehouseSqFt,
  /** States of the Northeast served. */
  states: 7,
  storesOpen: retail.storesOpen,
  storesFitOut: retail.storesFitOut,
  storesPlanned: retail.storesPlanned,
  planHorizon: retail.planHorizon,
} as const;

export const facts = { group, marketing, apparels, retail } as const;

/* ------------------------------------------------------------------ */
/* Frequently-written phrases, so their wording matches everywhere too. */
/* ------------------------------------------------------------------ */

export const phrase = {
  /** "20 days" — the visit cycle, as it is spoken. */
  visitCycle: `${facts.marketing.visitCycleDays} days`,
  /** "24,000 sq ft" — both godowns. */
  groupWarehouse: sqFt(facts.group.warehouseSqFt),
  marketingWarehouse: sqFt(facts.marketing.warehouseSqFt),
  apparelsWarehouse: sqFt(facts.apparels.warehouseSqFt),
  /** "250+" retailers, group scope. */
  groupRetailers: atLeast(facts.group.retailers),
  marketingRetailers: atLeast(facts.marketing.retailers),
  /** "77" labels; "48" Marketing brands; "29" Apparels brands. */
  groupLabels: num(facts.group.labels),
  marketingBrands: num(facts.marketing.brands),
  apparelsBrands: num(facts.apparels.brands),
} as const;
