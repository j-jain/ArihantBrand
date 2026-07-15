import type {
  Business,
  Faq,
  Partner,
  Post,
  SiteSettings,
  Stat,
  Store,
  Testimonial,
  ProcessStep,
} from "./types";

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
  contacts: [
    {
      unit: "marketing",
      businessName: "Arihant Marketing",
      floor: "2nd Floor",
      phones: [
        { name: "Sagar (Jain) Sancheti", phone: "9435045528" },
        { name: "Anand (Jain) Sancheti", phone: "9435045527" },
        { name: "Shreyansh Sancheti", phone: "9435569704" },
      ],
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
  { value: 35, suffix: "+", label: "Years in the garment trade" },
  { value: 250, suffix: "+", label: "Retailers served across NE India" },
  { value: 45, suffix: "+", label: "National brand partners" },
  { value: 24000, suffix: " sq ft", label: "Warehousing in Guwahati" },
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
    positioning: "The pioneer distributor of readymade garments in Northeast India.",
    summary:
      "Arihant Marketing has moved national menswear, womenswear and kidswear brands across Northeast India for more than 30 years. CMAI named it Best Distributor of India in 2015.",
    points: [
      "Pioneers of readymade garments distribution across Northeast India, with 30+ years in the trade.",
      "Named “Best Distributor of India” in 2015 by the Clothing Manufacturers Association of India (CMAI).",
      "15,000 sq ft of organised, state-of-the-art warehousing in Guwahati.",
      "Serves 250+ retailers and 45+ national brand partners.",
      "Founder member of NEGTA, the North Eastern Garment Traders Association.",
      "Every retailer visited at least once every 20 days, season after season.",
    ],
    stats: [
      { value: 30, suffix: "+", label: "Years distributing" },
      { value: 250, suffix: "+", label: "Retailers served" },
      { value: 15000, suffix: " sq ft", label: "Warehouse" },
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
    positioning: "Among the five largest readymade garments distributors in Northeast India.",
    summary:
      "Founded in 2013 by Ajay Sancheti, Arihant Apparels has built national brands into category leaders across the Northeast, and drew the highest footfall at the region's last 4 garment exhibitions.",
    points: [
      "Among the 5 largest readymade garments distributors in Northeast India.",
      "One mission: foster the growth of retailers across the region.",
      "Has established several brand partners as category leaders in the Northeast.",
      "9,000 sq ft warehouse in Guwahati.",
      "Highest footfall at the last 4 regional garment exhibitions.",
    ],
    stats: [
      { value: 2013, label: "Established" },
      { value: 9000, suffix: " sq ft", label: "Warehouse" },
      { value: 4, label: "Exhibitions led on footfall" },
    ],
    audienceCtas: [
      { label: "Stock our brands", href: "/contact?intent=retailer" },
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
    positioning: "Multi-brand modern retail, built on 35 years of garment-trade goodwill.",
    summary:
      "Arihant's retail arm runs modern multi-brand stores and exclusive brand outlets across Northeast India: 4 trading today, 2 in fit-out, and 10 planned by the end of FY 26-27.",
    points: [
      "Multi-brand modern retail stores, built on a 35-year legacy in the garment trade.",
      "4 stores open today, 2 more in fit-out.",
      "10 stores planned by the end of FY 26-27.",
      "Setting up EBOs (exclusive brand outlets) for national brand partners.",
      "A zero-deadstock, asset-light, no-frills store model.",
    ],
    stats: [
      { value: 4, label: "Stores open" },
      { value: 2, label: "Stores in fit-out" },
      { value: 10, label: "Stores planned by FY 26-27" },
    ],
    audienceCtas: [
      { label: "Own a managed store", href: "/partner" },
      { label: "Open your brand's EBO", href: "/contact?intent=brand" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Why-Arihant pillars (group)                                          */
/* ------------------------------------------------------------------ */

export const pillars = [
  {
    title: "Integrity, discipline, trust",
    text: "The three pillars of the organisation since day one. Retailers across seven states know an Arihant commitment is kept: on price, on delivery, on settlement.",
  },
  {
    title: "On the road every 20 days",
    text: "Every retailer we serve is visited at least once every 20 days. Orders, grievances and market feedback are handled face to face, on a schedule that does not slip.",
  },
  {
    title: "A time-bound work ethos",
    text: "Indents, dispatches and claims move on fixed timelines. Your shelves keep moving, and so does your capital.",
  },
  {
    title: "A modern retail backend",
    text: "A dedicated shop-in-shop team: plug and play, AI-driven, data-backed. It runs modern trade as sharply as we run traditional counters.",
  },
];

/* ------------------------------------------------------------------ */
/* Partner logos (77, from the brand profile)                           */
/* Categories are added ONLY where publicly verifiable for well-known   */
/* national labels; regional labels stay untagged.                      */
/* ------------------------------------------------------------------ */

const m = (name: string, slug: string, category?: string): Partner => ({
  name,
  slug,
  unit: "marketing",
  image: `/images/partners/${slug}.png`,
  ...(category ? { category } : {}),
});
const a = (name: string, slug: string, category?: string): Partner => ({
  name,
  slug,
  unit: "apparels",
  image: `/images/partners/${slug}.png`,
  ...(category ? { category } : {}),
});

export const partners: Partner[] = [
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

/* ------------------------------------------------------------------ */
/* Stores                                                               */
/* ------------------------------------------------------------------ */

export const stores: Store[] = [
  {
    name: "Urban Closet",
    city: "Guwahati",
    format: "Multi-brand",
    status: "Open",
    image: "/images/photos/store-urban-closet.jpg",
    caption: "Urban Closet, Guwahati: Arihant Retail's multi-brand store, lit for the evening trade.",
  },
  {
    name: "Indian Terrain × Spykar EBO",
    city: "Northeast India",
    format: "EBO",
    status: "Open",
    image: "/images/photos/store-ebo-indian-terrain.jpg",
    caption: "An exclusive brand outlet run by Arihant Retail for its national brand partners.",
  },
  {
    name: "Multi-brand store",
    city: "Northeast India",
    format: "Multi-brand",
    status: "Open",
    image: "/images/photos/store-interior.jpg",
    caption: "Inside an Arihant Retail floor: merchandised, staffed and stocked by our team.",
  },
  { name: "New store", city: "Northeast India", format: "Multi-brand", status: "Fit-out" },
  { name: "New store", city: "Northeast India", format: "Multi-brand", status: "Fit-out" },
];

/* ------------------------------------------------------------------ */
/* Franchise process (true sequence — numbered steps allowed)           */
/* ------------------------------------------------------------------ */

export const partnerSteps: ProcessStep[] = [
  {
    title: "Introduce yourself",
    text: "Send an inquiry with your city, the space you have or plan to lease, and your investment appetite. We respond within two working days.",
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
    answer:
      "Three things: a zero-deadstock arrangement so unsold inventory never sits on your books, an asset-light no-frills store format, and an operating playbook already proven across our existing stores.",
  },
  {
    page: "partner",
    question: "How much do I need to invest?",
    answer:
      "It depends on the city, the property and the format: multi-brand store or single-brand EBO. We walk through the full cost sheet and P&L structure in your proposal discussion. No figure is quoted before we have seen the specifics.",
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
    answer:
      "Anywhere in Northeast India where the catchment supports modern apparel retail. Our expansion plan targets 10 stores by the end of FY 26-27, and we assess every proposed location against real trade data before committing.",
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
    answer:
      "All of Northeast India, serviced from our 15,000 sq ft warehouse in Guwahati. More than 250 retailers across the region are on scheduled 20-day visit cycles.",
  },
  {
    page: "marketing",
    question: "How do I start stocking your brands in my store?",
    answer:
      "Send an inquiry or call us. We map your counter to the right brand mix from our 45+ partner portfolio, agree terms, and put you on a visit schedule. Most new retailers receive their first indent within weeks.",
  },
  {
    page: "marketing",
    question: "We're a brand looking for a Northeast distributor. Why Arihant?",
    answer:
      "Thirty years of relationships with 250+ retailers, CMAI's Best Distributor of India award in 2015, founder membership of NEGTA, and a dedicated plug-and-play SIS team with a data-backed retail backend. We have made national brands category leaders in this region.",
  },
  {
    page: "marketing",
    question: "How do you handle modern trade and shop-in-shops?",
    answer:
      "A dedicated SIS team handles modern retail end to end: fixtures, planograms, replenishment and sell-through tracking, driven by data rather than guesswork.",
  },
];

/* ------------------------------------------------------------------ */
/* Testimonials — SAMPLES ONLY, unpublished. The section renders        */
/* nothing until real testimonials are published in the Studio.         */
/* ------------------------------------------------------------------ */

export const testimonials: Testimonial[] = [
  {
    quote:
      "[Sample: replace with a real retailer quote before publishing] Arihant's visit schedule never slips. Our reorders reach before the shelf goes empty.",
    name: "Sample Retailer",
    role: "Menswear store, Dibrugarh",
    published: false,
  },
  {
    quote:
      "[Sample: replace with a real brand quote before publishing] They took us from zero presence to category leadership in the Northeast.",
    name: "Sample Brand Manager",
    role: "National apparel brand",
    published: false,
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
        text: "Scheduled retailer visits (ours run every 20 days), transparent secondary-sales feedback, disciplined claims handling, and a plug-and-play shop-in-shop team backed by real data. That combination turns a season's listing into a durable regional franchise. It is what we have built at Arihant over three decades, 250+ retailers and 45+ brand partnerships.",
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
        text: "An operator with real answers will welcome the interrogation. At Arihant Retail we run this model across Northeast India on the back of a 35-year distribution legacy, and every economic detail goes on paper during the proposal stage, before a rupee moves.",
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
        text: "Modern trade runs on data, and host stores expect their SIS partners to keep up. Our own SIS operation is run by a dedicated team, plug and play, AI-driven and data-backed, because replenishment guesses that were tolerable in general trade become visible failures in a department store's weekly review.",
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
        text: "A good SIS programme is quiet. Fixtures stay full, size sets stay whole, reviews hold no surprises. That quiet is manufactured by a team doing the standing work every week. If you are weighing a Northeast entry through modern trade, we are happy to walk you through how our SIS team runs it.",
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
        text: "We operate on both sides of this question. The group's distribution arms supply MBO counters across seven states, and Arihant Retail runs multi-brand stores of its own while setting up EBOs for national brand partners. What follows is the framing we use internally.",
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
        text: "This region adds its own weighting. Outside Guwahati and a handful of high streets, destination brand pull thins out quickly, while family MBO counters hold loyalty built over decades. Modern trade is arriving, and EBOs for the right national names are part of our own expansion plan. But arriving is not arrived: most volume today still walks into multi-brand floors, and a format decision should follow the volume.",
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
        text: "Format is only half the decision. The other half is who runs the store. Arihant Retail operates multi-brand stores and is setting up EBOs for national brand partners, and in both formats we run a managed model: our team handles hiring, merchandising, marketing and CRM, and deadstock stays off the owner's books.",
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
        text: "The visit also carries information upstream. Sizes that run short, price points buyers balk at, a competitor's scheme moving stock: your distributor can only push that to brands if someone collected it recently. Market feedback gathered across 250+ retailers is how a region gets assortments cut for it, instead of leftovers from mainland plans. It is also how exhibition assortments get sharper every year: order patterns from the fairs meet visit notes from the floor.",
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
          "How many retailers are on an active, scheduled visit cycle, and what is the cycle? (Ours: 250+ retailers, each visited at least every 20 days.)",
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
          "How many square feet, and how is a brand's stock binned and secured? (Ours: 15,000 sq ft with Arihant Marketing and 9,000 sq ft with Arihant Apparels, both in Guwahati.)",
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
        text: "We decide the assortment, set the planogram, rotate stock through the season and run the end-of-season process. The buying relationships behind this come from the group's distribution businesses: 45+ national brand partners and 35 years in the trade.",
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
        text: "What we say publicly is what we can stand behind: the model is tried and tested, 4 stores already trade on it, 2 more are in fit-out, and it is backed by a strong, proven ROIC record and 35 years of goodwill in this trade.",
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
        text: "The model exists because good properties and good operators are rarely the same people. If you hold the property, we hold the rest. Request the details and we will respond within two working days.",
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
    text: "Ajay Sancheti opens the group's second distribution house, which grows into one of the region's five largest.",
  },
  {
    year: "2015",
    title: "Best Distributor of India",
    text: "The Clothing Manufacturers Association of India (CMAI) names Arihant the country's best distributor.",
  },
  {
    year: "2023",
    title: "Arihant Retail launches",
    text: "Shreyansh Sancheti takes the group into modern retail: multi-brand stores and exclusive brand outlets.",
  },
  {
    year: "FY 26-27",
    title: "Ten stores and counting",
    text: "Four stores trading, two in fit-out, ten planned, with EBOs rolling out for national brand partners.",
  },
];
