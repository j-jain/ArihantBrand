import type { PageCopy } from "./types";

/** Per-route copy. Sanity `page` documents mirror this; seed is the fallback. */
export const pages: Record<string, PageCopy> = {
  home: {
    metaTitle: "Arihant Group — Garment Distribution & Retail, Northeast India",
    metaDescription:
      "35 years, 250+ retailers, 45+ national brands. Arihant Marketing, Arihant Apparels and Arihant Retail — Northeast India's leading readymade garments distribution and retail house, Guwahati.",
    hero: {
      threadLabel: "Guwahati · Since the 1990s",
      heading: "The house behind the Northeast's best-stocked stores",
      headingEmphasis: "best-stocked",
      lead: "Arihant moves 45+ national apparel brands into 250+ retail counters across Northeast India — and now builds and runs modern retail stores of its own. Three businesses, one standard: integrity, discipline, trust.",
      primaryCta: { label: "Partner with us", href: "/contact" },
      secondaryCta: { label: "Explore the three businesses", href: "#businesses" },
    },
    sections: {
      why: {
        heading: "Why the trade trusts Arihant",
        lead: "Named Best Distributor of India by CMAI in 2015. Founder member of NEGTA. Thirty-five years without letting a season slip.",
      },
      businesses: {
        heading: "Three businesses, one family standard",
        lead: "Distribution built the house. Retail is extending it. Find the arm built for you.",
      },
      brands: {
        heading: "The brands we carry",
        lead: "From national denim houses to kidswear specialists — 45+ brand partners distributed across seven states.",
      },
      cta: {
        heading: "Bring your business to Arihant",
        lead: "Retailer, brand or investor — tell us what you're building, and the right Sancheti will call you back.",
      },
    },
  },

  marketing: {
    metaTitle: "Arihant Marketing — Readymade Garments Distributor, Northeast India",
    metaDescription:
      "CMAI's Best Distributor of India (2015). 30+ years distributing readymade garments across Northeast India: 250+ retailers, 45+ brands, 15,000 sq ft Guwahati warehouse, retailer visits every 20 days.",
    hero: {
      threadLabel: "Arihant Marketing · Since the 1990s",
      heading: "The pioneer of garment distribution in the Northeast",
      headingEmphasis: "pioneer",
      lead: "Thirty years, 250+ retailers, 45+ national brands, and CMAI's Best Distributor of India award — earned by standing in our retailers' stores every 20 days, season after season.",
      primaryCta: { label: "Become a retail partner", href: "/contact?intent=retailer" },
      secondaryCta: { label: "Distribute your brand", href: "/contact?intent=brand" },
    },
    sections: {
      award: {
        heading: "Best Distributor of India, 2015",
        lead: "Awarded by the Clothing Manufacturers Association of India — the trade's own benchmark for distribution excellence.",
      },
      how: {
        heading: "How we work with retailers",
        lead: "A fixed rhythm the whole region can set its watch to.",
        body: [
          "Your counter is mapped to the right mix from our 45+ brand portfolio — depth where your customer shops, nothing that will sit.",
          "A representative stands in your store at least once every 20 days: reorders, claims, market feedback, face to face.",
          "Indents pick and dispatch from 15,000 sq ft of organised Guwahati warehousing on fixed timelines.",
          "Claims and settlements move on paper, on schedule — so your capital keeps rotating.",
        ],
      },
      sis: {
        heading: "A modern-trade backend, ready to plug in",
        lead: "Our dedicated shop-in-shop team runs fixtures, planograms and replenishment — AI-driven, data-backed, and already trusted by national brands.",
      },
      brands: {
        heading: "48 brands, one indent away",
      },
      faq: { heading: "Straight answers" },
    },
  },

  apparels: {
    metaTitle: "Arihant Apparels — Top-5 Garment Distributor, Northeast India",
    metaDescription:
      "Founded 2013. Among the 5 largest readymade garments distributors in Northeast India — 9,000 sq ft warehouse, category-leading brand building, highest footfall at the region's last 4 exhibitions.",
    hero: {
      threadLabel: "Arihant Apparels · Founded 2013",
      heading: "Where national brands become regional leaders",
      headingEmphasis: "regional leaders",
      lead: "In one decade, Arihant Apparels has grown into one of the Northeast's five largest garment distributors — and made its brand partners category leaders along the way.",
      primaryCta: { label: "Stock our brands", href: "/contact?intent=retailer" },
      secondaryCta: { label: "Partner as a brand", href: "/contact?intent=brand" },
    },
    sections: {
      mission: {
        heading: "Built to grow retailers",
        lead: "Our focus and mission is simple: foster the growth of retailers across the region. When your counter grows, our portfolio grows with it.",
      },
      exhibitions: {
        heading: "The busiest stand at every fair",
        lead: "Highest footfall in the last four regional garment exhibitions — because the trade knows where the season's winners will be.",
      },
      brands: { heading: "The Apparels portfolio" },
      faq: { heading: "Straight answers" },
    },
  },

  retail: {
    metaTitle: "Arihant Retail — Multi-brand Apparel Stores & EBOs, Northeast India",
    metaDescription:
      "Modern multi-brand apparel stores and exclusive brand outlets across Northeast India. 4 stores open, 2 in fit-out, 10 planned by FY 26-27 — built on Arihant's 35-year garment trade legacy.",
    hero: {
      threadLabel: "Arihant Retail · Founded 2023",
      heading: "Modern retail, run with thirty-five years of trade muscle",
      headingEmphasis: "trade muscle",
      lead: "Multi-brand stores and exclusive brand outlets, merchandised and managed by the house that has supplied the Northeast's best counters since the 1990s. Four stores open. Ten by FY 26-27.",
      primaryCta: { label: "Own a managed store", href: "/partner" },
      secondaryCta: { label: "Open your brand's EBO", href: "/contact?intent=brand" },
    },
    sections: {
      stores: {
        heading: "On the street today",
        lead: "Every store staffed, stocked and marketed by the Arihant Retail team.",
      },
      model: {
        heading: "The no-frills, zero-deadstock model",
        lead: "Asset-light stores, disciplined merchandising, and inventory risk engineered out of the owner's books — retail the way a distributor builds it.",
      },
      expansion: {
        heading: "Four today. Ten by FY 26-27.",
        lead: "Two stores are in fit-out right now, and EBOs are rolling out for national brand partners.",
      },
      cta: {
        heading: "Want one of the ten to be yours?",
        lead: "The next stores will be owned by partners and run by us. See how the model works.",
      },
    },
  },

  partner: {
    metaTitle: "Own a Managed Retail Store — Franchise with Arihant Retail",
    metaDescription:
      "Own a high-ROI, minimal-risk apparel store in Northeast India. Arihant Retail handles hiring, merchandising, marketing and CRM — zero deadstock, asset-light, proven ROIC record. Request franchise details.",
    hero: {
      threadLabel: "Arihant Retail · Partnership",
      heading: "Own the store. We run everything else.",
      lead: "A high-ROI, minimal-risk way to own apparel retail in India's ever-growing market: your capital and property, our thirty-five years of trade craft. No retail experience needed.",
      primaryCta: { label: "Request franchise details", href: "#inquiry" },
      secondaryCta: { label: "See how it works", href: "#how-it-works" },
    },
    sections: {
      promise: {
        heading: "What “fully managed” actually means",
        lead: "Every operating risk that sinks first-time store owners is carried by our team instead.",
        body: [
          "Hiring, training and managing the floor team — ours.",
          "Target-setting, merchandising and stock rotation — ours.",
          "Marketing: calibrated influencer and social campaigns, plus central CRM — ours.",
          "Deadstock: engineered out of your books entirely. Zero hassle.",
          "Yours: the store, the asset, and a transparent performance review rhythm.",
        ],
      },
      proof: {
        heading: "Tried, tested, and already trading",
        lead: "This isn't a concept deck. Four stores are open across Northeast India on this exact model, backed by a strong, proven ROIC record — and by the distribution house that has supplied the region's retailers for 35 years.",
      },
      how: { heading: "How it works", lead: "Four steps from inquiry to a trading store." },
      faq: { heading: "The questions every serious investor asks" },
      inquiry: {
        heading: "Request the franchise details",
        lead: "Tell us about your city and your space. We respond within two working days.",
      },
    },
  },

  brands: {
    metaTitle: "Brand Portfolio — 45+ National Apparel Brands Distributed in NE India",
    metaDescription:
      "The full Arihant portfolio: 45+ national apparel brands — menswear, womenswear, kidswear, denim, ethnic and sportswear — distributed to 250+ retailers across Northeast India.",
    hero: {
      threadLabel: "The Portfolio",
      heading: "Every label we put on the region's racks",
      lead: "Seventy-plus labels across menswear, womenswear, kidswear, denim, ethnic and sportswear — distributed by Arihant Marketing and Arihant Apparels to 250+ counters in seven states.",
      primaryCta: { label: "Distribute your brand in NE India", href: "/contact?intent=brand" },
      secondaryCta: { label: "Stock these brands", href: "/contact?intent=retailer" },
    },
    sections: {
      wall: { heading: "The portfolio" },
      cta: {
        heading: "Your brand belongs on this wall",
        lead: "We've made national labels into Northeast category leaders for thirty years. Let's talk about yours.",
      },
    },
  },

  about: {
    metaTitle: "About Arihant Group — 35 Years in the Northeast Garment Trade",
    metaDescription:
      "The Sancheti family's Arihant Group: from a 1990s Guwahati garment counter to CMAI's Best Distributor of India, NEGTA founder membership, three businesses and a growing retail chain.",
    hero: {
      threadLabel: "The House of Arihant",
      heading: "Three decades, three businesses, one family standard",
      lead: "Arihant is the Sancheti family's garment house in Guwahati: built on integrity, discipline and trust, recognised nationally, and still run by the people whose names are on the door.",
      primaryCta: { label: "Work with us", href: "/contact" },
    },
    sections: {
      story: {
        heading: "From one counter to the whole Northeast",
        body: [
          "The Arihant story starts in Guwahati's garment trade in the early 1990s, when the Sancheti family began supplying readymade garments to the city's retailers. What set the house apart was never scale — it was rhythm: visits that happened on schedule, claims that settled on paper, commitments that held.",
          "That rhythm built Arihant Marketing into the pioneer distributor of the Northeast, recognised in 2015 as CMAI's Best Distributor of India. It founded NEGTA alongside the region's leading traders. It built a second distribution house, Arihant Apparels, into one of the region's five largest within a decade.",
          "And in 2023 it carried the family into retail itself — modern multi-brand stores and exclusive brand outlets, run with the same discipline that made the distribution business a benchmark.",
        ],
      },
      values: {
        heading: "Integrity. Discipline. Trust.",
        lead: "Not wall art — operating rules. They are why a retailer in Imphal reorders without checking the invoice twice.",
      },
      leadership: {
        heading: "The people on the door",
        lead: "Sagar, Anand, Ajay and Shreyansh Sancheti — each running an arm of the house, each reachable by phone.",
      },
      timeline: { heading: "The years that built the house" },
    },
  },

  blog: {
    metaTitle: "Trade Notes — Garment Distribution & Retail in Northeast India",
    metaDescription:
      "Practical writing from the Arihant desk: choosing distributors, taking brands into Northeast India, and the economics of managed apparel retail.",
    hero: {
      threadLabel: "Trade Notes",
      heading: "Notes from thirty-five years in the trade",
      lead: "What we've learned moving garments across seven states — written for the retailers, brands and investors we work with.",
      primaryCta: { label: "Talk to us", href: "/contact" },
    },
    sections: {},
  },

  contact: {
    metaTitle: "Contact Arihant Group — Guwahati | Retail, Brand & Franchise Inquiries",
    metaDescription:
      "Reach Arihant Marketing, Arihant Apparels or Arihant Retail at Arihant Tower, Jyotikuchi, Guwahati. Phone, WhatsApp and email — or send an inquiry and get a response within two working days.",
    hero: {
      threadLabel: "Arihant Tower · Guwahati",
      heading: "Tell us what you're building",
      lead: "Retailer, brand or investor — the form below routes your inquiry to the right business. Prefer to talk? Every number on this page is answered by a Sancheti.",
      primaryCta: { label: "Send an inquiry", href: "#inquiry" },
    },
    sections: {
      form: { heading: "Send an inquiry" },
      direct: {
        heading: "Or reach us directly",
        lead: "All three businesses operate from Arihant Tower, Jyotikuchi, Guwahati — 781040.",
      },
    },
  },
};
