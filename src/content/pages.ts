import type { PageCopy } from "./types";

/** Per-route copy. Sanity `page` documents mirror this; seed is the fallback. */
export const pages: Record<string, PageCopy> = {
  home: {
    metaTitle: "Garment Distribution & Retail, Northeast India | Arihant",
    metaDescription:
      "Arihant moves 45+ national apparel brands into 250+ retail counters across Northeast India, and now runs modern stores of its own. Partner with us.",
    hero: {
      heading: "The garment house behind the Northeast's best-stocked stores",
      headingEmphasis: "best-stocked",
      lead: "We move 45+ national apparel brands into 250+ retail counters across seven states, and now build and run modern stores of our own. Three businesses, one standard: integrity, discipline, trust.",
      primaryCta: { label: "Partner with us", href: "/contact" },
      secondaryCta: { label: "Meet the three businesses", href: "#businesses" },
    },
    sections: {
      why: {
        heading: "Why the trade trusts Arihant",
        lead: "CMAI named us Best Distributor of India in 2015. We earned it the slow way: 35 years without letting a season slip.",
      },
      businesses: {
        heading: "Three businesses, one family standard",
        lead: "Distribution built this house, and retail is extending it. Find the arm built for you.",
      },
      brands: {
        heading: "The brands we carry",
        lead: "45+ national brand partners across menswear, womenswear, kidswear and denim, on counters in all seven states.",
      },
      cta: {
        heading: "Bring your business to Arihant",
        lead: "Retailer, brand or investor: tell us what you're building, and the right Sancheti will call you back.",
      },
    },
  },

  marketing: {
    metaTitle: "Readymade Garments Distributor, Guwahati | Arihant Marketing",
    metaDescription:
      "CMAI's Best Distributor of India, 2015. 30+ years, 250+ retailers, 45+ brands and a 15,000 sq ft Guwahati warehouse. Become an Arihant retail partner.",
    hero: {
      heading: "The pioneer distributor of readymade garments in Northeast India",
      headingEmphasis: "pioneer",
      lead: "We have moved national brands into the region's counters for more than 30 years, and we still stand in every retailer's store at least once every 20 days. CMAI named us Best Distributor of India in 2015.",
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
          "A representative stands in your store at least once every 20 days. Reorders, claims and market feedback move face to face.",
          "Indents are picked and dispatched from 15,000 sq ft of organised Guwahati warehousing, on fixed timelines.",
          "Claims and settlements move on paper, on schedule, so your capital keeps rotating.",
        ],
      },
      sis: {
        heading: "A shop-in-shop team that plugs straight in",
        lead: "Our dedicated SIS team runs fixtures, planograms and replenishment for national brands: plug and play, AI-driven, data-backed.",
      },
      brands: {
        heading: "The labels we move",
        lead: "National menswear, womenswear and kidswear, all serviced from our Guwahati warehouse.",
      },
      faq: { heading: "Straight answers" },
    },
  },

  apparels: {
    metaTitle: "Apparel Distributor in Northeast India | Arihant Apparels",
    metaDescription:
      "Founded 2013. Among the 5 largest readymade garments distributors in Northeast India, building brands into category leaders. Stock our labels today.",
    hero: {
      heading: "The apparel distributor that builds category leaders",
      headingEmphasis: "category leaders",
      lead: "Founded in 2013 by Ajay Sancheti, Arihant Apparels has grown into one of the five largest garment distributors in Northeast India. Several of our brand partners now lead their categories here.",
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
    },
  },

  retail: {
    metaTitle: "Multi-brand Retail Stores in Guwahati | Arihant Retail",
    metaDescription:
      "Modern multi-brand apparel stores and EBOs across Northeast India: 4 open, 2 in fit-out, 10 planned by FY 26-27 on 35 years of trade. Own one with us.",
    hero: {
      heading: "Multi-brand retail, run on 35 years of trade muscle",
      headingEmphasis: "trade muscle",
      lead: "We merchandise and manage modern stores and exclusive brand outlets across the Northeast: 4 trading today, 2 in fit-out, 10 planned by FY 26-27. The house that has supplied the region's counters since the 1990s now runs its own.",
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
        lead: "Asset-light stores, disciplined merchandising, and inventory risk kept off the owner's books. This is retail the way a distributor builds it.",
      },
      expansion: {
        heading: "4 today. 10 by FY 26-27.",
        lead: "2 stores are in fit-out right now, and EBOs are rolling out for national brand partners.",
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
      lead: "A managed apparel store in Northeast India: your capital and property, our 35 years of trade craft. No retail experience needed.",
      primaryCta: { label: "Request franchise details", href: "#inquiry" },
      secondaryCta: { label: "See how it works", href: "#how-it-works" },
    },
    sections: {
      promise: {
        heading: "What “fully managed” actually means",
        lead: "Every operating risk that sinks first-time store owners is carried by our team instead.",
        body: [
          "Hiring, training and managing the floor team: ours.",
          "Target-setting, merchandising and stock rotation: ours.",
          "Marketing, calibrated influencer and social campaigns, and the central CRM: ours.",
          "Deadstock: engineered out of your books entirely.",
          "Yours: the store, the asset, and a clear performance review rhythm.",
        ],
      },
      proof: {
        heading: "Tried, tested, already trading",
        lead: "4 stores already trade on this exact model across Northeast India, backed by a strong, proven ROIC record. Behind them stands the house that has supplied the region's retailers for 35 years.",
      },
      how: { heading: "How it works", lead: "Four steps from inquiry to a trading store." },
      faq: { heading: "The questions serious investors ask" },
      inquiry: {
        heading: "Request the franchise details",
        lead: "Tell us your city and your space. We respond within two working days.",
      },
    },
  },

  brands: {
    metaTitle: "Apparel Brands Distributed Across Northeast India | Arihant",
    metaDescription:
      "45+ national apparel brands in menswear, womenswear, kidswear, denim and ethnic wear, distributed to 250+ Northeast retailers. Put them on your racks.",
    hero: {
      heading: "The apparel brands we put on the Northeast's racks",
      lead: "Menswear, womenswear, kidswear, denim, ethnic and sportswear: 45+ national brand partners, distributed to 250+ counters in seven states by Arihant Marketing and Arihant Apparels.",
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
      "From a 1990s Guwahati counter to CMAI's Best Distributor of India: the Sancheti family's three businesses, still run by the names on the door. Meet us.",
    hero: {
      heading: "35 years, three businesses, one name on the door",
      lead: "Arihant is the Sancheti family's garment house in Guwahati, built on integrity, discipline and trust. It is still run by the people who answer its phones.",
      primaryCta: { label: "Work with us", href: "/contact" },
    },
    sections: {
      story: {
        heading: "From one counter to the whole Northeast",
        body: [
          "The Arihant story begins in Guwahati's garment trade in the early 1990s, when the Sancheti family started supplying readymade garments to the city's retailers. Scale came later. What set the house apart first was rhythm: visits that happened on schedule, claims that settled on paper, commitments that held.",
          "That rhythm built Arihant Marketing into the pioneer distributor of the Northeast, named Best Distributor of India by CMAI in 2015. The house helped found NEGTA alongside the region's leading traders. A second distribution business, Arihant Apparels, grew into one of the region's five largest within a decade.",
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

  blog: {
    metaTitle: "Trade Notes | Garment Distribution & Retail, Northeast India",
    metaDescription:
      "Practical notes from 35 years in the Northeast garment trade: choosing distributors, entering the region, managed retail. Written for the counter.",
    hero: {
      heading: "Notes from 35 years in the trade",
      lead: "What we have learned moving garments across seven states, written for the retailers, brands and investors we work with.",
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
