import type { Metadata } from "next";
import Link from "next/link";

import {
  Button,
  DrenchBand,
  FaqAccordion,
  JsonLd,
  LogoWall,
  ParallaxImage,
  SectionHeading,
  SectionReveal,
} from "@/components";
import {
  getBusinesses,
  getFaqs,
  getPageCopy,
  getPartners,
  getPhotoSlots,
  getSiteSettings,
  getTeam,
} from "@/lib/content";
import {
  breadcrumbJsonLd,
  businessJsonLd,
  faqJsonLd,
  pageMetadata,
} from "@/lib/seo";
import { unitScope } from "@/lib/units";
import { storeStreetCopy } from "@/content/sectionArt";
import { FeatureHeroMedia } from "../_components/FeatureHeroMedia";
import { UnitHero } from "../_components/UnitHero";
import { StoreStreet } from "./_components/StoreStreet";
import { stagesFrom } from "./_components/streetStages";

const UNIT = "apparels" as const;
const PATH = "/arihant-apparels";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPageCopy(UNIT);
  return pageMetadata({
    title: copy?.metaTitle ?? "",
    description: copy?.metaDescription ?? "",
    path: PATH,
  });
}

export default async function ArihantApparelsPage() {
  const [copy, businesses, partners, faqs, settings, team, photos] = await Promise.all([
    getPageCopy(UNIT),
    getBusinesses(),
    getPartners(),
    getFaqs(UNIT),
    getSiteSettings(),
    getTeam(UNIT),
    getPhotoSlots(),
  ]);

  if (!copy) return null;

  const business = businesses.find((b) => b.unit === UNIT);
  const contact = settings.contacts.find((c) => c.unit === UNIT);
  const apparelsPartners = partners.filter((p) => p.unit === UNIT);
  const { hero, sections } = copy;
  const mission = sections.mission;
  const teamSection = sections.team;
  const brandsSection = sections.brands;
  const faqSection = sections.faq;
  const ctaSection = sections.cta;

  // The storefront street tells the brand FAQ's own three-stage path.
  const growth = stagesFrom(faqs);

  return (
    <div>
      {business && contact ? (
        <JsonLd data={businessJsonLd(settings, business, contact)} />
      ) : null}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: business?.name ?? "Arihant Apparels", path: PATH },
        ])}
      />

      {/* 1 — Hero (paper), one screen (change round 6): the claim, its two
          asks and the figures beside the team on the warehouse floor, with
          the 2024 fair laid over it. Both are Studio photo slots. */}
      {business ? (
        <UnitHero
          business={business}
          hero={hero}
          feature
          media={
            <FeatureHeroMedia
              main={photos.apparelsHero}
              inset={photos.apparelsHeroInset}
              caption={photos.apparelsHeroInset.caption}
            />
          }
        />
      ) : null}

      {/* 2 — Mission split (ink accent-wash ground): garment-rack image + the mission */}
      <section
        className="section-pad"
        style={{
          ...unitScope(UNIT),
          background: "var(--unit-accent-wash)",
          borderBlock: "1px solid var(--unit-accent-line)",
        }}
      >
        <div className="container-site">
          {/* One entrance (change round 9): the photograph opens out of its
              mask while the heading's words rise, then the line and the copy.
              The mask sits on a wrapper, never on the parallax frame, which
              owns its own transforms. */}
          <SectionReveal className="m-flow grid gap-y-8 gap-x-16 md:grid-cols-12 md:items-start">
            <div data-sr="media" className="md:col-span-5">
              <ParallaxImage
                src={photos.apparelsWarehouse.src}
                alt={photos.apparelsWarehouse.alt}
                ratio={photos.apparelsWarehouse.ratio}
                sizes="(max-width: 767px) 100vw, 40vw"
                className="m-ar-4-3 border border-line"
                tilt
                mBleed
              />
            </div>
            <div className="m-flow flex flex-col gap-6 md:col-span-7">
              <div>
                <h2 data-sr="heading" className="t-h2 text-ink">
                  {mission.heading}
                </h2>
                <div
                  aria-hidden="true"
                  className="mt-5"
                  style={{ height: 3, width: "clamp(3rem, 8vw, 4.5rem)", background: "var(--unit-accent)" }}
                />
              </div>
              {mission.lead ? (
                <p
                  data-sr="lead"
                  className="font-display measure text-ink"
                  style={{ fontStyle: "italic", fontSize: "var(--text-h3)", lineHeight: 1.3 }}
                >
                  {mission.lead}
                </p>
              ) : null}
              {/* The section's own paragraph (change round 9); a Studio
                  document without one prints the business summary, as the
                  page always did. */}
              {mission.body?.length ? (
                mission.body.map((paragraph) => (
                  <p key={paragraph} data-sr="item" className="t-lead measure text-ink-soft">
                    {paragraph}
                  </p>
                ))
              ) : business ? (
                <p data-sr="item" className="t-lead measure text-ink-soft">
                  {business.summary}
                </p>
              ) : null}
              {/* The retailer ask, inline where the mission has just been made
                  (AA4). */}
              <div data-sr="item" className="m-cta mt-1">
                <Button href={hero.primaryCta.href} variant="primary" size="lg" className="press">
                  {hero.primaryCta.label}
                </Button>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* The film that used to sit here is Arihant Marketing's event footage,
          not Apparels', so it moved to /arihant-marketing. The asset keeps its
          original filename. */}

      {/* 3b — Team (charcoal, change round 10): the real people who run it.
          It stood on the same accent wash as the mission above it, two gray
          bands back to back once the film left; the page's dark band now
          sits here, the home cadence (paper, shade, charcoal) on this page. */}
      {team.length ? (
        <section className="section-pad on-dark">
          <SectionReveal
            className="container-site m-flow flex flex-col gap-12"
            from="left"
            mobileRows="wipe"
          >
            <SectionHeading heading={teamSection.heading} lead={teamSection.lead} sr onDark />
            <div className="m-flow grid gap-y-10 gap-x-16 md:grid-cols-12 md:items-start">
              <div data-sr="media" className="md:col-span-6">
                <ParallaxImage
                  src={photos.apparelsTeam.src}
                  alt={photos.apparelsTeam.alt}
                  ratio={photos.apparelsTeam.ratio}
                  sizes="(max-width: 767px) 100vw, 46vw"
                  className="border border-line-dark"
                  tilt
                  mBleed
                />
              </div>
              <ul data-sr="rows" className="flex flex-col border-t border-line-dark md:col-span-6">
                {team.map((member) => (
                  <li
                    key={member.name}
                    className="m-ledger-row flex items-baseline justify-between gap-4 border-b border-line-dark py-4"
                  >
                    <span
                      className="font-sans text-on-charcoal"
                      style={{ fontWeight: 650, fontSize: "1.02rem", lineHeight: 1.3 }}
                    >
                      {member.name}
                    </span>
                    <span className="t-small max-w-[13rem] text-right text-on-charcoal-soft">
                      {member.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </SectionReveal>
        </section>
      ) : null}

      {/* 4 — Storefront street (paper, change round 6): how a label becomes a
          category leader, drawn rather than claimed. The drawing holds beside
          the three stages (the brand FAQ's own path) and is scrubbed by the
          scroll: anchors seeded from the warehouse, a fair lights more stores,
          a shop-in-shop counter opens up in detail. Illustrative, and says so.
          It replaces the category-leaders pull-line and its two facts. */}
      <StoreStreet heading={storeStreetCopy.heading} lead={growth.lead} stages={growth.stages} />

      {/* 5 — Brand wall (paper-shade) */}
      <section className="section-pad bg-paper-shade" style={unitScope(UNIT)}>
        <div className="container-wide">
          <SectionReveal className="m-flow flex flex-col gap-8">
            <SectionHeading heading={brandsSection.heading} lead={brandsSection.lead} sr />
            <LogoWall partners={apparelsPartners} />
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

      {/* 6 — FAQ (paper) — renders only when the CMS has apparels FAQs */}
      {faqs.length ? (
        <section className="section-pad bg-paper">
          <div className="container-site">
            <SectionReveal className="m-flow grid gap-10 md:grid-cols-[1fr_1.4fr]">
              <div>
                <SectionHeading heading={faqSection?.heading ?? ""} sr />
              </div>
              <FaqAccordion faqs={faqs} rows />
            </SectionReveal>
          </div>
          <JsonLd data={faqJsonLd(faqs)} />
        </section>
      ) : null}

      {/* 7 — CTA band (single vermillion drench) */}
      <DrenchBand className="section-pad">
        <div className="container-site m-flow flex max-w-3xl flex-col gap-6">
          {ctaSection?.heading ? (
            <h2 data-drench-reveal className="t-h2">
              {ctaSection.heading}
            </h2>
          ) : null}
          {ctaSection?.lead ? (
            <p data-drench-reveal className="t-lead" style={{ color: "var(--_text-soft)" }}>
              {ctaSection.lead}
            </p>
          ) : null}
          {/* The hero's two asks, in the hero's own words (change round 9). */}
          <div data-drench-reveal className="m-cta mt-1 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Button href={hero.primaryCta.href} variant="onDark" size="lg" className="press">
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
