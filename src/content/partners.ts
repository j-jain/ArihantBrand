import type { Partner } from "./types";

/* ------------------------------------------------------------------ */
/* Partner logos (from the brand profile).                              */
/*                                                                      */
/* This list is the source of truth for two published figures: the       */
/* group's label count and Arihant Marketing's brand-partner count       */
/* (see facts.ts, which derives both from here rather than restating     */
/* them). Add a partner and every count on the site moves with it.       */
/*                                                                      */
/* Categories are added ONLY where publicly verifiable for well-known    */
/* national labels; regional labels stay untagged.                       */
/* ------------------------------------------------------------------ */

const m = (name: string, slug: string, category?: string): Partner => ({
  name,
  slug,
  unit: "marketing",
  image: `/images/partners/${slug}.webp`,
  ...(category ? { category } : {}),
});
const a = (name: string, slug: string, category?: string): Partner => ({
  name,
  slug,
  unit: "apparels",
  image: `/images/partners/${slug}.webp`,
  ...(category ? { category } : {}),
});

/* The order a retailer actually scans a wall in. Alphabetical put A-Cube,
   Amidhara and Azzurro first, so the labels a buyer already stocks were buried
   six rows down. This is one recognition scale across both portfolios (a wall
   filtered to one unit still sorts correctly from it), and it is presentation
   only: it claims nothing about volume, margin or importance to us. Slugs
   rather than names, so a display-name edit cannot silently drop a brand.
   Anything not listed keeps the alphabetical order below. */
const popularityOrder: string[] = [
  "skechers",
  "biba",
  "wildcraft",
  "indian-terrain",
  "spykar",
  "libas",
  "rangriti",
  "integriti",
  "octave",
  "sweet-dreams",
  "little-kangaroos",
  "nivia",
  "twills",
  "catwalk",
  "deal-jeans",
  "juniper",
  "peppermint",
  "tiny-girl",
  "alvaro-castagnino",
  "hoffmen",
  "minerals-jeans",
  "tadpole",
];

const rankBySlug = new Map(
  popularityOrder.map((slug, index) => [slug, index + 1] as const),
);

const roster: Partner[] = [
  // Arihant Marketing portfolio
  m("A-Cube", "a-cube"),
  m("Amidhara", "amidhara"),
  m("Azzurro", "azzurro"),
  m("Beevee", "beevee"),
  m("Blazo", "blazo"),
  m("Bonny", "bonny"),
  m("Charter", "charter"),
  m("Chocolate Baby", "chocolate-baby"),
  m("Clubwear", "clubwear"),
  m("Country Wide Shirts", "country-wide-shirts"),
  m("Cross World", "cross-world"),
  m("Dare Jeans", "dare-jeans"),
  m("Deal Jeans", "deal-jeans", "Women's westernwear"),
  m("dida", "dida"),
  m("Ethni'ks Neu-Ron", "ethniks-neu-ron"),
  m("Exceed", "exceed"),
  m("Focus Jeans", "focus-jeans"),
  m("Four Buttons", "four-buttons"),
  m("Gemini", "gemini"),
  m("Grab It", "grab-it"),
  m("Hatcher's", "hatchers"),
  m("Hoffmen", "hoffmen"),
  m("Indian Terrain", "indian-terrain", "Men's casualwear"),
  m("Juliet", "juliet"),
  m("Kathy", "kathy"),
  m("Kooki Ethnics", "kooki-ethnics"),
  m("Little Collars", "little-collars"),
  m("Little Kangaroos", "little-kangaroos", "Kidswear"),
  m("Mayur", "mayur"),
  m("Mohit Industries", "mohit-industries"),
  m("Nostrum", "nostrum"),
  m("O'Baby", "obaby"),
  m("Octave", "octave", "Winterwear"),
  m("Peppermint", "peppermint", "Kidswear"),
  m("Perri Palley", "perri-palley"),
  m("Pretty Woman", "pretty-woman"),
  m("Raksha", "raksha"),
  m("RE:PINK", "re-pink"),
  m("RexStraut Jeans", "rexstraut-jeans"),
  m("Spykar", "spykar", "Denim"),
  m("Sulphur Style Lab", "sulphur-style-lab"),
  m("Tadpole", "tadpole"),
  m("Tassel", "tassel"),
  m("Tiny Girl", "tiny-girl", "Kidswear"),
  m("Twills", "twills", "Men's casualwear"),
  m("Vriti", "vriti"),
  m("Yaaron", "yaaron"),
  m("7L", "7l"),
  // Arihant Apparels portfolio
  a("Alvaro Castagnino", "alvaro-castagnino"),
  a("Bad Boys", "bad-boys"),
  a("Believe-In Shirts", "believe-in-shirts"),
  a("BIBA", "biba", "Women's ethnic wear"),
  a("Caroline Clothing", "caroline-clothing"),
  a("Catwalk", "catwalk", "Footwear"),
  a("Cool Colors", "cool-colors"),
  a("Dagerrfly", "dagerrfly"),
  a("Dhwaja", "dhwaja"),
  a("Integriti", "integriti", "Men's casualwear"),
  a("Juniper", "juniper", "Women's ethnic wear"),
  a("Kashmiera", "kashmiera"),
  a("Kidzello", "kidzello"),
  a("La' Scoot", "la-scoot"),
  a("Libas", "libas", "Women's ethnic wear"),
  a("Mikki House", "mikki-house"),
  a("Minerals Jeans", "minerals-jeans"),
  a("MJ Mashup", "mj-mashup"),
  a("Mollys", "mollys"),
  a("NIVIA", "nivia", "Footwear"),
  a("Rangriti", "rangriti", "Women's ethnic wear"),
  a("Raw Star", "raw-star"),
  a("Red Flame", "red-flame"),
  a("Skechers", "skechers", "Footwear"),
  a("Stori", "stori"),
  a("Sweet Dreams", "sweet-dreams", "Innerwear & loungewear"),
  a("Wildcraft", "wildcraft", "Outdoor & gear"),
  a("Yvon & Satin", "yvon-satin"),
  a("Zola", "zola"),
];

export const partners: Partner[] = roster.map((partner) => {
  const rank = rankBySlug.get(partner.slug);
  return rank === undefined ? partner : { ...partner, rank };
});

/** The labels a given distribution arm carries. */
export function partnersOf(unit: Partner["unit"]): Partner[] {
  return partners.filter((p) => p.unit === unit);
}

/* Unranked labels sort against each other as equals rather than against
   Infinity, whose difference is NaN and leaves the comparator undefined. */
const RANK_FLOOR = Number.MAX_SAFE_INTEGER;

/** Wall order: recognised national labels first, everything else after in the
 *  alphabetical order it already holds (Array#sort is stable). Every brand wall
 *  on the site runs through this so the four of them never disagree. */
export function byPopularity(list: Partner[]): Partner[] {
  return [...list].sort(
    (a, b) => (a.rank ?? RANK_FLOOR) - (b.rank ?? RANK_FLOOR),
  );
}
