/**
 * Every published figure on this site, in one place, explicitly scoped.
 *
 * Why this file exists: the same fact used to be typed by hand in seven or
 * eight places, so group-level and unit-level figures drifted apart and read
 * as contradictions (30+ years beside 35 years, a stated brand count beside a
 * wall of a different number of logos). Nothing outside this file may state a
 * number that belongs to the business. Copy interpolates from here; components read `groupStats` and
 * `business.stats`, both of which are built from here.
 *
 * Scoping is the point. `facts.group.years` is the age of the house;
 * `facts.marketing.years` is how long the distribution arm has traded. They
 * differ legitimately, and the labels beside them say which is which.
 *
 * Three figures are DERIVED from `partners.ts` so they can never disagree with
 * the logo walls that render them: `group.labels`, `marketing.brandsOnWall`
 * and `apparels.brandsOnWall`. Those three describe the WALL.
 *
 * `group.brandPartners` is deliberately NOT derived, and is the one place this
 * file states a figure the site cannot show you. The client's brand-partner
 * count is 80+; the wall currently renders 77 logos, because the remaining
 * logo files have not been supplied. Until they arrive the stated count and
 * the rendered wall legitimately differ, which is why they are two named
 * fields rather than one. When the missing logos land in
 * `public/images/partners/` and `partners.ts`, delete `brandPartners` and
 * point `phrase.groupBrandPartners` back at `group.labels`.
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

const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

/** A small count spelled out, for figures that read as prose: 2 -> "two".
 *  Falls back to digits above ten, where words stop reading naturally. */
export const inWords = (value: number): string => WORDS[value] ?? num(value);

/** As `inWords`, capitalised for the start of a sentence: 2 -> "Two". */
export const InWords = (value: number): string => {
  const w = inWords(value);
  return w.charAt(0).toUpperCase() + w.slice(1);
};

/* ------------------------------------------------------------------ */
/* Per-arm figures                                                      */
/* ------------------------------------------------------------------ */

const marketing = {
  /** Years Arihant Marketing has distributed. Shorter than the group's age. */
  years: 30,
  /** Retailers served across the region. */
  retailers: 300,
  /** Shop-in-shop counters run inside modern trade. */
  sisCounters: 300,
  /** Labels this arm renders on its wall. Derived, so it cannot drift. */
  brandsOnWall: partnersOf("marketing").length,
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
  /** Labels this arm renders on its wall. Derived, as above. */
  brandsOnWall: partnersOf("apparels").length,
} as const;

const retail = {
  established: 2023,
  /** Stores trading. All four are open; there is no fit-out pipeline stated. */
  storesOpen: 4,
  /** Owned by the company and run by the company. */
  storesCompanyOwned: 2,
  /** Owned by a franchisee and run by the company. */
  storesFranchisee: 2,
} as const;

/* ------------------------------------------------------------------ */
/* Group figures — composed from the arms wherever a total exists, so   */
/* a total can never drift away from its parts.                         */
/* ------------------------------------------------------------------ */

const group = {
  /** Age of the house, counting from the family's first Guwahati counter. */
  years: 35,
  /** Retailers served across the Northeast. */
  retailers: 300,
  /** Labels on the portfolio wall. Derived: exactly what the wall renders. */
  labels: partners.length,
  /**
   * Brand partners the house works with, as stated by the client. NOT derived.
   * Exceeds `labels` while logo files are outstanding. See the file header.
   */
  brandPartners: 80,
  /** Both godowns together. Derived. */
  warehouseSqFt: marketing.warehouseSqFt + apparels.warehouseSqFt,
  /** States of the Northeast served. */
  states: 7,
  storesOpen: retail.storesOpen,
  storesCompanyOwned: retail.storesCompanyOwned,
  storesFranchisee: retail.storesFranchisee,
} as const;

export const facts = { group, marketing, apparels, retail } as const;

/* ------------------------------------------------------------------ */
/* Frequently-written phrases, so their wording matches everywhere too. */
/* ------------------------------------------------------------------ */

export const phrase = {
  /** "20 days" — the visit cycle, as it is spoken. */
  visitCycle: `${facts.marketing.visitCycleDays} days`,
  /* The combined "24,000 sq ft" phrase is gone with the home proof band that
     carried it. `group.warehouseSqFt` stays above as the derived total, so
     the phrase can come back without recomputing anything. */
  marketingWarehouse: sqFt(facts.marketing.warehouseSqFt),
  apparelsWarehouse: sqFt(facts.apparels.warehouseSqFt),
  /** "300+" retailers, group scope. */
  groupRetailers: atLeast(facts.group.retailers),
  marketingRetailers: atLeast(facts.marketing.retailers),
  /** "300+" shop-in-shop counters. */
  sisCounters: atLeast(facts.marketing.sisCounters),
  /** "80+" brand partners, the stated figure. */
  groupBrandPartners: atLeast(facts.group.brandPartners),
  /** "77" labels on the wall; "48" Marketing; "29" Apparels. All derived. */
  groupLabels: num(facts.group.labels),
  marketingBrands: num(facts.marketing.brandsOnWall),
  apparelsBrands: num(facts.apparels.brandsOnWall),
} as const;
