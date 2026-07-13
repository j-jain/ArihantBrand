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
  tagline: "Northeast India's leading readymade garments distribution house",
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
    positioning: "The pioneer of readymade garments distribution in Northeast India.",
    summary:
      "For more than three decades, Arihant Marketing has moved national menswear, womenswear and kidswear brands into every corner of Northeast India — and was named Best Distributor of India by CMAI in 2015.",
    points: [
      "Pioneers in readymade garments distribution across Northeast India, with 30+ years of industry experience.",
      "Awarded “Best Distributor of India” in 2015 by the Clothing Manufacturers Association of India (CMAI).",
      "State-of-the-art warehouse spanning over 15,000 sq ft in Guwahati.",
      "Caters to more than 250 retailers and 45+ brand partners.",
      "Founder member of NEGTA — the North Eastern Garment Traders Association.",
      "Every retailer is visited at least once every 20 days — a promise, not an aspiration.",
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
      "Founded in 2013 by Ajay Sancheti, Arihant Apparels has built national brands into category leaders across the Northeast — and drawn the highest footfall at the region's last four garment exhibitions.",
    points: [
      "Among the 5 largest readymade garments distributors in Northeast India.",
      "Focused on one mission: fostering the growth of retailers across the region.",
      "Has established several brand partners as category leaders in the Northeast.",
      "Warehouse spanning over 9,000 sq ft in Guwahati.",
      "Garnered the highest footfall in the last 4 regional exhibitions.",
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
      "Arihant's retail arm operates modern multi-brand stores and exclusive brand outlets across Northeast India — four stores today, two in fit-out, and ten planned by the end of FY 2026-27.",
    points: [
      "Multi-brand modern retail stores leveraging a 35-year legacy in the garment industry.",
      "Currently operates 4 stores, with 2 more under fit-out.",
      "Plans to reach 10 stores by the end of FY 2026-27.",
      "Setting up EBOs (exclusive brand outlets) for national brand partners.",
      "Zero-deadstock, no-frills, asset-light retail model.",
    ],
    stats: [
      { value: 4, label: "Stores open" },
      { value: 2, label: "In fit-out" },
      { value: 10, label: "Planned by FY 26-27" },
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
    text: "The three pillars of the organisation since day one. Retailers across seven states know an Arihant commitment is kept — on price, on delivery, on settlement.",
  },
  {
    title: "On the road, every 20 days",
    text: "Every retailer we serve is visited at least once every 20 days. Orders, grievances, market feedback — handled face to face, on a schedule that never slips.",
  },
  {
    title: "A time-bound work ethos",
    text: "A highly organised operation: indents, dispatches and claims move on fixed timelines, so your shelves and your capital keep moving too.",
  },
  {
    title: "A modern retail backend",
    text: "A dedicated shop-in-shop team that is plug-and-play — AI-driven, data-backed, and built to run modern trade as sharply as traditional counters.",
  },
];

/* ------------------------------------------------------------------ */
/* Partner logos (77, from the brand profile)                           */
/* ------------------------------------------------------------------ */

const m = (name: string, slug: string): Partner => ({
  name,
  slug,
  unit: "marketing",
  image: `/images/partners/${slug}.png`,
});
const a = (name: string, slug: string): Partner => ({
  name,
  slug,
  unit: "apparels",
  image: `/images/partners/${slug}.png`,
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
  m("Deal Jeans", "deal-jeans"),
  m("dida", "dida"),
  m("Ethni'ks Neu-Ron", "ethniks-neu-ron"),
  m("Exceed", "exceed"),
  m("Focus Jeans", "focus-jeans"),
  m("Four Buttons", "four-buttons"),
  m("Gemini", "gemini"),
  m("Grab It", "grab-it"),
  m("Hatcher's", "hatchers"),
  m("Hoffmen", "hoffmen"),
  m("Indian Terrain", "indian-terrain"),
  m("Juliet", "juliet"),
  m("Kathy", "kathy"),
  m("Kooki Ethnics", "kooki-ethnics"),
  m("Little Collars", "little-collars"),
  m("Little Kangaroos", "little-kangaroos"),
  m("Mayur", "mayur"),
  m("Mohit Industries", "mohit-industries"),
  m("Nostrum", "nostrum"),
  m("O'Baby", "obaby"),
  m("Octave", "octave"),
  m("Peppermint", "peppermint"),
  m("Perri Palley", "perri-palley"),
  m("Pretty Woman", "pretty-woman"),
  m("Raksha", "raksha"),
  m("RE:PINK", "re-pink"),
  m("RexStraut Jeans", "rexstraut-jeans"),
  m("Spykar", "spykar"),
  m("Sulphur Style Lab", "sulphur-style-lab"),
  m("Tadpole", "tadpole"),
  m("Tassel", "tassel"),
  m("Tiny Girl", "tiny-girl"),
  m("Twills", "twills"),
  m("Vriti", "vriti"),
  m("Yaaron", "yaaron"),
  m("7L", "7l"),
  // Arihant Apparels portfolio
  a("Alvaro Castagnino", "alvaro-castagnino"),
  a("Bad Boys", "bad-boys"),
  a("Believe-In Shirts", "believe-in-shirts"),
  a("BIBA", "biba"),
  a("Caroline Clothing", "caroline-clothing"),
  a("Catwalk", "catwalk"),
  a("Cool Colors", "cool-colors"),
  a("Dagerrfly", "dagerrfly"),
  a("Dhwaja", "dhwaja"),
  a("Integriti", "integriti"),
  a("Juniper", "juniper"),
  a("Kashmiera", "kashmiera"),
  a("Kidzello", "kidzello"),
  a("La' Scoot", "la-scoot"),
  a("Libas", "libas"),
  a("Mikki House", "mikki-house"),
  a("Minerals Jeans", "minerals-jeans"),
  a("MJ Mashup", "mj-mashup"),
  a("Mollys", "mollys"),
  a("NIVIA", "nivia"),
  a("Rangriti", "rangriti"),
  a("Raw Star", "raw-star"),
  a("Red Flame", "red-flame"),
  a("Skechers", "skechers"),
  a("Stori", "stori"),
  a("Sweet Dreams", "sweet-dreams"),
  a("Wildcraft", "wildcraft"),
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
    caption: "Urban Closet — Arihant Retail's multi-brand store, lit for the evening trade.",
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
    caption: "Inside an Arihant Retail floor — merchandised, staffed and stocked by our team.",
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
    text: "Send an inquiry with your city, the space you have (or plan to lease), and your investment appetite. We respond within two working days.",
  },
  {
    title: "Sit down with us",
    text: "A face-to-face session in Guwahati or on call: the model, the store P&L structure, and what our track record has looked like — openly.",
  },
  {
    title: "We build the store",
    text: "Site assessment, fit-out, merchandising, hiring and training — handled by the Arihant Retail team while you watch the milestones.",
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
      "Three things: a zero-deadstock arrangement so unsold inventory doesn't sit on your books, an asset-light no-frills store format, and a tried-and-tested operating playbook backed by a proven ROIC record across our existing stores.",
  },
  {
    page: "partner",
    question: "How much do I need to invest?",
    answer:
      "It depends on the city, the property and the format (multi-brand store or single-brand EBO). We walk through the full cost sheet and P&L structure in your proposal discussion — no figure is quoted before we've seen the specifics.",
  },
  {
    page: "partner",
    question: "Who brings customers to the store?",
    answer:
      "We do. Arihant Retail runs calibrated influencer and social-media campaigns for every store, and maintains the customer CRM centrally. Footfall generation is our responsibility, not yours.",
  },
  {
    page: "partner",
    question: "Where can a store be opened?",
    answer:
      "Anywhere in Northeast India where the catchment supports modern apparel retail. Our expansion plan targets 10 stores by the end of FY 2026-27, and we assess every proposed location against real trade data before committing.",
  },
  {
    page: "partner",
    question: "What do I actually receive as the owner?",
    answer:
      "A fully fitted, fully staffed, fully stocked store trading under a proven model, with transparent performance reviews. The economics — margin structure, working-capital cycle, payback expectations — are laid out in writing during the proposal stage.",
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
      "Send an inquiry or call us. We'll map your counter to the right brand mix from our 45+ partner portfolio, agree terms, and put you on a visit schedule. Most new retailers receive their first indent within weeks.",
  },
  {
    page: "marketing",
    question: "We're a brand looking for a Northeast distributor. Why Arihant?",
    answer:
      "Thirty years of relationships with 250+ retailers, CMAI's Best Distributor of India award (2015), founder membership of NEGTA, and a dedicated plug-and-play SIS team with a data-backed retail backend. We've made national brands category leaders in this region.",
  },
  {
    page: "marketing",
    question: "How do you handle modern trade and shop-in-shops?",
    answer:
      "A dedicated SIS team handles modern retail end to end — fixtures, planograms, replenishment and sell-through tracking — driven by data, not guesswork.",
  },
];

/* ------------------------------------------------------------------ */
/* Testimonials — SAMPLES ONLY, unpublished. The section renders        */
/* nothing until real testimonials are published in the Studio.         */
/* ------------------------------------------------------------------ */

export const testimonials: Testimonial[] = [
  {
    quote:
      "[Sample — replace with a real retailer quote before publishing] Arihant's visit schedule never slips. Our reorders reach before the shelf goes empty.",
    name: "Sample Retailer",
    role: "Menswear store, Dibrugarh",
    published: false,
  },
  {
    quote:
      "[Sample — replace with a real brand quote before publishing] They took us from zero presence to category leadership in the Northeast.",
    name: "Sample Brand Manager",
    role: "National apparel brand",
    published: false,
  },
];

/* ------------------------------------------------------------------ */
/* Blog posts                                                           */
/* ------------------------------------------------------------------ */

export const posts: Post[] = [
  {
    title: "How to choose a readymade garments distributor in Northeast India",
    slug: "choose-garment-distributor-northeast-india",
    excerpt:
      "Margins are decided long before a garment reaches your rack. Here is the checklist we'd use if we were on your side of the counter — visit cadence, fill rates, claim settlement and more.",
    date: "2026-06-10",
    audience: "Retailers",
    readMinutes: 6,
    metaDescription:
      "A practical checklist for NE India retailers choosing a readymade garments distributor: visit cadence, fill rates, brand mix, claim settlement and credit discipline.",
    body: [
      {
        type: "p",
        text: "A retailer's profit in the garment trade is mostly decided upstream: which distributor you buy from, how often they visit, how fast they fill, and how cleanly they settle claims. Storefronts and salesmanship matter — but a weak supply line quietly eats both.",
      },
      { type: "h2", text: "Start with the visit cadence" },
      {
        type: "p",
        text: "Ask any distributor one question first: how often will your representative physically stand in my store? If the answer is vague — 'regularly', 'whenever needed' — expect stockouts in season and silence off season. A disciplined house commits to a number and keeps it. Our own standard is once every 20 days for every retailer, without exception, because reorders, grievances and market feedback only move when someone is in the room.",
      },
      { type: "h2", text: "Check the brand mix against your counter, not their catalogue" },
      {
        type: "p",
        text: "A long brand list is impressive; the right brand list is profitable. A menswear counter in Silchar and a family store in Itanagar need different depth in shirts, denim, ethnic and kidswear. A good distributor maps their portfolio to your square footage and your customer — and is willing to tell you what not to stock.",
      },
      { type: "h2", text: "The unglamorous numbers that decide your year" },
      {
        type: "ul",
        items: [
          "Fill rate: what percentage of your indent actually arrives, and how fast? Anything consistently below the high nineties starves your best sellers.",
          "Claim settlement: defectives and shortages are a fact of the trade. What matters is the timeline and paperwork discipline for making you whole.",
          "Credit terms and their enforcement: generous terms that collapse into ad-hoc pressure are worse than tight terms applied predictably.",
          "Season readiness: does festival stock reach you before the footfall, or with it?",
        ],
      },
      { type: "h2", text: "Look for institutional weight" },
      {
        type: "p",
        text: "Industry recognition and association membership are not decoration — they are references you can verify. A distributor recognised nationally (CMAI's Best Distributor of India is the benchmark award in our trade) or involved in founding regional trade bodies like NEGTA has a reputation it cannot afford to spend cheaply on any single retailer relationship.",
      },
      { type: "h2", text: "Visit the warehouse" },
      {
        type: "p",
        text: "One afternoon in a distributor's warehouse tells you more than any brochure: how stock is binned, how indents are picked, whether dispatch is a system or a scramble. A serious house will welcome the visit. If they hesitate, you have your answer.",
      },
      {
        type: "p",
        text: "Choosing well once saves you renegotiating every season. If you retail anywhere in Northeast India, we're happy to have that first conversation — and to put you on a 20-day cycle that never slips.",
      },
    ],
  },
  {
    title: "Taking a national apparel brand into Northeast India: a distribution playbook",
    slug: "apparel-brand-distribution-northeast-india",
    excerpt:
      "The Northeast is India's most misunderstood apparel market — seven states, distinct tastes, and retail relationships that take decades to build. A playbook for brands planning the entry.",
    date: "2026-05-18",
    audience: "Brands",
    readMinutes: 7,
    metaDescription:
      "How national apparel brands should plan distribution in Northeast India: market structure, retailer relationships, exhibitions, SIS execution and choosing the right regional partner.",
    body: [
      {
        type: "p",
        text: "For most national apparel brands, Northeast India is the last unchecked box on the map — a region of seven states, growing disposable income, and consumers who follow national fashion trends faster than the trade gives them credit for. It is also a market where cold entry fails: retail here runs on relationships built over decades, not on trade schemes.",
      },
      { type: "h2", text: "Understand the market's shape before the math" },
      {
        type: "p",
        text: "The region's apparel retail is dominated by strong independent multi-brand outlets (MBOs) in cities like Guwahati, Dibrugarh, Jorhat, Silchar, Shillong, Agartala and Imphal. Modern trade is growing — malls, shop-in-shops, exclusive brand outlets — but the MBO counter remains where volume lives. A brand plan that only targets modern trade misses most of the market.",
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
        text: "The pattern that works: seed the top MBO counters in Guwahati and two or three anchor cities in season one; use exhibition orders to widen distribution in season two; add SIS and EBO formats only once sell-through data justifies them. Brands that invert this — flagship first, distribution later — pay for the building while the market shops elsewhere.",
      },
      { type: "h2", text: "What to demand from your regional partner" },
      {
        type: "p",
        text: "Scheduled retailer visits (ours run every 20 days), transparent secondary-sales feedback, disciplined claims handling, and a plug-and-play shop-in-shop team backed by real data. That combination is what turns a season's listing into a durable regional franchise — and it is exactly what we have built at Arihant over three decades, 250+ retailers and 45+ brand partnerships.",
      },
    ],
  },
  {
    title: "Managed franchise vs going it alone: the economics of multi-brand apparel retail",
    slug: "managed-franchise-vs-independent-apparel-retail",
    excerpt:
      "Most first-time apparel store owners lose money in the same four places: inventory, people, marketing and rent negotiation. A managed model changes who carries each risk.",
    date: "2026-04-22",
    audience: "Investors",
    readMinutes: 6,
    metaDescription:
      "Comparing managed retail franchise models with independent store ownership in India's apparel market: deadstock risk, staffing, footfall generation and where returns actually come from.",
    body: [
      {
        type: "p",
        text: "India's apparel market keeps growing, and retail remains one of the few businesses where a physical asset in the right catchment produces cash from month one. Yet most first-time store owners underperform — not because demand is missing, but because four operating risks land on someone who has never carried them before.",
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
        text: "In a managed arrangement, the operator — not the owner — carries the operating craft: they hire and manage staff, set targets, run marketing and CRM, merchandise the floor and rotate stock. Structured well, the owner's exposure to deadstock is designed out of the model entirely. The owner brings capital and the property relationship; the operator brings thirty years of trade muscle. Returns depend on execution quality, which is why the operator's track record — real stores, real ROIC history, verifiable trade reputation — is the entire investment case.",
      },
      { type: "h2", text: "Questions to ask any managed-retail operator" },
      {
        type: "ul",
        items: [
          "Show me the existing stores. How long have they traded, and how have they performed?",
          "Who carries deadstock risk, in writing?",
          "What exactly is handled by your team, and what remains mine?",
          "How is performance reported to me, and how often?",
          "What happens if the store underperforms — what levers exist, and who pulls them?",
        ],
      },
      {
        type: "p",
        text: "An operator with real answers will welcome the interrogation. At Arihant Retail we run this model across Northeast India on the back of a 35-year distribution legacy — and every economic detail is put on paper during the proposal stage, before a rupee moves.",
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
    text: "The Sancheti family enters Guwahati's garment trade — building the retailer relationships that still anchor the group today.",
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
    text: "Shreyansh Sancheti takes the group into modern retail — multi-brand stores and exclusive brand outlets.",
  },
  {
    year: "FY 26-27",
    title: "Ten stores and counting",
    text: "Four stores trading, two in fit-out, ten planned — with EBOs rolling out for national brand partners.",
  },
];
