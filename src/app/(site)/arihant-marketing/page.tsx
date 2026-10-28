import type { Metadata } from "next";
import Link from "next/link";

import {
  Button,
  DrenchBand,
  FaqAccordion,
  JsonLd,
  LogoWall,
  SectionHeading,
  SectionReveal,
  VideoFeature,
} from "@/components";
import {
  getBusinesses,
  getFaqs,
  getMarketingSteps,
  getMarketingStrengths,
  getPageCopy,
  getPartners,
  getPhotoSlots,
  getSiteSettings,
} from "@/lib/content";
import {
  breadcrumbJsonLd,
  businessJsonLd,
  faqJsonLd,
  pageMetadata,
} from "@/lib/seo";
import { unitScope } from "@/lib/units";
import { FeatureHeroMedia } from "../_components/FeatureHeroMedia";
import { UnitHero } from "../_components/UnitHero";
import { CounterRail } from "./_components/CounterRail";

const UNIT = "marketing" as const;
const PATH = "/arihant-marketing";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPageCopy(UNIT);
  return pageMetadata({
    title: copy?.metaTitle ?? "",
    description: copy?.metaDescription ?? "",
    path: PATH,
  });
}

export default async function ArihantMarketingPage() {
  const [
    copy,
    businesses,
    partners,
    faqs,
    settings,
    strengths,
    steps,
    photos,
  ] = await Promise.all([
    getPageCopy(UNIT),
    getBusinesses(),
    getPartners(),
    getFaqs(UNIT),
    getSiteSettings(),
    getMarketingStrengths(),
    getMarketingSteps(),
    getPhotoSlots(),
  ]);

  if (!copy) return null;

  const business = businesses.find((b) => b.unit === UNIT);
  const contact = settings.contacts.find((c) => c.unit === UNIT);
  const marketingPartners = partners.filter((p) => p.unit === UNIT);
  const { hero, sections } = copy;
  const film = sections.film;
  const strengthsSection = sections.strengths;
  const how = sections.how;
  const brandsSection = sections.brands;
  const faqSection = sections.faq;
  const ctaSection = sections.cta;

  return (
    <div>
      {business && contact ? (
        <JsonLd data={businessJsonLd(settings, business, contact)} />
      ) : null}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: business?.name ?? "Arihant Marketing", path: PATH },
        ])}
      />

      {/* 1 — Hero (paper), one screen (change round 6): the claim, its two
          asks, the figures and the award beside a wide photograph run to the
          screen's edge. Change round 7: the charcoal award band that followed
          is gone, and its trophy is the small photograph laid on the wide
          one, beside the proof line that names it. Change round 13 (client's
          request): the trophy and the proof line are gone too, so the hero is
          the claim, its asks and figures beside the building alone. The
          award is still told on /recognition and the home awards band. */}
      {business ? (
        <UnitHero
          business={business}
          hero={hero}
          feature
          media={<FeatureHeroMedia main={photos.marketingHero} />}
        />
      ) : null}

      {/* 2 — Film (paper-shade): the event promo, click-to-play. This footage
          is Arihant Marketing's; it was previously mounted on the Apparels
          page, where it argued for the wrong business. The asset paths keep
          their original filenames. On the page's own band rhythm (am-band)
          and the shaded ground since round 7, so it reads as the first fold
          after the hero rather than more of it. */}
      {film ? (
        <section className="am-band bg-paper-shade" style={unitScope(UNIT)}>
          <div className="container-site">
            {/* One entrance for the band (change round 9): the heading's
                words, then the lead, while the film opens out of its mask. */}
            <SectionReveal className="m-flow grid gap-y-8 gap-x-16 md:grid-cols-12 md:items-center">
              <div className="m-flow-tight flex flex-col gap-5 md:col-span-5">
                <div>
                  <h2 data-sr="heading" className="t-h2 text-ink">
                    {film.heading}
                  </h2>
                  <div
                    aria-hidden="true"
                    className="mt-5"
                    style={{
                      height: 3,
                      width: "clamp(3rem, 8vw, 4.5rem)",
                      background: "var(--unit-accent)",
                    }}
                  />
                </div>
                {film.lead ? (
                  <p data-sr="lead" className="t-lead measure text-ink-soft">
                    {film.lead}
                  </p>
                ) : null}
              </div>
              <div data-sr="media" className="md:col-span-7">
                <VideoFeature
                  mp4="/videos/apparels-promo.mp4"
                  poster="/images/photos/apparels-promo-poster.jpg"
                  label="Play the Arihant Marketing film"
                  className="m-bleed"
                />
              </div>
            </SectionReveal>
          </div>
        </section>
      ) : null}

      {/* 3 — What a brand gets (paper): the same four strengths the home page
          argues to a retailer, argued here to a brand manager. Separate copy
          on purpose, so neither page reprints the other (AM10). Set as a 2x2
          spec plate beside a narrow heading rail rather than a fifth
          identical run of ruled rows. */}
      {strengths.length && strengthsSection ? (
        <section className="am-band bg-paper" style={unitScope(UNIT)}>
          <div className="container-site">
            <SectionReveal
              className="m-flow grid gap-x-12 gap-y-8 md:grid-cols-12"
              mobileRows="wipe"
            >
              <div className="md:col-span-4">
                <SectionHeading
                  heading={strengthsSection.heading}
                  lead={strengthsSection.lead}
                  sr
                />
              </div>
              <ul data-sr="rows" className="am-plate md:col-span-7 md:col-start-6">
                {strengths.map((row) => (
                  <li
                    key={row.title}
                    className="am-plate__cell m-ledger-row flex flex-col gap-2"
                  >
                    <h3 className="t-h4 text-ink">{row.title}</h3>
                    <p className="t-body text-ink-soft" style={{ maxWidth: "44ch" }}>
                      {row.text}
                    </p>
                  </li>
                ))}
              </ul>
            </SectionReveal>
          </div>
        </section>
      ) : null}

      {/* 4 — How we work with retailers (paper-shade), as a counter rail
          (change round 6, re-placed in round 7). The whole screen holds while
          it plays: the heading across the top; the four step titles, one slot
          for the active step's text and the retailer ask on the left; the
          drawing on the right, played by the scroll: the portfolio fills a
          counter, a rep visits, supply and credit notes land, the books
          settle. Numbers stay earned: this is a true sequence. The SIS
          pull-quote that stood before it and the "Why the Northeast needs a
          specialist" band after it went in round 7 at the client's request. */}
      {how && steps.length === 4 ? (
        <CounterRail
          heading={how.heading}
          lead={how.lead}
          steps={steps}
          cta={hero.primaryCta}
        />
      ) : null}

      {/* 5 — Brand wall (paper, run wide). The wall is capped at three rows so
          the section can be read without scrolling inside it; the labels a
          retailer is most likely to recognise lead (byPopularity, see
          src/content/partners.ts) and the link below carries the rest. */}
      {brandsSection ? (
        <section className="am-band bg-paper" style={unitScope(UNIT)}>
          <div className="container-wide">
            {/* The heading and link belong to the band's entrance; the wall's
                tiles keep their own batch reveal (a whole-block fade over the
                batching tiles used to run both at once). */}
            <SectionReveal className="m-flow flex flex-col gap-8">
              <SectionHeading
                heading={brandsSection.heading}
                lead={brandsSection.lead}
                sr
              />
              <LogoWall partners={marketingPartners} limit={18} />
              <p data-sr="item">
                <Link
                  href="/brands"
                  className="t-small font-semibold text-ink underline decoration-[var(--unit-accent)] decoration-2 underline-offset-4 hover:decoration-ink"
                >
                  See the full group portfolio &rarr;
                </Link>
              </p>
            </SectionReveal>
          </div>
        </section>
      ) : null}

      {/* 6 — FAQ (paper-shade). Deliberately the quiet fold before the close. */}
      {faqs.length ? (
        <section className="am-band bg-paper-shade">
          <div className="container-site">
            <SectionReveal className="m-flow grid gap-10 md:grid-cols-[1fr_1.4fr]">
              <div>
                <SectionHeading heading={faqSection?.heading ?? "Straight answers"} sr />
              </div>
              <FaqAccordion faqs={faqs} rows />
            </SectionReveal>
          </div>
          <JsonLd data={faqJsonLd(faqs)} />
        </section>
      ) : null}

      {/* 7 — CTA band (single vermillion drench), set across rather than down
          so the closing line and the ask share a line instead of queueing. */}
      <DrenchBand className="am-band">
        <div className="container-site m-flow flex flex-col gap-10 md:flex-row md:items-end md:justify-between md:gap-16">
          <div className="m-flow-tight flex flex-col gap-5">
            {ctaSection?.heading ? (
              <h2 data-drench-reveal className="t-h2" style={{ maxWidth: "20ch" }}>
                {ctaSection.heading}
              </h2>
            ) : null}
            {ctaSection?.lead ? (
              <p
                data-drench-reveal
                className="t-lead measure"
                style={{ color: "var(--_text-soft)" }}
              >
                {ctaSection.lead}
              </p>
            ) : null}
          </div>
          {/* Both funnels, each with its own destination, in the hero's own
              words (change round 9: the labels used to be typed here, so a
              Studio edit to the hero left the foot of the page saying
              something else). The loose phone number that used to sit here
              routed brand enquiries to a distribution desk by hand; the form
              tags the intent instead (AM12). */}
          <div
            data-drench-reveal
            className="m-cta flex shrink-0 flex-col items-start gap-4"
          >
            <Button
              href={hero.primaryCta.href}
              variant="onDark"
              size="lg"
              className="press"
            >
              {hero.primaryCta.label}
            </Button>
            {hero.secondaryCta ? (
              <a
                href={hero.secondaryCta.href}
                className="m-tap t-small underline-offset-4 hover:underline"
                style={{ color: "var(--_text-soft)" }}
              >
                {hero.secondaryCta.label}{" "}&rarr;
              </a>
            ) : null}
          </div>
        </div>
      </DrenchBand>
    </div>
  );
}
