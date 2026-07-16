import type { PageCopy } from "./types";

/** Per-route copy. Sanity `page` documents mirror this; seed is the fallback. */
export const pages: Record<string, PageCopy> = {
  home: {
    metaTitle: "Garment Distributor in Northeast India | Arihant Group",
    metaDescription:
      "The garment house of Northeast India: 77 national labels, 250+ retail counters, seven states, and managed stores of our own. Guwahati since the 1990s.",
    hero: {
      heading: "The garment house of Northeast India",
      headingEmphasis: "garment house",
      lead: "We keep the Northeast's stores {{stocked|selling|supplied}}: 77 national labels moving into 250+ retail counters across seven states, from Guwahati since the 1990s.",
      primaryCta: { label: "Partner with us", href: "/contact" },
      secondaryCta: { label: "The three businesses", href: "#businesses" },
    },
    sections: {
      proof: {
        heading: "Held to a standard the trade can measure",
        lead: "Best Distributor of India, CMAI 2015. The same discipline still runs every route out of Guwahati.",
      },
      why: {
        heading: "Why the trade trusts Arihant",
        lead: "Four working habits, kept season after season. They are the whole pitch.",
      },
      businesses: {
        heading: "Three businesses, one standard",
        lead: "Distribution built the house. Retail extends it. Start where your business does.",
      },
      systems: {
        heading: "Old-school handshakes, new-school systems",
        lead: "Behind the relationships sits a retail backend that runs on data: buying, replenishment and reporting, systematised.",
        body: ["The systems stay invisible. The shelves stay full."],
      },
      brands: {
        heading: "The brands we carry",
        lead: "77 national labels across menswear, womenswear, kidswear, denim, ethnic and footwear, on counters in all seven states.",
      },
      notes: {
        heading: "Trade Notes",
        lead: "Field notes from the road, written for retailers, brands and first-time store owners.",
      },
      voice: {
        heading: "What the trade says",
      },
      cta: {
        heading: "Bring your business to Arihant",
        lead: "Retailer, brand or investor. Tell us what you're building, and the right Sancheti calls you back.",
      },
    },
  },

  marketing: {
    metaTitle: "Garment Distributor in Guwahati | Arihant Marketing",
    metaDescription:
      "Northeast India's pioneer readymade garments distributor: 30+ years, 250+ retailers, 45+ brand partners, 15,000 sq ft Guwahati warehouse, 20-day visit cycles.",
    hero: {
      heading: "The pioneer distributor of readymade garments in Northeast India",
      headingEmphasis: "pioneer",
      lead: "For more than 30 years we have moved national brands into the region's counters, and we still stand in every retailer's store at least once every 20 days.",
      primaryCta: { label: "Become a retail partner", href: "/contact?intent=retailer" },
      secondaryCta: { label: "Distribute your brand", href: "/contact?intent=brand" },
    },
    sections: {
      award: {
        heading: "Best Distributor of India, 2015",
        lead: "Awarded by the Clothing Manufacturers Association of India. In this trade, that is the reference that needs no explaining.",
      },
      how: {
        heading: "How we work with retailers",
        lead: "A fixed rhythm the whole region can set its watch by.",
        body: [
          "We map your counter to the right mix from our 45+ brand portfolio: depth where your customer shops, nothing that will sit.",
          "A representative stands in your store on a fixed cycle. Reorders, claims and market feedback move face to face.",
          "Indents are picked and dispatched from 15,000 sq ft of organised Guwahati warehousing, on fixed timelines.",
          "Claims and settlements move on paper, on schedule, so your capital keeps rotating.",
        ],
      },
      sis: {
        heading: "A shop-in-shop team that plugs straight in",
        lead: "Brands entering the Northeast do not need to build a field force. Ours is already standing in the region's modern trade. Plug and play, AI-driven, data-backed.",
      },
      brands: {
        heading: "The labels we move",
        lead: "National menswear, womenswear and kidswear, all serviced from our Guwahati warehouse.",
      },
      faq: { heading: "Straight answers" },
      cta: {
        heading: "Put thirty years of distribution behind your counter.",
        lead: "45+ national brands, a 15,000 sq ft Guwahati warehouse, and every retailer seen face to face, cycle after cycle.",
      },
    },
  },

  apparels: {
    metaTitle: "Apparel Distributor in Northeast India | Arihant Apparels",
    metaDescription:
      "Founded 2013. Among the 5 largest readymade garments distributors in Northeast India, building brands into category leaders. Stock our labels today.",
    hero: {
      heading: "The apparel distributor that builds category leaders",
      headingEmphasis: "category leaders",
      lead: "Founded in 2013 by Ajay Sancheti and built brand by brand into the distributor the trade queues for at every regional fair.",
      primaryCta: { label: "Stock our brands", href: "/contact?intent=retailer" },
      secondaryCta: { label: "Partner as a brand", href: "/contact?intent=brand" },
    },
    sections: {
      mission: {
        heading: "Built to grow retailers",
        lead: "Our mission is plain: foster the growth of retailers across the region. When your counter grows, our portfolio grows with it.",
      },
      exhibitions: {
        heading: "The busiest stand at every fair",
        lead: "Highest footfall at the last 4 regional garment exhibitions. The trade walks to where the season's winners are.",
      },
      brands: {
        heading: "The Apparels portfolio",
        lead: "Ethnic wear, westernwear, kidswear and footwear, distributed across the region from our Guwahati warehouse.",
      },
      faq: { heading: "Straight answers" },
      cta: {
        heading: "Grow with one of the Northeast’s five largest distributors.",
        lead: "Founded in 2013, running a 9,000 sq ft Guwahati warehouse, and holding the busiest stand at the region's last four garment fairs.",
      },
    },
  },

  retail: {
    metaTitle: "Multi-brand Retail Stores in Guwahati | Arihant Retail",
    metaDescription:
      "Modern multi-brand apparel stores and EBOs across Northeast India: 4 open, 2 in fit-out, 10 planned by FY 26-27. Zero-deadstock, asset-light, fully managed.",
    hero: {
      heading: "Retail, run the way a distributor runs it",
      headingEmphasis: "distributor",
      lead: "Modern multi-brand stores and exclusive brand outlets, run with distributor discipline. The house that has supplied the region's counters since the 1990s now runs its own.",
      primaryCta: { label: "Own a managed store", href: "/partner" },
      secondaryCta: { label: "Open your brand's EBO", href: "/contact?intent=brand" },
    },
    sections: {
      stores: {
        heading: "On the street today",
        lead: "Every store staffed, stocked and marketed by our own team.",
      },
      model: {
        heading: "The zero-deadstock model",
        lead: "The store carries what sells and returns what does not. Buying, rotation and markdowns stay with the house. This is retail the way a distributor builds it.",
      },
      expansion: {
        heading: "The map fills in",
        lead: "EBOs are rolling out for national brand partners, and the next multi-brand doors are already in fit-out.",
      },
      cta: {
        heading: "One of the next stores could be yours",
        lead: "The next stores will be owned by partners and run by us. See how the model works.",
      },
    },
  },

  partner: {
    metaTitle: "Retail Franchise, Northeast India | Own a Managed Store",
    metaDescription:
      "Own an apparel store in Northeast India that Arihant Retail staffs, stocks and markets for you. Zero deadstock, asset-light. Request franchise details.",
    hero: {
      heading: "Own the store. We run everything else.",
      lead: "We run {{the hiring|the stock|the marketing|the targets}}. You own the asset. A managed apparel store backed by three decades in the trade. No retail experience needed.",
      primaryCta: { label: "Request franchise details", href: "#inquiry" },
      secondaryCta: { label: "See how it works", href: "#how-it-works" },
    },
    sections: {
      promise: {
        heading: "What “fully managed” actually means",
        lead: "Every operating risk that sinks first-time store owners is carried by our team instead.",
        body: [
          "Ours: hiring, training and managing the floor team.",
          "Ours: target-setting, merchandising and stock rotation.",
          "Ours: marketing, calibrated influencer and social campaigns, and the central CRM.",
          "Deadstock: engineered out of your books entirely.",
          "Yours: the store, the asset, and a clear performance review rhythm.",
        ],
      },
      proof: {
        heading: "Tried, tested, already trading",
        lead: "4 stores already trade on this model, backed by a proven ROIC record and by the house that supplies the region's retailers.",
      },
      how: { heading: "How it works", lead: "Four steps from inquiry to a trading store. FOCO, done properly." },
      faq: { heading: "The questions serious investors ask" },
      inquiry: {
        heading: "Request the franchise details",
        lead: "Tell us your city and your space. We reply within two working days.",
      },
    },
  },

  brands: {
    metaTitle: "77 Apparel Brands Distributed in Northeast India | Arihant",
    metaDescription:
      "Browse the 77 national apparel labels Arihant distributes across Northeast India: menswear, womenswear, kidswear, denim, ethnic, footwear. Put them on your racks.",
    hero: {
      heading: "The apparel brands we put on the Northeast's racks",
      lead: "Menswear, womenswear, kidswear, denim, ethnic and footwear. 77 national labels distributed to counters in all seven states by Arihant Marketing and Arihant Apparels.",
      primaryCta: { label: "Distribute your brand", href: "/contact?intent=brand" },
      secondaryCta: { label: "Stock these labels", href: "/contact?intent=retailer" },
    },
    sections: {
      wall: { heading: "The portfolio" },
      cta: {
        heading: "Your brand belongs on this wall",
        lead: "We have built national labels into Northeast category leaders for 30 years. Talk to us about yours.",
      },
    },
  },

  about: {
    metaTitle: "About Arihant Group | 35 Years in the Northeast Trade",
    metaDescription:
      "From a 1990s Guwahati counter to three businesses run by the Sancheti family: distribution, wholesale and modern retail, still answered by the names on the door.",
    hero: {
      heading: "35 years, three businesses, one name on the door",
      lead: "Arihant is the Sancheti family's garment house in Guwahati, still run by the people who answer its phones.",
      primaryCta: { label: "Work with us", href: "/contact" },
    },
    sections: {
      story: {
        heading: "From one counter to the whole Northeast",
        lead: "Rhythm first. Scale later.",
        body: [
          "The Arihant story begins in Guwahati's garment trade in the early 1990s, when the Sancheti family started supplying readymade garments to the city's retailers. Scale came later. What set the house apart first was rhythm: visits that happened on schedule, claims that settled on paper, commitments that held.",
          "That rhythm built Arihant Marketing into the pioneer distributor of the Northeast and made the house a founder member of NEGTA alongside the region's leading traders. A second distribution business, Arihant Apparels, grew into one of the region's five largest within a decade.",
          "In 2023 the family carried the same discipline into retail itself: modern multi-brand stores and exclusive brand outlets, staffed and stocked by the house's own team.",
        ],
      },
      values: {
        heading: "Integrity. Discipline. Trust.",
        lead: "These are operating rules, not wall art. They are why a retailer in Imphal reorders without checking the invoice twice.",
      },
      leadership: {
        heading: "The people on the door",
        lead: "Sagar, Anand, Ajay and Shreyansh Sancheti each run an arm of the house. Each one answers his own phone.",
      },
      timeline: { heading: "The years that built the house" },
    },
  },

  recognition: {
    metaTitle: "Awards & Testimonials | Arihant Group Recognition",
    metaDescription:
      "CMAI's Best Distributor of India 2015, NEGTA founder membership, and what retailers, brands and store owners across the Northeast say about Arihant.",
    hero: {
      heading: "Recognition, earned the slow way",
      headingEmphasis: "slow way",
      lead: "One national award, one founding membership, four fairs led on footfall, and the word of the trade itself.",
      primaryCta: { label: "Work with us", href: "/contact" },
    },
    sections: {
      awards: { heading: "The trophy case", lead: "A short list. Heavy items." },
      milestones: { heading: "The years behind it" },
      voices: {
        heading: "What the trade says",
        lead: "Retailers, brands and store owners across seven states, in their own words. Names shared privately on request.",
      },
      cta: {
        heading: "References available on a phone call",
        lead: "Serious inquiries get real numbers to call, not just quotes on a page.",
      },
    },
  },

  blog: {
    metaTitle: "Trade Notes | Garment Distribution & Retail, Northeast India",
    metaDescription:
      "Practical notes from the Northeast garment trade: choosing a distributor, entering the region, managed retail. Written for the counter.",
    hero: {
      heading: "Notes from the road",
      lead: "What moving garments across seven states has taught us, written for the retailers, brands and investors we work with.",
      primaryCta: { label: "Talk to us", href: "/contact" },
    },
    sections: {},
  },

  contact: {
    metaTitle: "Contact Arihant Group, Guwahati | Trade Inquiries",
    metaDescription:
      "Reach Arihant Marketing, Arihant Apparels or Arihant Retail at Arihant Tower, Jyotikuchi, Guwahati. Call, WhatsApp or write; we reply in two working days.",
    hero: {
      heading: "Tell us what you're building",
      lead: "The form below routes your inquiry to the right business. Every number on this page reaches a Sancheti directly.",
      primaryCta: { label: "Send an inquiry", href: "#inquiry" },
    },
    sections: {
      form: { heading: "Send an inquiry" },
      direct: {
        heading: "Or reach us directly",
        lead: "All three businesses work from Arihant Tower, Jyotikuchi, Guwahati 781040.",
      },
    },
  },
};
