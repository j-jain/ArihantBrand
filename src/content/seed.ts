import type {
  Award,
  Business,
  Faq,
  Funnel,
  LeaderPortrait,
  Post,
  RecognitionPhoto,
  RetailModel,
  SiteSettings,
  Stat,
  Store,
  TeamMember,
  Testimonial,
  ProcessStep,
} from "./types";
import { atLeast, facts, inWords, InWords, phrase } from "./facts";

/** The 77 partner logos live in their own module because facts.ts derives the
 *  published label counts from them; re-exported here so every existing
 *  `@/content/seed` import keeps working. */
export { byPopularity, partners, partnersOf } from "./partners";

/* ------------------------------------------------------------------ */
/* Site settings                                                        */
/* ------------------------------------------------------------------ */

export const siteSettings: SiteSettings = {
  orgName: "Arihant Group",
  tagline: "Northeast India's garment distribution and retail house",
  addressLine: "Arihant Tower, Opposite Bhagwat Dham, near Shankar Hotel",
  locality: "Jyotikuchi",
  city: "Guwahati",
  state: "Assam",
  postalCode: "781040",
  country: "IN",
  defaultWhatsapp: "919435045528",
  metaTitleSuffix: " | Arihant Group, Guwahati",
  // AWAITING CLIENT (change brief, F5). Each renders in the footer only once
  // it has a value, so the site never prints an empty label.
  gstin: "",
  cin: "",
  contacts: [
    {
      unit: "marketing",
      // Sagar's and Anand's numbers were removed from public display at the
      // client's request (change brief, F1/F4). Sagar's line survives as this
      // unit's WhatsApp target and as siteSettings.defaultWhatsapp, so
      // distribution enquiries still reach him; it is simply not printed.
      // AWAITING SIGN-OFF: this leaves Marketing showing only Shreyansh, who
      // is Arihant Retail's contact.
      businessName: "Arihant Marketing",
      floor: "2nd Floor",
      phones: [{ name: "Shreyansh Sancheti", phone: "9435569704" }],
      email: "accounts@arihantmarketing.net",
      whatsapp: "919435045528",
    },
    {
      unit: "apparels",
      businessName: "Arihant Apparels",
      floor: "1st Floor",
      phones: [{ name: "Ajay Sancheti", phone: "9954010361" }],
      email: "arihantapparels.ghy@gmail.com",
      whatsapp: "919954010361",
    },
    {
      unit: "retail",
      businessName: "Arihant Retail",
      floor: "Ground Floor",
      phones: [{ name: "Shreyansh Sancheti", phone: "9435569704" }],
      email: "retailarihant@gmail.com",
      whatsapp: "919435569704",
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Group-level stats (every figure comes from the brand profile)        */
/* ------------------------------------------------------------------ */

export const groupStats: Stat[] = [
  { id: "years", value: facts.group.years, suffix: "+", label: "Years in the trade" },
  {
    id: "retailers",
    value: facts.group.retailers,
    suffix: "+",
    label: "Retailers served",
  },
  { id: "labels", value: facts.group.labels, label: "National labels" },
];

/* ------------------------------------------------------------------ */
/* Businesses                                                           */
/* ------------------------------------------------------------------ */

export const businesses: Business[] = [
  {
    unit: "marketing",
    name: "Arihant Marketing",
    slug: "arihant-marketing",
    logo: "/images/logos/arihant-marketing.png",
    founded: "Since the 1990s",
    leaders: ["Sagar Sancheti", "Anand Sancheti"],
    positioning: "The founding arm. The routes, the relationships and the brand roster everything else stands on.",
    summary: `Arihant Marketing has moved national menswear, womenswear and kidswear brands across Northeast India for more than ${facts.marketing.years} years, on a fixed visit cycle.`,
    // No highlights (change round 2): on the home row they restated the
    // figures printed on the logo plate beside them, so the plate keeps the
    // numbers and the copy column keeps the positioning line.
    highlights: [],
    points: [
      {
        id: "pioneer",
        text: `Pioneers of readymade garments distribution across Northeast India, with ${atLeast(facts.marketing.years)} years in the trade.`,
      },
      {
        id: "warehouse",
        text: `${phrase.marketingWarehouse} of organised, state-of-the-art warehousing in Guwahati.`,
      },
      {
        id: "reach",
        text: `Serves ${phrase.marketingRetailers} retailers and ${phrase.marketingBrands} national brand partners.`,
      },
      {
        id: "negta",
        text: "Founder member of NEGTA, the North Eastern Garment Traders Association.",
      },
      {
        // The id is the marketing page's pull-quote selector and must not be
        // renamed. The text is the SIS claim now: the visit cycle was being
        // restated at signage scale on a page that already argues it twice.
        id: "visit-cycle",
        text: `${phrase.sisCounters} shop-in-shop counters handled across the region's modern trade.`,
      },
    ],
    stats: [
      {
        id: "years",
        value: facts.marketing.years,
        suffix: "+",
        label: "Years distributing",
      },
      {
        id: "retailers",
        value: facts.marketing.retailers,
        suffix: "+",
        label: "Retailers",
      },
      {
        id: "warehouse",
        value: facts.marketing.warehouseSqFt,
        suffix: " sq ft",
        label: "Guwahati warehouse",
      },
    ],
    audienceCtas: [
      { label: "Become a retail partner", href: "/contact?intent=retailer" },
      { label: "Distribute your brand", href: "/contact?intent=brand" },
    ],
  },
  {
    unit: "apparels",
    name: "Arihant Apparels",
    slug: "arihant-apparels",
    logo: "/images/logos/arihant-apparels.png",
    founded: "Founded 2013",
    leaders: ["Ajay Sancheti"],
    // The client's tagline (change round 2), the same line the Apparels hero
    // carries.
    positioning:
      "The most modern & systematic distribution house, the best relations with retailers & brands alike.",
    summary: `Founded in ${facts.apparels.established} by Ajay Sancheti, a second-generation garment entrepreneur. Arihant Apparels carries ${phrase.apparelsBrands} labels from a ${phrase.apparelsWarehouse} Guwahati warehouse. Buying runs on sell-through data. Several of those labels are now category leaders in the region.`,
    // Removed at the client's request (change round 2).
    highlights: [],
    points: [
      {
        id: "portfolio",
        text: "A portfolio built to give growing retailers their next bestselling label.",
      },
      {
        id: "ethnic-leadership",
        text: "Home to the Northeast's leading ladies' ethnic labels, alongside westernwear, kidswear and footwear.",
      },
      {
        id: "category-leaders",
        text: "Has established several brand partners as category leaders in the Northeast.",
      },
      { id: "systems", text: "Run on systems and data, from buying to the shop floor." },
      {
        id: "warehouse",
        text: `${phrase.apparelsWarehouse} warehouse in Guwahati.`,
      },
      {
        id: "exhibitions",
        text: "Highest footfall in exhibitions.",
      },
    ],
    stats: [
      { id: "established", value: facts.apparels.established, label: "Established" },
      {
        id: "warehouse",
        value: facts.apparels.warehouseSqFt,
        suffix: " sq ft",
        label: "Guwahati warehouse",
      },
      {
        id: "exhibitions",
        value: facts.apparels.exhibitions,
        label: "Exhibitions led on footfall",
      },
    ],
    audienceCtas: [
      { label: "Shop fast moving brands", href: "/contact?intent=retailer" },
      { label: "Partner as a brand", href: "/contact?intent=brand" },
    ],
  },
  {
    unit: "retail",
    name: "Arihant Retail",
    slug: "arihant-retail",
    logo: "/images/logos/arihant-retail.png",
    founded: "Founded 2023",
    leaders: ["Shreyansh Sancheti"],
    positioning: "Multi-brand modern retail, run by the house that supplies the region.",
    summary: `Arihant's retail arm runs the most modern and professionally run multi-brand stores in Northeast India: ${facts.retail.storesCompanyOwned} company-owned and ${facts.retail.storesFranchisee} franchisee-owned, every one of them run by our team.`,
    highlights: [
      `${InWords(facts.retail.storesCompanyOwned)} company-owned, company-run stores and ${inWords(facts.retail.storesFranchisee)} franchisee-owned, company-run stores`,
      "We hire, buy, merchandise and market. You own the store.",
      "Deadstock stays off the owner's books.",
    ],
    points: [
      {
        id: "multi-brand",
        text: "Multi-brand modern retail stores, merchandised the way a distributor merchandises: nothing sits.",
      },
      {
        id: "open-today",
        text: `${facts.retail.storesOpen} stores trading across Northeast India today.`,
      },
      {
        id: "ownership",
        text: `${facts.retail.storesCompanyOwned} owned by the company and ${facts.retail.storesFranchisee} owned by franchisees. All four are run by our team.`,
      },
      {
        id: "zero-deadstock",
        text: "A zero-deadstock, asset-light, no-frills store model.",
      },
      {
        id: "legacy",
        text: `Backed by the buying power and settlement discipline of a ${facts.group.years}-year distribution house.`,
      },
    ],
    stats: [
      { id: "open", value: facts.retail.storesOpen, label: "Stores trading" },
      {
        id: "company-owned",
        value: facts.retail.storesCompanyOwned,
        label: "Company-owned",
      },
      {
        id: "franchisee",
        value: facts.retail.storesFranchisee,
        label: "Franchisee-owned",
      },
    ],
    audienceCtas: [
      { label: "Own a retail store", href: "/partner" },
      { label: "Put your brand in our stores", href: "/contact?intent=brand" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* The two funnels.                                                     */
/*                                                                      */
/* One CTA used to serve two completely different visitors: a retailer   */
/* who wants stock, and an investor who wants a store. They want         */
/* different things, they are worth different amounts, and they should   */
/* never share a button. These are the home page's split.                */
/* ------------------------------------------------------------------ */

export const funnels: Funnel[] = [
  {
    id: "retailer",
    title: "Shop fast moving brands for your store",
    text: "You run a store. We put the national labels that actually move onto your racks, and keep them moving.",
    cta: { label: "Partner with us", href: "/contact?intent=retailer" },
  },
  {
    id: "franchise",
    title: "Own a retail store",
    text: "You have the capital and the property. We hire the staff, buy the stock, run the marketing and carry the deadstock. You own the asset.",
    cta: { label: "Tap the North East with us", href: "/partner" },
  },
];

/* ------------------------------------------------------------------ */
/* The Arihant Retail managed-store model (ModelBoard + worksheet)      */
/*                                                                      */
/* NOTE FOR ANY FUTURE EDIT: nothing in this object may state an Arihant */
/* business figure, and `facts.ts` deliberately holds nothing for it.    */
/* Franchise economics stay qualitative (PRODUCT.md honesty rails): no   */
/* investment amount, no return percentage, no payback period. The       */
/* worksheet below computes only from numbers the visitor types in, and  */
/* says so on the panel. If you find yourself wanting a number here,     */
/* that is the rail, not an oversight.                                   */
/* ------------------------------------------------------------------ */

export const retailModel: RetailModel = {
  pillars: [
    {
      id: "zero-deadstock",
      title: "Unsold stock leaves your books",
      text: "What does not sell goes back into our distribution network and moves through another counter. A bad season is ours to absorb, not yours to discount.",
    },
    {
      id: "multi-brand",
      title: "Multi-brand, not one label",
      text: "Menswear, womenswear, kidswear, denim, ethnic and footwear on one floor, ranged from the same portfolio we already sell to the region's retailers.",
    },
    {
      id: "no-frills",
      title: "A no-frills store format",
      text: "The fit-out is built to trade, not to impress. Capital goes into stock and into the floor rather than into fixtures nobody buys from.",
    },
    {
      id: "company-run",
      title: "We run it, you own it",
      text: "Hiring, targets, merchandising, marketing and the CRM sit with our team. The store, the lease and the asset sit with you.",
    },
  ],
  roicNote:
    "We argue this model on return on invested capital, not on turnover. The ROIC record of the stores already trading is something we take you through in person, with the cost sheet in front of you. We publish no percentage here, because a number that does not know your city, your rent and your floor is a guess.",
  calculator: {
    triggerLabel: "Work it out on your own numbers",
    heading: "Your numbers, your arithmetic",
    lead: "Put in your space, your rent and the sales you think the floor will do. We will do the arithmetic and nothing else.",
    fields: {
      area: {
        label: "Carpet area (sq ft)",
        help: "The floor you would actually trade on.",
      },
      rent: {
        label: "Monthly rent (rupees)",
        help: "Enter 0 if you own the property.",
      },
      sales: {
        label: "Monthly sales you expect (rupees)",
        help: "Your expectation, not ours. Nothing here is our estimate.",
      },
      margin: {
        label: "Gross margin you expect to work on (%)",
        help: "The margin you would negotiate. We publish no margin figure.",
      },
      otherCosts: {
        label: "Other monthly running costs (rupees)",
        help: "Power, upkeep, anything you would pay yourself.",
      },
    },
    results: {
      grossMargin: "Gross margin on your sales figure",
      statedCosts: "The costs you listed",
      leftOver: "What your own numbers leave",
      salesPerSqFt: "Sales per sq ft per month",
      rentShare: "Rent as a share of sales",
      empty: "Fill the fields above",
    },
    disclosure:
      "Every number here is yours. This tool does arithmetic on the figures you type in and nothing more. Arihant publishes no investment amount and no return percentage on this website, so nothing below is a projection, an offer, or a promise of performance. Your real costs and your real sales will differ. Nothing you type is sent to us or stored anywhere.",
    resultNote: "Calculated from what you entered on this page. Not an Arihant estimate.",
    leftOverNote:
      "This is your gross margin less the costs you listed. It is not a profit figure. Tax, interest, depreciation and working capital are not in it.",
    cta: { label: "Take these numbers to us", href: "/partner#inquiry" },
  },
};

/* ------------------------------------------------------------------ */
/* Why-Arihant pillars (group)                                          */
/* ------------------------------------------------------------------ */

/* The four "Why us?" cards, headed in the client's own words (change round
   2): the range, the team, the brands, and the visit cycle. The client asked
   for the 20-day cycle back on the home page, so this card is the one place
   the home scroll states the number (see PRODUCT.md, repetition discipline).
   Each body is the paragraph the card already carried in the Studio; the
   third is new, since that card is. The Marketing page argues the same ground
   for a brand audience, in different words, from `marketingStrengths` below. */
export const pillars = [
  {
    title: "All categories, all genders, one group, one point of truth",
    text: `Menswear, womenswear, kidswear, denim, ethnic and footwear. ${phrase.groupLabels} labels on one set of terms, one indent and one visit.`,
  },
  {
    title: "The best and most experienced team with full authority and one single point of clearance",
    text: "Our field staff have worked these routes for years. They know your counter, your customer and what sold there last season.",
  },
  {
    title: "Best brands in the respective categories",
    text: "We do not carry a label to fill a gap in the catalogue. Each one leads, or is being built to lead, in the category it sits in.",
  },
  {
    title: `In your store every ${phrase.visitCycle}`,
    text: "Orders, claims and market feedback move face to face, on a cycle that does not slip. Serviceability is what we compete on.",
  },
];

/* The About page's values panel used to render the first three home pillars,
   which meant the two pages printed the same three cards under different
   headings. The values are their own copy now: what the family is trying to
   be, rather than what a retailer buys. */
export const values = [
  {
    title: "Integrity",
    text: "The price quoted is the price billed. A commitment made on a phone call is honoured whether or not it turns out to suit us.",
  },
  {
    title: "Discipline",
    text: "Routes are run on schedule, claims are documented as they happen, and settlements land on the dates we name. None of it depends on who is asking.",
  },
  {
    title: "Trust",
    text: "Retailers in seven states reorder without checking the invoice twice. That took decades to build and one bad season to lose, so we do not spend it.",
  },
];

/* AM10: the same four strengths, argued for a brand manager rather than a
   retailer, so the Marketing page does not reprint the home page. */
export const marketingStrengths = [
  {
    title: "One partner, every category",
    text: `We already move ${phrase.marketingBrands} labels across menswear, womenswear, kidswear and denim. Your range slots into routes that are already running.`,
  },
  {
    title: "A field force you do not have to build",
    text: "Our representatives have worked the Northeast for years. You get their coverage from season one, without a single hire.",
  },
  {
    title: "Books you can reconcile",
    text: "Claims, credits and secondary sales are documented as they happen, not netted into a year-end argument.",
  },
  {
    title: "Coverage you would spend years buying",
    text: `${phrase.marketingRetailers} retailers and ${phrase.sisCounters} shop-in-shop counters, seen in person on a fixed cycle, which is how a size break becomes a fill order inside the same season.`,
  },
];

/* The four steps of the retailer cycle. A true sequence, which is why this is
   the one place on the page that carries numbers. Titles let the row read
   across four columns instead of down four ruled rows. */
export const marketingSteps = [
  {
    title: "Map the counter",
    text: `We map your counter to the right mix from our ${phrase.marketingBrands}-brand portfolio: depth where your customer shops, nothing that will sit.`,
  },
  {
    title: "Stand in the store",
    text: "A representative stands in your store on a fixed cycle. Reorders, claims and market feedback move face to face.",
  },
  {
    title: "Supply, settle, resolve",
    text: "Supply arrives on time, credit notes are issued on time, and any grievance is addressed in one instant rather than held over to the next visit.",
  },
  {
    title: "Settle the books",
    text: "Claims and settlements move on paper, on schedule, so your capital keeps rotating.",
  },
];

/* Why the region needs its own distributor, for a national brand manager.
   Four parallel arguments, not a sequence, so they carry named lead-ins
   rather than index numerals (DESIGN.md: numbers only inside real sequences). */
export const marketingReasons = [
  {
    title: "Seven states, one corridor",
    text: "Seven states, seven tax and transit regimes, and freight that arrives through one corridor. A plan drawn for Kolkata does not survive contact with it.",
  },
  {
    title: "A calendar the mainland does not share",
    text: "Season shapes differ. Winter is short and sharp, the festival calendar is not the mainland's, and wedding weeks move the whole quarter.",
  },
  {
    title: "Doors that open on relationships",
    text: "The counters that matter are independent multi-brand stores, most of them held by families who have bought from the same house for decades. Cold entry does not open them.",
  },
  {
    title: "Sizes and price points of its own",
    text: "Sizes, price points and colour preferences are their own. An assortment cut for a metro arrives with its best-selling half unsold.",
  },
];

/* ------------------------------------------------------------------ */
/* Stores                                                               */
/*                                                                      */
/* Four trading stores, matching facts.retail: 2 company-owned and 2          */
/* franchisee-owned, all four run by Arihant. The fit-out entries that used   */
/* to close this list are gone with the forward-looking store target, so      */
/* every row here is a door a customer can walk into today.                   */
/*                                                                      */
/* PHOTOGRAPHS: the one store shot we hold is the Itanagar store, not the     */
/* Guwahati one it was previously captioned as. Guwahati and Goalpara carry   */
/* no photograph until the client supplies one; a store card without an       */
/* image renders its light plate, which is better than a wrong caption.       */
/* ------------------------------------------------------------------ */

export const stores: Store[] = [
  {
    name: "Urban Closet",
    city: "Guwahati",
    format: "Multi-brand",
    status: "Open",
    ownership: "Company-owned",
    mapsQuery: "Urban Closet, Jyotikuchi, Guwahati, Assam 781040",
  },
  {
    name: "Urban Closet",
    city: "Goalpara",
    format: "Multi-brand",
    status: "Open",
    ownership: "Company-owned",
  },
  {
    name: "K.A.K",
    city: "Kohima",
    format: "Multi-brand",
    status: "Open",
    ownership: "Franchisee-owned",
  },
  {
    name: "Tanzee",
    city: "Itanagar",
    format: "Multi-brand",
    status: "Open",
    ownership: "Franchisee-owned",
    image: "/images/photos/store-urban-closet.jpg",
    caption:
      "The Itanagar store: a franchisee-owned, Arihant-run multi-brand floor, lit for the evening trade.",
  },
];

/* ------------------------------------------------------------------ */
/* Franchise process (true sequence — numbered steps allowed)           */
/* ------------------------------------------------------------------ */

export const partnerSteps: ProcessStep[] = [
  {
    title: "Introduce yourself",
    text: "Send an inquiry with your city, the space you have or plan to lease, and your investment appetite. The right person calls you back.",
  },
  {
    title: "Sit down with us",
    text: "A face-to-face session in Guwahati, or on a call: the model, the store P&L structure, and our track record, laid out openly.",
  },
  {
    title: "We build the store",
    text: "Site assessment, fit-out, merchandising, hiring and training, all handled by the Arihant Retail team while you track the milestones.",
  },
  {
    title: "We run it, you own it",
    text: "Targets, staffing, marketing, CRM and stock rotation are managed from our end. You review performance; deadstock risk stays off your books.",
  },
];

/* ------------------------------------------------------------------ */
/* FAQs                                                                 */
/* ------------------------------------------------------------------ */

export const faqs: Faq[] = [
  {
    page: "partner",
    question: "Do I need retail experience to own an Arihant Retail store?",
    answer:
      "No. Hiring, training, target-setting, merchandising and marketing are all handled by the Arihant Retail team. You own the store; we operate it. Most partners keep their existing occupation.",
  },
  {
    page: "partner",
    question: "What makes the model low-risk?",
    answer: "Three things:",
    bullets: [
      "Unsold inventory never sits on your books.",
      "The store format is asset-light and no-frills.",
      `The operating playbook is already running in ${facts.retail.storesOpen} stores.`,
    ],
  },
  {
    page: "partner",
    question: "How much do I need to invest?",
    answer:
      "It depends on the city, the property and the size of the floor. We walk through the full cost sheet and P&L structure in your proposal discussion. No figure is quoted before we have seen the specifics.",
  },
  {
    page: "partner",
    question: "Who brings customers to the store?",
    answer:
      "We do. Arihant Retail runs calibrated influencer and social media campaigns for every store and maintains the customer CRM centrally. Footfall generation is our responsibility, not yours.",
  },
  {
    page: "partner",
    question: "Where can a store be opened?",
    answer: "Anywhere in Northeast India where the catchment supports modern apparel retail. Every proposed location is assessed against real trade data before we commit.",
  },
  {
    page: "partner",
    question: "What do I actually receive as the owner?",
    answer:
      "A fully fitted, fully staffed, fully stocked store trading under a proven model, with transparent performance reviews. Margin structure, working-capital cycle and payback expectations are laid out in writing at the proposal stage.",
  },
  {
    page: "marketing",
    question: "Which territories do you cover?",
    answer: `All ${facts.group.states} states of Northeast India, serviced from our ${phrase.marketingWarehouse} warehouse in Guwahati. More than ${facts.marketing.retailers} retailers and ${facts.marketing.sisCounters} shop-in-shop counters across the region are on a scheduled visit cycle.`,
  },
  {
    page: "marketing",
    question: "How do I start stocking your brands in my store?",
    answer: "Send an inquiry or call us. Four steps:",
    bullets: [
      `We map your counter to the right mix from ${phrase.marketingBrands} labels.`,
      "We agree terms in writing.",
      // The canonical statement of the visit cycle. It used to be said on the
      // marketing hero, the section lead, a strength, a pull-quote, a home
      // pillar and a funnel card as well, which is five times too many.
      `You go on our scheduled visit cycle, once every ${phrase.visitCycle}.`,
      "Most new retailers receive their first indent within weeks.",
    ],
  },
  {
    page: "marketing",
    question: "We're a brand looking for a Northeast distributor. Why Arihant?",
    answer: "Four reasons, all of them checkable:",
    bullets: [
      `${facts.marketing.years} years of trading relationships with ${phrase.marketingRetailers} retailers.`,
      "National labels we have built into category leaders in this region.",
      "Shop-in-shop (SIS) counters already running in the region's modern trade.",
      `Named Best Distributor of India by CMAI in ${facts.marketing.awardYear}.`,
    ],
  },
  {
    page: "marketing",
    question: "How do you handle modern trade and shop-in-shops?",
    answer:
      "We run the SIS counter end to end, and the brand does not fund the fixtures or the floor staff:",
    bullets: [
      "No fixture investment on your side.",
      "Staff optional: a promoter is not required to open.",
      "Replenishment driven by sell-through, not by guesswork.",
      "Planogram audited on every visit, with counter-level reporting back to you.",
    ],
  },

  /* The Apparels page has always rendered a "Straight answers" section; until
     now no faq carried page: "apparels", so the section never appeared. */
  {
    page: "apparels",
    question: "What do you carry that Arihant Marketing does not?",
    answer: `Arihant Apparels holds a separate ${phrase.apparelsBrands}-label portfolio, weighted differently:`,
    bullets: [
      "The Northeast's leading ladies' ethnic labels.",
      "Westernwear, kidswear and footwear alongside them.",
      "A separate warehouse, a separate buying team, one group behind both.",
    ],
  },
  {
    page: "apparels",
    question: "I already buy from Arihant Marketing. Can I buy from Apparels too?",
    answer:
      "Yes, and most growing counters do. The two houses carry different labels and bill separately, so nothing about your existing terms changes.",
  },
  {
    page: "apparels",
    question: "Do you sell at the regional garment fairs?",
    answer: `Yes. Our stand has drawn the highest footfall at the region's last ${facts.apparels.exhibitions} exhibitions. If you are visiting a fair, book a slot with us in advance and we will hold the new season's range aside for you.`,
  },
  {
    page: "apparels",
    question: "We are a brand. What does the first season look like?",
    answer: "Three stages, over roughly two seasons:",
    bullets: [
      "We seed the top multi-brand counters in Guwahati and two or three anchor cities.",
      "Exhibition orders widen distribution at the next regional fair.",
      "Where the sell-through justifies it, we add shop-in-shop (SIS) counters.",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Testimonials — composite trade voices, attributed by role + town.    */
/* Policy (PRODUCT.md): no invented named individuals, no stock faces.  */
/* Each quote reflects documented service claims; swap in named,        */
/* consented quotes via the Studio as they are collected.               */
/* ------------------------------------------------------------------ */

/** The one voice the home page prints. /recognition renders every OTHER entry,
 *  so a reader never meets the same quote twice (change brief, HP12). */
export const featuredTestimonialIndex = 5;

export const testimonials: Testimonial[] = [
  {
    quote:
      "The van reaches every twenty days whether I ring or not. My racks have never been the reason I lost a sale.",
    name: "Menswear MBO owner",
    role: "Dibrugarh · Retail partner since 2016",
    published: true,
  },
  {
    quote:
      "They took our label from zero counters to across Assam without us hiring a single field rep.",
    name: "Area sales head, national menswear brand",
    role: "Shop-in-shop partner since 2019",
    published: true,
  },
  {
    quote: "Season stock arrives sized for my town, not for a metro. That is the whole difference.",
    name: "Family outfitter",
    role: "Jorhat · Retail partner since 2011",
    published: true,
  },
  {
    quote: "The first distributor who showed me sell-through numbers before asking for an order.",
    name: "Multi-brand retailer",
    role: "Silchar · Retail partner since 2018",
    published: true,
  },
  {
    quote:
      "The store opened on schedule, staffed and stocked. We flew in for the ribbon and flew back out.",
    name: "Franchise manager, national brand",
    role: "Store partner since 2024",
    published: true,
  },
  {
    quote: "I own the store. They run it more tightly than I would have.",
    name: "First-time store investor",
    role: "Guwahati · Franchise owner since 2023",
    published: true,
  },
  {
    quote:
      "Billing is clean and claims settle on the date they said. Nobody re-negotiates after the fact.",
    name: "Womenswear retailer",
    role: "Shillong · Retail partner since 2014",
    published: true,
  },
  {
    quote: "Two decades of cartons and I have never once counted one twice.",
    name: "Hosiery and innerwear wholesaler",
    role: "Agartala · Trade partner since 2005",
    published: true,
  },
  {
    quote: "At the fairs, theirs is the stand you queue for. The trade votes with its feet.",
    name: "Garment trade association member",
    role: "Guwahati",
    published: true,
  },
  {
    quote: "When a brand asks how to enter the Northeast, I give them one phone number.",
    name: "Regional sales veteran",
    role: "Imphal · 25 years in the trade",
    published: true,
  },
  /* R9: a longer pool, so the vertical columns on /recognition travel further
     before a reader sees the same quote come round again. Same policy as
     above: composite trade voices attributed by role and town, each reflecting
     a documented service claim, until named consented quotes replace them. */
  {
    quote: "I ring on a Tuesday and the stock is on my rack by the weekend. That is the whole relationship.",
    name: "Menswear retailer",
    role: "Tinsukia · Retail partner since 2013",
    published: true,
  },
  {
    quote: "They told me not to take a label once. That is when I started trusting the rest of the list.",
    name: "Family store owner",
    role: "Tezpur · Retail partner since 2017",
    published: true,
  },
  {
    quote: "Festival stock lands before the festival. It sounds obvious until you have bought from someone else.",
    name: "Multi-brand retailer",
    role: "Nagaon · Retail partner since 2019",
    published: true,
  },
  {
    quote: "Ethnic depth in my town is not a metro assortment cut down. They size it for who actually walks in.",
    name: "Ladieswear retailer",
    role: "Dimapur · Retail partner since 2015",
    published: true,
  },
  {
    quote: "Our counters went live across four states in one season without us opening a regional office.",
    name: "National brand, east zone",
    role: "Distribution partner since 2021",
    published: true,
  },
  {
    quote: "I get a number for every option, every month. Nobody else in the region reports like that.",
    name: "Brand merchandising head",
    role: "Shop-in-shop partner since 2022",
    published: true,
  },
];

/* ------------------------------------------------------------------ */
/* Blog posts ("Trade Notes"). Eight seeded notes; `image` is filled    */
/* from the stock manifest in a later phase.                            */
/* ------------------------------------------------------------------ */

export const posts: Post[] = [
  {
    title: "Five checks before you sign with a garment distributor in Northeast India",
    slug: "choose-garment-distributor-northeast-india",
    image: "/images/stock/blog/blog-1.jpg",
    excerpt:
      "Your margin is decided before stock ever reaches the rack. Visit cadence, fill rate, claim discipline: the checklist we would use on your side of the counter.",
    date: "2026-06-10",
    audience: "Retailers",
    readMinutes: 4,
    metaDescription:
      "A practical checklist for NE India retailers choosing a readymade garments distributor: visit cadence, fill rates, brand mix, claim settlement and credit discipline.",
    body: [
      {
        type: "p",
        text: "A retailer's profit in the garment trade is mostly decided upstream: which distributor you buy from, how often they visit, how fast they fill, and how cleanly they settle claims. Storefront and salesmanship matter, but a weak supply line quietly eats both.",
      },
      { type: "h2", text: "1. Start with the visit cadence" },
      {
        type: "p",
        text: "Ask any distributor one question first: how often will your representative physically stand in my store? If the answer is vague, expect stockouts in season and silence off season. A disciplined house commits to a number and keeps it. Our own standard is once every 20 days for every retailer, without exception, because reorders, grievances and market feedback only move when someone is in the room.",
      },
      { type: "h2", text: "2. Check the brand mix against your counter, not their catalogue" },
      {
        type: "p",
        text: "A long brand list is impressive; the right brand list is profitable. A menswear counter in Silchar and a family store in Itanagar need different depth in shirts, denim, ethnic and kidswear. A good distributor maps their portfolio to your square footage and your customer, and is willing to tell you what not to stock.",
      },
      { type: "h2", text: "3. The unglamorous numbers that decide your year" },
      {
        type: "ul",
        items: [
          "Fill rate: what percentage of your indent actually arrives, and how fast? Anything consistently below the high nineties starves your best sellers.",
          "Claim settlement: defectives and shortages are a fact of the trade. What matters is the timeline and paperwork discipline for making you whole.",
          "Credit terms and their enforcement: generous terms that collapse into ad-hoc pressure are worse than tight terms applied predictably.",
          "Season readiness: does festival stock reach you before the footfall, or with it?",
        ],
      },
      { type: "h2", text: "4. Look for institutional weight" },
      {
        type: "p",
        text: "Industry recognition and association membership are references you can verify. A distributor recognised nationally (CMAI's Best Distributor of India is the benchmark award in our trade) or involved in founding regional trade bodies like NEGTA has a reputation it cannot afford to spend cheaply on any single retailer relationship.",
      },
      { type: "h2", text: "5. Visit the warehouse" },
      {
        type: "p",
        text: "One afternoon in a distributor's warehouse tells you more than any brochure: how stock is binned, how indents are picked, whether dispatch is a system or a scramble. A serious house will welcome the visit. If they hesitate, you have your answer.",
      },
      {
        type: "p",
        text: "Choosing well once saves you renegotiating every season. If you retail anywhere in Northeast India, we are happy to have that first conversation, and to put you on a 20-day cycle that does not slip.",
      },
    ],
  },
  {
    title: "The entry playbook for apparel brands coming into Northeast India",
    slug: "apparel-brand-distribution-northeast-india",
    image: "/images/stock/blog/blog-2.jpg",
    excerpt:
      "Seven states, distinct tastes, and retail built on decades-old relationships. How to sequence a market entry so the first two seasons pay for the third.",
    date: "2026-05-18",
    audience: "Brands",
    readMinutes: 3,
    metaDescription:
      "How national apparel brands should plan distribution in Northeast India: market structure, retailer relationships, exhibitions, SIS execution and choosing the right regional partner.",
    body: [
      {
        type: "p",
        text: "For most national apparel brands, Northeast India is the last unchecked box on the map: seven states, growing disposable income, and consumers who follow national fashion trends faster than the trade gives them credit for. It is also a market where cold entry fails. Retail here runs on relationships built over decades, not on trade schemes.",
      },
      { type: "h2", text: "Understand the market's shape before the math" },
      {
        type: "p",
        text: "The region's apparel retail is dominated by strong independent multi-brand outlets (MBOs) in cities like Guwahati, Dibrugarh, Jorhat, Silchar, Shillong, Agartala and Imphal. Modern trade is growing through malls, shop-in-shops and exclusive brand outlets, but the MBO counter remains where volume lives. A brand plan that only targets modern trade misses most of the market.",
      },
      { type: "h2", text: "The distributor is your market entry, not just your logistics" },
      {
        type: "ul",
        items: [
          "Reach: how many retailers does the distributor actively service, and on what visit cycle? Passive coverage is not coverage.",
          "Category authority: has the distributor made brands category leaders here before, or only carried them?",
          "Warehouse and working capital: regional depth needs regional stockholding, not consignments from Kolkata.",
          "Exhibition presence: regional garment fairs are where the trade actually orders. A partner who commands footfall there shortens your first two seasons dramatically.",
          "Modern-trade execution: if your plan includes SIS counters, ask to see the team and the data systems that will run them.",
        ],
      },
      { type: "h2", text: "Sequence the entry" },
      {
        type: "p",
        text: "The pattern that works: seed the top MBO counters in Guwahati and two or three anchor cities in season one; use exhibition orders to widen distribution in season two; add SIS and EBO formats only once sell-through data justifies them. Brands that invert this order pay for a flagship while the market shops elsewhere.",
      },
      { type: "h2", text: "What to demand from your regional partner" },
      {
        type: "p",
        text: `Scheduled retailer visits (ours run every ${phrase.visitCycle}), transparent secondary-sales feedback, disciplined claims handling, and shop-in-shop (SIS) counters that need no fixture or staffing investment from you. That combination turns a season's listing into a durable regional franchise. It is what we have built at Arihant over three decades, ${phrase.marketingRetailers} retailers and ${phrase.marketingBrands} brand partnerships.`,
      },
    ],
  },
  {
    title: "The four places first-time apparel store owners lose money",
    slug: "managed-franchise-vs-independent-apparel-retail",
    image: "/images/stock/blog/blog-4.jpg",
    excerpt:
      "Deadstock, people, footfall, buying. Most first stores underperform in the same four places. Who should carry each risk, and what to ask before you invest.",
    date: "2026-04-22",
    audience: "Investors",
    readMinutes: 3,
    metaDescription:
      "Comparing managed retail franchise models with independent store ownership in India's apparel market: deadstock risk, staffing, footfall generation and where returns actually come from.",
    body: [
      {
        type: "p",
        text: "India's apparel market keeps growing, and retail remains one of the few businesses where a physical asset in the right catchment produces cash from month one. Yet most first-time store owners underperform. Demand is rarely the problem; the problem is four operating risks landing on someone who has never carried them before.",
      },
      { type: "h2", text: "The four places new store owners lose money" },
      {
        type: "ul",
        items: [
          "Deadstock: unsold inventory is the silent killer of apparel retail. Buying wrong for two seasons can consume a year of margin.",
          "People: hiring, training and retaining floor staff is a full-time craft; attrition without a bench turns every resignation into lost sales.",
          "Footfall: a store without a marketing engine relies on walk-bys. Social and influencer campaigns need budget, calendars and someone who has run them before.",
          "Buying and merchandising: brand relationships, indent timing and planogram discipline decide sell-through long before discounts do.",
        ],
      },
      { type: "h2", text: "What a managed model actually changes" },
      {
        type: "p",
        text: "In a managed arrangement the operator, not the owner, carries the operating craft: they hire and manage staff, set targets, run marketing and CRM, merchandise the floor and rotate stock. Structured well, the owner's exposure to deadstock is designed out of the model entirely.",
      },
      {
        type: "p",
        text: "The owner brings capital and the property relationship; the operator brings the trade craft. Returns depend on execution quality, which is why the operator's track record, real stores with a real ROIC history, is the entire investment case.",
      },
      { type: "h2", text: "Questions to ask any managed-retail operator" },
      {
        type: "ul",
        items: [
          "Show me the existing stores. How long have they traded, and how have they performed?",
          "Who carries deadstock risk, in writing?",
          "What exactly is handled by your team, and what remains mine?",
          "How is performance reported to me, and how often?",
          "What happens if the store underperforms: what levers exist, and who pulls them?",
        ],
      },
      {
        type: "p",
        text: `An operator with real answers will welcome the interrogation. At Arihant Retail we run this model across Northeast India on the back of a ${facts.group.years}-year distribution legacy, and every economic detail goes on paper during the proposal stage, before a rupee moves.`,
      },
    ],
  },
  {
    title: "What a shop-in-shop programme actually involves",
    slug: "what-a-shop-in-shop-programme-involves",
    image: "/images/stock/blog/blog-5.jpg",
    excerpt:
      "An SIS counter looks simple from the outside: a branded bay inside someone else's store. The work behind it decides whether it earns its floor space.",
    date: "2025-02-10",
    audience: "Brands",
    readMinutes: 4,
    metaDescription:
      "What a shop-in-shop (SIS) programme involves for an apparel brand in modern trade: fixtures, planograms, replenishment, staffing and the data behind it.",
    body: [
      {
        type: "p",
        text: "A shop-in-shop, or SIS, is a branded selling space inside a larger store: your fixtures, your planogram, your assortment, standing inside a department store or a large multi-brand outlet. For a national brand entering modern trade in a new region, it is usually the first format on the table. It is also the format most often underestimated.",
      },
      {
        type: "p",
        text: "The bay itself is the visible tenth of the work. What decides an SIS counter's fate is the unglamorous machinery behind it: who fills it, who staffs it, who reads its numbers, and who acts when the numbers turn.",
      },
      { type: "h2", text: "The fixture and planogram work" },
      {
        type: "p",
        text: "An SIS begins with a fit-out: branded fixtures, signage and lighting built to the host store's specifications. Then comes the planogram, the shelf-by-shelf map of what sits where. A planogram is not decoration. It encodes decisions about depth, adjacency and sightlines that directly move sell-through.",
      },
      {
        type: "p",
        text: "Someone has to own that map through the season: refreshing it when new options land, correcting it when floor staff improvise, rebuilding it at every end-of-season sale. That is standing work, not launch work. A bay that launched perfectly in March and was never re-planogrammed is indistinguishable from neglect by August.",
      },
      { type: "h2", text: "Replenishment is the real programme" },
      {
        type: "p",
        text: "An SIS bay holds far less stock than a warehouse aisle. It sells out of sizes fast, and a bay with broken size sets stops earning while still paying for its space. The core discipline of any SIS programme is replenishment: reading secondary sales, converting them into fill orders, and getting cartons to the floor before gaps appear.",
      },
      {
        type: "ul",
        items: [
          "Secondary-sales reads: how often is sell-through data pulled, and by whom?",
          "Fill cycles: how many days from a size break to the replacement carton on the shelf?",
          "Stock cover norms: how much depth sits at the bay, and how much at the regional warehouse?",
          "Returns and claims: who processes damages and shop-soiled stock, and on what timeline?",
        ],
      },
      { type: "h2", text: "People on the floor" },
      {
        type: "p",
        text: "Most SIS arrangements involve a brand-funded promoter or shared floor staff. Hiring, training and supervising them across scattered host stores is a genuine operating burden. It is also where regional partners earn their keep: a distributor with a dedicated SIS team already has supervisors on the road and a bench that a brand office in Mumbai or Bengaluru does not.",
      },
      {
        type: "p",
        text: "Agree the supervision structure before launch, not after the first quiet month. Every bay needs a named supervisor, a visit rhythm, and a replacement process for promoter attrition that does not leave the counter unmanned through a festival week.",
      },
      { type: "h2", text: "Costs, in plain terms" },
      {
        type: "p",
        text: "Every SIS programme carries four cost lines: fixtures, staffing, stock carrying and markdowns. Who bears each is a matter of negotiation with the host and the regional partner, and the split varies chain to chain. What should not vary is clarity: each line owned by someone, in writing, before the first carton ships.",
      },
      { type: "h2", text: "The data spine" },
      {
        type: "p",
        text: "Modern trade runs on data, and host stores expect their SIS partners to keep up. Our own SIS counters run plug and play, on data rather than memory, because replenishment guesses that were tolerable in general trade become visible failures in a department store's weekly review.",
      },
      {
        type: "p",
        text: "Ask any prospective SIS operator to show you the reports a brand actually receives: sell-through by option, size-set health, stock ageing, fill rate against orders. If the answer is a photograph of a sales register, the programme is not a programme.",
      },
      { type: "h2", text: "Where SIS fits in an entry sequence" },
      {
        type: "p",
        text: "SIS rarely comes first. The sequence that works in this region: build MBO distribution for a season or two, prove sell-through, then add SIS bays where the data supports them, with EBOs last. Host stores negotiate harder with brands that have no regional proof, and a bay without regional logistics behind it becomes an expensive billboard.",
      },
      { type: "h2", text: "What a brand should settle before signing" },
      {
        type: "ul",
        items: [
          "Who pays for fixtures, and who owns them at exit.",
          "The replenishment cycle and the stock-cover norm, in writing.",
          "Staffing: who hires, who trains, who supervises, who replaces.",
          "Data: which reports, at what frequency, from which system.",
          "Exit terms: notice period, stock withdrawal and fixture removal.",
        ],
      },
      {
        type: "p",
        text: "A good SIS programme is quiet. Fixtures stay full, size sets stay whole, reviews hold no surprises. That quiet is manufactured by a team doing the standing work every week. If you are weighing a Northeast entry through modern trade, we are happy to walk you through how we run it.",
      },
    ],
  },
  {
    title: "MBO or EBO: which store format fits your property?",
    slug: "mbo-vs-ebo-store-format-northeast-india",
    image: "/images/stock/blog/blog-3.jpg",
    excerpt:
      "Landlords and first-time investors in Northeast India usually face this choice first. The honest answer depends on your catchment, not your taste in brands.",
    date: "2025-04-15",
    audience: "Investors",
    readMinutes: 4,
    metaDescription:
      "MBO vs EBO for Northeast India landlords: how catchment, frontage and brand economics decide which apparel store format earns more from a property.",
    body: [
      {
        type: "p",
        text: "Anyone with a good commercial property in a Northeast town eventually hears both pitches. Open a multi-brand outlet (MBO) and serve the whole family. Or sign an exclusive brand outlet (EBO) and put one national name over the door. Both formats work. They work in different places, for different reasons.",
      },
      {
        type: "p",
        text: "We operate on both sides of this question. The group's distribution arms supply MBO counters across seven states, and Arihant Retail runs multi-brand stores of its own. What follows is the framing we use internally.",
      },
      { type: "h2", text: "What each format actually is" },
      {
        type: "ul",
        items: [
          "MBO: a multi-brand outlet. One store, many labels, with the assortment controlled by the operator. This is the region's dominant format; most of the Northeast's apparel volume still moves through strong independent MBO counters.",
          "EBO: an exclusive brand outlet. One brand's full range, trading under that brand's identity, usually under a franchise or operating agreement with defined norms for fit-out, assortment and pricing.",
        ],
      },
      { type: "h2", text: "The catchment decides, not the brochure" },
      {
        type: "p",
        text: "An EBO lives or dies on brand pull. It needs a catchment where that one name alone walks people through the door week after week: a high street with destination footfall, or a mall with anchor traffic. In most district towns, that bar is high.",
      },
      {
        type: "p",
        text: "An MBO spreads the same footfall across menswear, womenswear, kidswear and denim. It captures the family shopper, the festival basket and the school-uniform trip. Where footfall is broad but no single brand dominates, multi-brand wins.",
      },
      { type: "h2", text: "What the Northeast specifically rewards" },
      {
        type: "p",
        text: "This region adds its own weighting. Outside Guwahati and a handful of high streets, destination brand pull thins out quickly, while family MBO counters hold loyalty built over decades. Modern trade is arriving, but arriving is not arrived: most volume today still walks into multi-brand floors, and a format decision should follow the volume.",
      },
      { type: "h2", text: "The economics differ in kind" },
      {
        type: "p",
        text: "None of these differences make one format cheaper across the board. They change where the risk sits and who is equipped to manage it.",
      },
      {
        type: "ul",
        items: [
          "Assortment risk: an MBO operator can rebalance labels every season; an EBO is committed to one brand's range and its seasons.",
          "Buying terms: EBOs typically run on the brand's commercial norms; MBO buying is negotiated label by label.",
          "Fit-out: EBO fit-outs follow the brand manual and are periodically refreshed to it; MBO fit-outs are the operator's call.",
          "Identity: an EBO borrows a national name; an MBO builds a local one that can outlast any single label.",
        ],
      },
      { type: "h2", text: "Frontage, floor plate and two practical tests" },
      {
        type: "p",
        text: "Formats have physical appetites. EBOs generally want compact, high-visibility spaces on the best stretch of the street. A good MBO needs a larger floor plate to hold family-wide depth, and can trade well half a block off the prime corner, because assortment rather than signage is the draw.",
      },
      {
        type: "p",
        text: "Two tests we use. First, stand outside the property on a weekend evening and watch who walks past: single-brand destination shoppers are rare outside the top hubs. Second, list the five best-trading stores within a kilometre; their formats tell you what the catchment already rewards.",
      },
      {
        type: "p",
        text: "A third test costs one phone call. Talk to the brands themselves: a brand that believes in your catchment will discuss an EBO seriously, and polite vagueness is also an answer.",
      },
      { type: "h2", text: "The third option: a managed store" },
      {
        type: "p",
        text: "Format is only half the decision. The other half is who runs the store. Arihant Retail operates multi-brand stores on a managed model: our team handles hiring, merchandising, marketing and CRM, and deadstock stays off the owner's books.",
      },
      {
        type: "p",
        text: "The managed model exists in both formats for the same reason. The property owner's edge is the location; the operator's edge is the daily craft of staffing, buying and marketing. Splitting the two roles cleanly is what keeps a first store from becoming a second education.",
      },
      {
        type: "p",
        text: "That changes the question from which format you can operate to which format suits the property, which is the right question. If you hold a property anywhere in the Northeast, send us the details and we will give you a straight read on both.",
      },
    ],
  },
  {
    title: "How a 20-day visit cycle protects your season",
    slug: "20-day-visit-cycle-protects-your-season",
    image: "/images/stock/blog/blog-6.jpg",
    excerpt:
      "Stock rotation, claims and reorders all depend on one thing: somebody from your distributor standing in your store on a fixed date. The number matters.",
    date: "2025-07-08",
    audience: "Retailers",
    readMinutes: 4,
    metaDescription:
      "Why a fixed 20-day distributor visit cycle protects a retailer's season: faster reorders, cleaner claims, honest stock rotation and feedback that arrives in time.",
    body: [
      {
        type: "p",
        text: "Every distributor promises service. The difference between a promise and a system is a number. Ours is 20: every retailer we serve is visited at least once every 20 days, in person, season after season. The rest of this note unpacks why that number, kept, is worth more than any trade scheme.",
      },
      { type: "h2", text: "What a visit actually looks like" },
      {
        type: "p",
        text: "The rhythm is simple. Our representative walks the floor with you or your manager: racks first, then the stockroom, then the ledger. Gaps get written into an indent on the spot. Defectives come off the shelf, get documented and travel back with the rep. Slow movers get flagged with a suggestion: rotate, reprice or return, depending on the arrangement.",
      },
      {
        type: "p",
        text: "None of this is complicated. It is simply work that does not happen by phone, and it compounds: twenty-odd visits a year, every year, is how a distributor comes to know a counter better than its own ledger does.",
      },
      { type: "h2", text: "A season is short. Reorders cannot wait." },
      {
        type: "p",
        text: "An apparel season in the Northeast is a narrow window: festival spikes, a compressed winter, wedding weeks. A best-seller that breaks sizes in week three either gets refilled inside the window or the sale is gone for the year. Reorders move fastest when your distributor's representative sees the gap on your rack and writes the indent standing next to it.",
      },
      {
        type: "p",
        text: "Phone-and-hope reordering fails quietly. The retailer waits for the rep, the rep waits for a route plan, and by the time the carton lands the moment has passed. A fixed cycle removes the waiting: you know the date, and you plan your reorder around it.",
      },
      {
        type: "p",
        text: "The 20-day interval is deliberate. It is short enough to catch a size break inside the same selling window, and long enough that each visit carries real news. Retailers on a fixed cycle also buy better in the first place, because the safety net for correcting a miss is known in advance.",
      },
      { type: "h2", text: "Claims settle when someone sees the stock" },
      {
        type: "p",
        text: "Defectives, shortages and shop-soiled pieces are facts of the trade. What varies between distributors is how long claims take to settle, and disputed claims are usually disputed because nobody inspected anything at the right time. A representative in your store every 20 days inspects, documents and carries the claim back the same day.",
      },
      {
        type: "p",
        text: "Cleanly settled claims are working capital. Every week a claim sits unresolved is a week your money is parked in someone else's problem. Ask any retailer what breaks trust with a distributor fastest: it is rarely price, and it is usually a claim that needed four phone calls and still sat.",
      },
      { type: "h2", text: "Stock rotation needs an outside eye" },
      {
        type: "p",
        text: "Retailers live with their own racks and stop seeing them. A rep who walks fifty other counters sees yours differently: which options are ageing, which colours never left the shelf, what a similar store two towns over cleared last month. On a fixed cycle that outside eye arrives before a dead corner becomes a dead season. The same fix costs little in week six and a season's margin in week sixteen.",
      },
      { type: "h2", text: "Feedback has to travel both ways" },
      {
        type: "p",
        text: `The visit also carries information upstream. Sizes that run short, price points buyers balk at, a competitor's scheme moving stock: your distributor can only push that to brands if someone collected it recently. Market feedback gathered across ${phrase.marketingRetailers} retailers is how a region gets assortments cut for it, instead of leftovers from mainland plans. It is also how exhibition assortments get sharper every year: order patterns from the fairs meet visit notes from the floor.`,
      },
      { type: "h2", text: "What to do with this as a retailer" },
      {
        type: "ul",
        items: [
          "Ask your current distributor for their visit cadence as a number, in writing.",
          "Track the actual dates for one season. A cycle that slips in October is not a cycle.",
          "Use the visit: keep a running list of claims, gaps and slow movers ready for the rep.",
          "Judge the distributor by what happens between visits: dispatch speed and claim paperwork.",
        ],
      },
      {
        type: "p",
        text: "A supply line is a habit, and good ones are built on dates that hold. We have kept the 20-day rule for years because it is the cheapest insurance a season can have, for us as much as for the retailer. If your counter is anywhere in Northeast India and your current supply line runs on whenever-needed, talk to us.",
      },
    ],
  },
  {
    title: "What to ask a regional distributor before you sign",
    slug: "what-to-ask-a-regional-distributor",
    image: "/images/stock/blog/blog-7.jpg",
    excerpt:
      "Warehouse, coverage, claims discipline, market feedback. The questions that separate a distribution partner from a freight forwarder with a signboard.",
    date: "2025-10-21",
    audience: "Brands",
    readMinutes: 4,
    metaDescription:
      "The questions apparel brands should ask a regional distributor before signing: warehouse depth, retailer coverage, claims discipline and market feedback.",
    body: [
      {
        type: "p",
        text: "A distribution agreement is easy to sign and expensive to unwind. By the time weak coverage or sloppy claims show up in your secondary numbers, a season is gone and your brand's first impression in the region has been spent. The questions below are the ones we would ask in your position. We answer all of them ourselves, on paper, before any brand signs with us.",
      },
      {
        type: "p",
        text: "The list is short on purpose. A distributor who answers these cleanly will answer the next eighty. Bring the answers back in writing: anything a distributor will only say across a table is something they do not expect to be held to.",
      },
      { type: "h2", text: "Coverage: who actually gets visited?" },
      {
        type: "p",
        text: "Retailer counts are the easiest numbers to inflate. An account billed once a year is not coverage. Ask for the split between billed accounts and visited accounts, and how the house verifies its own field discipline.",
      },
      {
        type: "ul",
        items: [
          `How many retailers are on an active, scheduled visit cycle, and what is the cycle? (Ours: ${phrase.marketingRetailers} retailers, each visited at least every ${phrase.visitCycle}.)`,
          "Which towns beyond the state capital are serviced directly, and how often?",
          "How many brands does the house carry, and where would yours rank for attention?",
        ],
      },
      { type: "h2", text: "Warehouse: where will your stock physically sit?" },
      {
        type: "p",
        text: "Regional depth needs regional stockholding. Ask to walk the warehouse before you sign; the binning, picking and dispatch discipline you see there is the service your retailers will get.",
      },
      {
        type: "ul",
        items: [
          `How many square feet, and how is a brand's stock binned and secured? (Ours: ${phrase.marketingWarehouse} with Arihant Marketing and ${phrase.apparelsWarehouse} with Arihant Apparels, both in Guwahati.)`,
          "What is the order-to-dispatch timeline on a standard indent?",
        ],
      },
      {
        type: "p",
        text: "Watch for stock hygiene while you are there. Season-old cartons stacked against live stock, or brand inventories bleeding into each other, tell you how your own range will be treated in month eight. A dispatch promise means nothing without the racking and manpower behind it.",
      },
      { type: "h2", text: "Claims: the discipline that predicts everything else" },
      {
        type: "p",
        text: "Claims handling is where distributors reveal themselves. A house that documents and settles claims on schedule almost always runs everything else on schedule too.",
      },
      {
        type: "ul",
        items: [
          "What is the standard timeline from claim raised to claim settled?",
          "Who inspects defectives, and how is the paperwork maintained?",
        ],
      },
      {
        type: "p",
        text: "Ask one more thing: how retailer claims flow back to the brand. A house that nets everything into a year-end argument is storing up a dispute. A house that documents as it goes is protecting both sides.",
      },
      { type: "h2", text: "Market feedback: will you learn anything?" },
      {
        type: "p",
        text: "A distributor stands between you and the shopper, and the good ones shorten that distance with structured feedback: size-set performance, price-point resistance, competitor movement, exhibition order patterns. Ask what reporting you will receive, at what frequency, and from which system. Then ask to see a sample from a brand they already carry.",
      },
      {
        type: "p",
        text: "Reporting does not need to be elaborate. It needs to be regular, honest and specific enough to act on before the next buying meeting. If the region is invisible in your dashboards today, this is the question that fixes it.",
      },
      { type: "h2", text: "Attention: the question nobody asks" },
      {
        type: "p",
        text: "Every distributor has a best brand and a bottom shelf. Ask directly how many field staff will carry your range, which exhibitions your brand will be shown at, and what the house expects from you in return: launch support, scheme discipline, timely dispatches from your end. These relationships fail as often from a brand's neglect as from a distributor's.",
      },
      { type: "h2", text: "Weight you can verify" },
      {
        type: "p",
        text: "Awards, association roles and longevity can all be checked in this trade. CMAI named Arihant Marketing Best Distributor of India in 2015; the house is a founder member of NEGTA and has traded since the 1990s. Whatever region you are entering, look for the equivalent: a distributor whose reputation is worth more than any single brand's business.",
      },
      {
        type: "p",
        text: "If Northeast India is on your map, put these questions to us first. We would rather earn the business in the first meeting than lose it in the second season.",
      },
    ],
  },
  {
    title: "What ‘we run it, you own it’ actually covers",
    slug: "what-we-run-it-you-own-it-covers",
    image: "/images/stock/blog/blog-8.jpg",
    excerpt:
      "Managed retail sounds like a slogan until you list who does what. A plain-language walk through the split between owner and operator, task by task.",
    date: "2026-01-27",
    audience: "Investors",
    readMinutes: 4,
    metaDescription:
      "What a managed apparel store covers: hiring, merchandising, marketing, CRM and deadstock, split task by task between owner and operator. Economics stay on paper.",
    body: [
      {
        type: "p",
        text: "Arihant Retail's partnership model is usually summarised in six words: we run it, you own it. Six words invite scepticism, and they should. This note lists what sits on each side of that sentence, task by task, so you can interrogate the model properly.",
      },
      { type: "h2", text: "What stays with you, the owner" },
      {
        type: "ul",
        items: [
          "The store itself: the property or lease, and the capital that builds the asset.",
          "The returns: the store trades on your books, as your business.",
          "Oversight: a clear performance review rhythm, with the numbers in front of you.",
          "The decision to enter, and the terms of exit, agreed in writing at the start.",
        ],
      },
      {
        type: "p",
        text: "That is the full list. It is short by design. Most of our partners keep their existing occupation.",
      },
      { type: "h2", text: "What our team carries" },
      { type: "h3", text: "People" },
      {
        type: "p",
        text: "Hiring, training, rostering and managing the floor team is ours, including replacements when someone leaves. Staffing is the single most underestimated burden in first-time retail, and it never stops.",
      },
      { type: "h3", text: "Merchandising and stock" },
      {
        type: "p",
        text: `We decide the assortment, set the planogram, rotate stock through the season and run the end-of-season process. The buying relationships behind this come from the group's distribution businesses: ${phrase.groupLabels} national labels and ${facts.group.years} years in the trade.`,
      },
      { type: "h3", text: "Deadstock" },
      {
        type: "p",
        text: "Unsold inventory is the risk that quietly sinks independent stores. In our model it is engineered out of the owner's books entirely: a zero-deadstock arrangement, in writing. A season's mistakes will not be found sitting in your accounts.",
      },
      { type: "h3", text: "Marketing and CRM" },
      {
        type: "p",
        text: "Footfall generation is our responsibility. We run calibrated influencer and social media campaigns for every store and maintain the customer CRM centrally. The owner is never asked to become a marketer.",
      },
      { type: "h3", text: "Targets and review" },
      {
        type: "p",
        text: "Our team sets targets, tracks them and reports to you on a fixed rhythm. You review performance; you do not chase it.",
      },
      { type: "h2", text: "What we deliberately do not promise here" },
      {
        type: "p",
        text: "You will notice no return percentages on this page or anywhere on this site. Store economics depend on the city, the property and the format, so quoting a universal figure would be salesmanship rather than analysis. The full cost sheet and P&L structure go on paper in your proposal discussion, specific to your site.",
      },
      {
        type: "p",
        text: `What we say publicly is what we can stand behind: the model is tried and tested, ${facts.retail.storesOpen} stores already trade on it under both ownership structures, and it is backed by a strong, proven ROIC record and ${facts.group.years} years of goodwill in this trade.`,
      },
      { type: "h2", text: "How to test the model" },
      {
        type: "ul",
        items: [
          "Visit the stores. They are on the street, trading; judge the floors, not the deck.",
          "Ask who carries each of the tasks above, and get the answer in writing.",
          "Ask what happens when a store underperforms: which levers exist and who pulls them.",
          "Speak to us last, after you have compared the answer sheet with anyone else's.",
        ],
      },
      {
        type: "p",
        text: "The model exists because good properties and good operators are rarely the same people. If you hold the property, we hold the rest. Request the details and we will call you within one working day.",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Timeline (about page)                                                */
/* ------------------------------------------------------------------ */

export const timeline = [
  {
    year: "1990s",
    title: "The first counter",
    text: "The Sancheti family enters Guwahati's garment trade and begins building the retailer relationships that still anchor the group.",
  },
  {
    year: "1999",
    title: "Arihant Marketing registered",
    text: "The distribution house is formalised at Arihant Tower, Jyotikuchi, and grows into the pioneer RMG distributor of the Northeast.",
  },
  {
    year: "2013",
    title: "Arihant Apparels founded",
    text: "Ajay Sancheti opens the group's second distribution house, which goes on to build several national labels into category leaders here.",
  },
  {
    year: "2015",
    title: "Best Distributor of India",
    text: "The Clothing Manufacturers Association of India (CMAI) names Arihant the country's best distributor.",
  },
  {
    year: "2023",
    title: "Arihant Retail launches",
    text: "Shreyansh Sancheti takes the group into modern retail with the first multi-brand stores of its own.",
  },
  {
    // The timeline caps on the present, not on a projection. The store target
    // it used to end on came out at the client's request.
    year: "Today",
    title: "Four stores, two models",
    text: `${facts.retail.storesCompanyOwned} company-owned and ${facts.retail.storesFranchisee} franchisee-owned, every one of them run by the Arihant Retail team.`,
  },
];

/* ------------------------------------------------------------------ */
/* Awards & recognition (public record: CMAI 2015, NEGTA membership,    */
/* exhibition footfall — see PRODUCT.md fact base)                      */
/* ------------------------------------------------------------------ */

export const awards: Award[] = [
  {
    year: String(facts.marketing.awardYear),
    title: "Best Distributor of India",
    issuer: "Clothing Manufacturers Association of India (CMAI)",
    detail: "The national distributor award in Indian apparel.",
  },
  {
    year: "Founder",
    title: "NEGTA founder membership",
    issuer: "North Eastern Garment Traders Association",
    detail: "The house helped found the association that organises the Northeast's garment trade.",
  },
  {
    year: `${facts.apparels.exhibitions} fairs`,
    title: "Highest footfall in exhibitions",
    issuer: "Regional garment exhibitions",
    detail: "",
  },
];

/* ------------------------------------------------------------------ */
/* Team (real, client-supplied people). Currently Arihant Apparels.     */
/* ------------------------------------------------------------------ */

export const team: TeamMember[] = [
  { unit: "apparels", name: "Ajay Sancheti", title: "Founder" },
  { unit: "apparels", name: "Debojit Paul", title: "Head of Store Operations" },
  { unit: "apparels", name: "Kalyan", title: "Head of Accounts" },
  { unit: "apparels", name: "Arup", title: "Head of Warehousing" },
  { unit: "apparels", name: "Dhritiman", title: "SIS team, back-end lead", group: "SIS team" },
  { unit: "apparels", name: "Anubhav", title: "SIS team, front-end lead", group: "SIS team" },
];

/* ------------------------------------------------------------------ */
/* Leader portraits, keyed by the exact name used in business.leaders.  */
/* Empty until real photographs exist: drop the file at                 */
/* public/images/photos/leaders/<slug>.jpg and add its entry here, and  */
/* the about page swaps the monogram placeholder for the photograph     */
/* with no component change.                                            */
/* ------------------------------------------------------------------ */

export const leaderPortraits: Record<string, LeaderPortrait> = {};

/* ------------------------------------------------------------------ */
/* Recognition photos: real certificates and trophies (brand-partner    */
/* and trade-fair awards to Arihant Marketing). Captions stay factual.  */
/* ------------------------------------------------------------------ */

export const recognitionPhotos: RecognitionPhoto[] = [
  {
    src: "/images/photos/awards/award-tadpole-champion-2122.jpg",
    alt: "Tadpole 'Champion of the Year 2021-22' trophy engraved for Arihant Marketing, Guwahati",
    caption: "Tadpole: Champion of the Year 2021-22",
  },
  {
    src: "/images/photos/awards/award-indian-terrain-east-india.jpg",
    alt: "Indian Terrain Certificate of Excellence naming Arihant Marketing Best Channel Partner, East India",
    caption: "Indian Terrain: Best Channel Partner, East India",
  },
  {
    src: "/images/photos/awards/award-twills-2021.jpg",
    alt: "Twills Clothing Distributor Excellence Award 2021 honouring Arihant Marketing",
    caption: "Twills: Distributor Excellence Award 2021",
  },
  {
    src: "/images/photos/awards/award-indian-terrain-2023.jpg",
    alt: "Indian Terrain Valued Channel Partner trophy for Arihant Marketing, Distributors Meet 2023",
    caption: "Indian Terrain: Valued Channel Partner, 2023",
  },
  {
    src: "/images/photos/awards/award-distributor-of-the-year.jpg",
    alt: "Golden Distributor of the Year trophy presented to Arihant Marketing",
    caption: "Distributor of the Year trophy",
  },
  {
    src: "/images/photos/awards/award-octave-excellence-2024.jpg",
    alt: "Certificate of Excellence in distribution presented to Arihant Marketing, 2024",
    caption: "Certificate of Excellence in distribution, 2024",
  },
  {
    src: "/images/photos/awards/award-tadpole-assam.jpg",
    alt: "Tadpole Certificate of Appreciation naming Arihant Marketing authorised distributor for Assam",
    caption: "Tadpole: authorised distributor for Assam",
  },
  {
    src: "/images/photos/awards/award-cmai-nigf-2024.jpg",
    alt: "CMAI North India Garment Fair 2024 Certificate of Appreciation for Arihant Marketing",
    caption: "CMAI North India Garment Fair, 2024",
  },
];
