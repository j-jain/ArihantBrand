import { storeStreetCopy } from "@/content/sectionArt";
import type { Faq } from "@/content/types";

/** The storefront street's three stages: the Apparels brand FAQ's own path
 *  ("We are a brand. What does the first season look like?"), read from the
 *  live FAQ when it is there, with the seed wording as the fallback, under the
 *  section's own stage titles. */
export function stagesFrom(faqs: Faq[]) {
  const faq = faqs.find((f) => /first season/i.test(f.question) && f.bullets?.length === 3);
  const lead = faq ? faq.answer.replace(/:\s*$/, ".") : storeStreetCopy.fallback.lead;
  const bullets = faq?.bullets ?? storeStreetCopy.fallback.bullets;
  return {
    lead,
    stages: storeStreetCopy.titles.map((title, i) => ({ title, text: bullets[i] })),
  };
}
