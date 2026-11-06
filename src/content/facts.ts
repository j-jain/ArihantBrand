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
 * may differ legitimately, and the labels beside them say which is which
 * (since change round 13 both are 35, on the client's word).
 *
 * Brand counts (7 November 2026, the client's latest figures): Arihant
 * Marketing carries 47 brands and Arihant Apparels 42, so the group carries
 * 89. These are STATED figures, `marketing.brands` and `apparels.brands`,
 * and `group.brands` is derived from the two so the total can never disagree
 * with its parts. Every count the site prints reads them.
 *
 * The logo walls lag behind: `partners.ts` renders 48 Marketing logos and 29
 * Apparels logos (77 in all), because the client's list has not been matched
 * to the logo files yet. `marketing.brandsOnWall`, `apparels.brandsOnWall`
 * and `group.labels` stay DERIVED from `partners.ts` and describe the WALL
 * only; no copy prints them. When the walls catch up, the two pairs agree.
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
  /** Years Arihant Marketing has distributed. Since change round 13 (the
   *  client's figure) the same as the group's age. */
  years: 35,
  /** Retailers served across the region. */
  retailers: 300,
  /** Shop-in-shop counters run inside modern trade. */
  sisCounters: 300,
  /** Brands this arm carries, as stated by the client (7 Nov 2026). */
  brands: 47,
  /** Logos this arm renders on its wall. Derived; describes the wall only. */
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
  /** Brands this arm carries, as stated by the client (7 Nov 2026). */
  brands: 42,
  /** Logos this arm renders on its wall. Derived, as above. */
  brandsOnWall: partnersOf("apparels").length,
} as const;

/** Owned by the company and run by the company. */
const storesCompanyOwned = 2;
/** Owned by a franchisee and run by the company (K.A.K in Kohima, Urban
 *  Closet in Itanagar, and Urban Closet in Tura since change round 11). */
const storesFranchisee = 3;

const retail = {
  established: 2023,
  /** Stores trading. Derived from the two ownership counts so the total can
   *  never disagree with its parts. All are open; no fit-out pipeline is
   *  stated. */
  storesOpen: storesCompanyOwned + storesFranchisee,
  storesCompanyOwned,
  storesFranchisee,
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
  /** Brands the group carries: both arms together. Derived from the two
   *  stated counts (47 + 42 = 89), so the total matches its parts. */
  brands: marketing.brands + apparels.brands,
  /** Logos on the portfolio wall. Derived; describes the wall only. */
  labels: partners.length,
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
  /** "89" brand partners: the group's brands, the client's latest total. */
  groupBrandPartners: num(facts.group.brands),
  /** "89" labels for the group; "47" Marketing; "42" Apparels. Stated. */
  groupLabels: num(facts.group.brands),
  marketingBrands: num(facts.marketing.brands),
  apparelsBrands: num(facts.apparels.brands),
} as const;
