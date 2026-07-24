import { atLeast, facts, phrase } from "./facts";
import type { PageCopy } from "./types";

/** Per-route copy. Sanity `page` documents mirror this; seed is the fallback.
 *
 *  Every figure below interpolates from `facts.ts`. Do not type a number in
 *  by hand: that is how group-level and unit-level claims drifted apart. */
export const pages: Record<string, PageCopy> = {
  home: {
    metaTitle: "Garment Distributor in Northeast India | Arihant Group",
    metaDescription: `The garment house of Northeast India: ${phrase.groupLabels} national labels, ${phrase.groupRetailers} retail counters, seven states, and managed stores of our own. Guwahati since the 1990s.`,
    hero: {
      heading: "The garment house of Northeast India",
      headingEmphasis: "garment house",
      lead:
        "We stock the Northeast's clothing stores with national brands, out of Guwahati since the 1990s.",
      primaryCta: { label: "Partner with us", href: "/contact" },
      secondaryCta: { label: "The three businesses", href: "#businesses" },
    },
    sections: {
      proof: {
        heading: "What the record says",
        lead: `Best Distributor of India, CMAI ${facts.marketing.awardYear}. The same discipline runs every route out of Guwahati today.`,
      },
      why: {
        heading: "Why the trade buys from us",
        lead: "Four things we are held to, season after season.",
      },
      businesses: {
        heading: "Three businesses, one standard",
        lead: "Two distribution houses and a retail arm. Start with the one that matches your business.",
      },
      systems: {
        heading: "The systems behind the visits",
        lead: "Buying, replenishment and reporting run on data rather than memory.",
        body: [
          "None of this is visible from your counter. That is the point of it.",
        ],
      },
      brands: {
        heading: "The brands we carry",
        lead: `${phrase.groupLabels} national labels across menswear, womenswear, kidswear, denim, ethnic and footwear, on counters in all seven states.`,
      },
      notes: {
        heading: "Trade Notes",
        lead: "Field notes from the road, written for retailers, brands and first-time store owners.",
      },
      voice: {
        heading: "What a retail partner says",
      },
      cta: {
        heading: "Bring your business to Arihant",
        lead: "Retailer, brand or investor. Tell us which, and the right person calls you back within one working day.",
      },
    },
  },

  marketing: {
    metaTitle: "Garment Distributor in Guwahati | Arihant Marketing",
    metaDescription: `Northeast India's pioneer readymade garments distributor: ${atLeast(facts.marketing.years)} years, ${phrase.marketingRetailers} retailers, ${phrase.marketingBrands} brand partners, ${phrase.marketingWarehouse} Guwahati warehouse, ${phrase.visitCycle} visit cycles.`,
    hero: {
      heading: "The pioneer distributor of readymade garments in Northeast India",
      headingEmphasis: "pioneer",
      lead: `For more than ${facts.marketing.years} years we have moved national brands into the region's counters, and we still stand in every retailer's store at least once every ${phrase.visitCycle}.`,
      primaryCta: { label: "Become a retail partner", href: "/contact?intent=retailer" },
      secondaryCta: { label: "Distribute your brand", href: "/contact?intent=brand" },
    },
    sections: {
      award: {
        heading: "Best Distributor of India, 2015",
        lead: "Awarded by the Clothing Manufacturers Association of India. In this trade, that is the reference that needs no explaining.",
      },
      strengths: {
        heading: "What a brand gets from us",
        lead: "Four things, and none of them need building from scratch.",
      },
      how: {
        heading: "How we work with retailers",
        lead: `Four steps, on a ${phrase.visitCycle} cycle.`,
        body: [
          `We map your counter to the right mix from our ${phrase.marketingBrands}-brand portfolio: depth where your customer shops, nothing that will sit.`,
          "A representative stands in your store on a fixed cycle. Reorders, claims and market feedback move face to face.",
          `Indents are picked and dispatched from ${phrase.marketingWarehouse} of organised Guwahati warehousing, on fixed timelines.`,
          "Claims and settlements move on paper, on schedule, so your capital keeps rotating.",
        ],
      },
      sis: {
        heading: "Shop-in-shop counters, without the investment",
        lead: "Brands entering the Northeast do not need to build a field force or fund a fit-out. Our shop-in-shop (SIS) counters need no fixture investment from you, and staff are optional.",
      },
      brands: {
        heading: "The labels we move",
        lead: "National menswear, womenswear and kidswear, all serviced from our Guwahati warehouse.",
      },
      faq: { heading: "Straight answers" },
      cta: {
        heading: `Put ${facts.marketing.years} years of distribution behind your counter.`,
        lead: `${phrase.marketingBrands} national brands, a ${phrase.marketingWarehouse} Guwahati warehouse, and every retailer seen face to face, cycle after cycle.`,
      },
    },
  },

  apparels: {
    metaTitle: "Apparel Distributor in Northeast India | Arihant Apparels",
    metaDescription: `Founded ${facts.apparels.established}. A Guwahati apparel distributor carrying ${phrase.apparelsBrands} labels across Northeast India and building several of them into category leaders. Stock our labels today.`,
    hero: {
      heading: "The apparel distributor that builds category leaders",
      headingEmphasis: "category leaders",
      lead: `Founded in ${facts.apparels.established} by Ajay Sancheti. We have built several brands into category leaders across the Northeast, and we carry ${phrase.apparelsBrands} labels today.`,
      primaryCta: { label: "Stock our brands", href: "/contact?intent=retailer" },
      secondaryCta: { label: "Partner as a brand", href: "/contact?intent=brand" },
    },
    sections: {
      mission: {
        heading: "Built to grow retailers",
        lead: "Our job is to grow the counters we sell to. When your store grows, our portfolio grows with it.",
      },
      film: {
        heading: "Inside Arihant Apparels",
        lead: "A look at the team, the warehouse and the fairs where the season's winners get picked.",
      },
      team: {
        heading: "The people who run it",
        lead: "Ajay Sancheti built Arihant Apparels on trust, close relationships and mutual growth. Adding value for every retailer and brand partner is the standard the whole team works to.",
      },
      brands: {
        heading: "The Apparels portfolio",
        lead: "Home to the Northeast's leading ladies' ethnic labels, with westernwear, kidswear and footwear alongside, distributed across the region from our Guwahati warehouse.",
      },
      faq: { heading: "Straight answers" },
      cta: {
        heading: "Grow with the house that builds category leaders.",
        lead: `Founded in ${facts.apparels.established}, running a ${phrase.apparelsWarehouse} Guwahati warehouse, and holding the busiest stand at the region's last ${facts.apparels.exhibitions} garment fairs.`,
      },
    },
  },

  retail: {
    metaTitle: "Multi-brand Retail Stores in Guwahati | Arihant Retail",
    metaDescription: `Modern multi-brand apparel stores across Northeast India: ${facts.retail.storesOpen} open, ${facts.retail.storesFitOut} in fit-out, ${facts.retail.storesPlanned} planned by ${facts.retail.planHorizon}. Zero-deadstock, asset-light, fully managed.`,
    hero: {
      heading: "We run stores of our own",
      headingEmphasis: "our own",
      lead: `Modern multi-brand stores across Northeast India, staffed, stocked and marketed by our team. ${facts.retail.storesOpen} open, ${facts.retail.storesFitOut} in fit-out, ${facts.retail.storesPlanned} planned by ${facts.retail.planHorizon}.`,
      primaryCta: { label: "Own a managed store", href: "/partner" },
      secondaryCta: { label: "Put your brand in our stores", href: "/contact?intent=brand" },
    },
    sections: {
      stores: {
        heading: "On the street today",
        lead: "Where our stores are, and which are still in fit-out.",
      },
      model: {
        heading: "The zero-deadstock model",
        lead: "The store carries what sells and returns what does not. Buying, rotation and markdowns stay with us, which is the whole reason a first store survives its first bad season.",
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
        lead: `${facts.retail.storesOpen} stores already trade on this model, backed by a proven ROIC record and by the house that supplies the region's retailers.`,
      },
      how: { heading: "How it works", lead: "Four steps from inquiry to a trading store. FOCO, done properly." },
      faq: { heading: "The questions serious investors ask" },
      inquiry: {
        heading: "Request the franchise details",
        lead: "Tell us your city and your space. We will call you within one working day.",
      },
    },
  },

  brands: {
    metaTitle: `${phrase.groupLabels} Apparel Brands Distributed in Northeast India | Arihant`,
    metaDescription: `Browse the ${phrase.groupLabels} national apparel labels Arihant distributes across Northeast India: menswear, womenswear, kidswear, denim, ethnic, footwear. Put them on your racks.`,
    hero: {
      heading: "The apparel brands we put on the Northeast's racks",
      lead: `Menswear, womenswear, kidswear, denim, ethnic and footwear. ${phrase.groupLabels} national labels distributed to counters in all seven states by Arihant Marketing and Arihant Apparels.`,
      primaryCta: { label: "Distribute your brand", href: "/contact?intent=brand" },
      secondaryCta: { label: "Stock these labels", href: "/contact?intent=retailer" },
    },
    sections: {
      wall: { heading: "The portfolio" },
      cta: {
        heading: "Your brand belongs on this wall",
        lead: `We have built national labels into Northeast category leaders for ${facts.marketing.years} years. Talk to us about yours.`,
      },
    },
  },

  about: {
    metaTitle: `About Arihant Group | ${facts.group.years} Years in the Northeast Trade`,
    metaDescription:
      "From a 1990s Guwahati counter to three businesses run by the Sancheti family: distribution, wholesale and modern retail, still answered by the names on the door.",
    hero: {
      heading: `${facts.group.years} years, three businesses, one name on the door`,
      lead: "Arihant is the Sancheti family's garment house in Guwahati, still run by the people who answer its phones.",
      primaryCta: { label: "Work with us", href: "/contact" },
    },
    sections: {
      story: {
        heading: "From one counter to the whole Northeast",
        lead: "Kept commitments first. Scale after.",
        body: [
          "The Sancheti family started supplying readymade garments to Guwahati's retailers in the early 1990s. Scale came later. What set the house apart first was simpler than scale: visits happened on schedule, claims settled on paper, and commitments held.",
          "That rhythm built Arihant Marketing into the pioneer distributor of the Northeast and made the house a founder member of NEGTA alongside the region's leading traders. A second distribution business, Arihant Apparels, followed in 2013 and built several national labels into category leaders here.",
          "In 2023 the family carried the same discipline into retail itself: modern multi-brand stores staffed and stocked by the house's own team.",
        ],
      },
      values: {
        heading: "Integrity. Discipline. Trust.",
        lead: "These are operating rules, not wall art. They are why a retailer in Imphal reorders without checking the invoice twice.",
      },
      leadership: {
        heading: "The people on the door",
        lead: "Sagar, Anand, Ajay and Shreyansh Sancheti each run an arm of the house.",
      },
      timeline: { heading: "The years that built the house" },
    },
  },

  recognition: {
    metaTitle: "Awards & Testimonials | Arihant Group Recognition",
    metaDescription:
      "CMAI's Best Distributor of India 2015, NEGTA founder membership, and what retailers, brands and store owners across the Northeast say about Arihant.",
    hero: {
      heading: "Awards, and who gave them",
      headingEmphasis: "Awards",
      lead: `One national award, one founding membership, and ${facts.apparels.exhibitions} regional fairs led on footfall. Retailer references are available on a call.`,
      primaryCta: { label: "Work with us", href: "/contact" },
    },
    sections: {
      awards: { heading: "The trophy case", lead: "A short list. Every entry checkable." },
      gallery: {
        heading: "In the cabinet",
        lead: "Certificates and trophies from national brands and trade fairs, photographed as they sit on the shelf.",
      },
      milestones: {
        heading: "When each of these happened",
        lead: "The same years the About page tells as a story, set out here as dates you can check an award against.",
      },
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
      "Reach Arihant Marketing, Arihant Apparels or Arihant Retail at Arihant Tower, Jyotikuchi, Guwahati. Call, WhatsApp or write; we call back within one working day.",
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
