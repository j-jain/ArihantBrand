import type { Metadata } from "next";
import Link from "next/link";

import {
  Button,
  CurtainReveal,
  DrenchBand,
  FaqAccordion,
  JsonLd,
  LogoWall,
  ParallaxImage,
  Reveal,
  SectionHeading,
  StaggerGroup,
} from "@/components";
import {
  getBusinesses,
  getFaqs,
  getMarketingReasons,
  getMarketingSteps,
  getMarketingStrengths,
  getPageCopy,
  getPartners,
  getSiteSettings,
  pointById,
} from "@/lib/content";
import {
  breadcrumbJsonLd,
  businessJsonLd,
  faqJsonLd,
  pageMetadata,
} from "@/lib/seo";
import { facts } from "@/content/facts";
import { photoSlots } from "@/content/images";
import { unitScope } from "@/lib/units";
import { UnitHero } from "../_components/UnitHero";

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
    reasons,
  ] = await Promise.all([
    getPageCopy(UNIT),
    getBusinesses(),
    getPartners(),
    getFaqs(UNIT),
    getSiteSettings(),
    getMarketingStrengths(),
    getMarketingSteps(),
    getMarketingReasons(),
  ]);

  if (!copy) return null;

  const business = businesses.find((b) => b.unit === UNIT);
  const contact = settings.contacts.find((c) => c.unit === UNIT);
  const marketingPartners = partners.filter((p) => p.unit === UNIT);
  const { hero, sections } = copy;
  const award = sections.award;
  const strengthsSection = sections.strengths;
  const how = sections.how;
  const specialist = sections.specialist;
  const brandsSection = sections.brands;
  const faqSection = sections.faq;
  const ctaSection = sections.cta;

  // Content is selected by stable id, never by matching the copy — a rewrite
  // must never be able to blank a section.
  const twentyDayPromise = pointById(business, "visit-cycle");

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

      {/* 1 — Hero (paper): lockup, headline, then the numbers full-measure */}
      {business ? <UnitHero business={business} hero={hero} /> : null}

      {/* 2 — Award (charcoal, full-bleed). The band used to be a 9.5rem painted
          "2015" floating in five empty columns over a stock godown dimmed to
          30%, which read as a title slide rather than a citation. It now stands
          on the trophy itself: a real object we hold, lit against charcoal,
          with the year set small as the date line it always was. One
          CurtainReveal, then the band lands still. */}
      {award ? (
        <section className="am-award on-dark">
          <CurtainReveal className="container-site w-full">
            <div className="m-flow grid items-center gap-x-10 gap-y-8 lg:grid-cols-12">
              <ParallaxImage
                src={photoSlots.marketingAward.src}
                alt={photoSlots.marketingAward.alt}
                ratio={photoSlots.marketingAward.ratio}
                sizes="(max-width: 1023px) 100vw, 30vw"
                className="am-award__object lg:col-span-4"
                parallax={false}
                tilt
              />
              <div className="m-flow-tight flex flex-col gap-5 lg:col-span-7 lg:col-start-6">
                <p className="am-award__date t-label text-on-charcoal-soft">
                  {facts.marketing.awardYear}
                </p>
                <h2 className="t-h2 text-on-charcoal">{award.heading}</h2>
                <div
                  aria-hidden="true"
                  style={{
                    height: 3,
                    width: "clamp(3rem, 8vw, 4.5rem)",
                    background: "var(--vermillion)",
                  }}
                />
                {award.lead ? (
                  <p className="t-lead measure text-on-charcoal-soft">{award.lead}</p>
                ) : null}
                <p>
                  <Link
                    href="/recognition"
                    className="m-tap t-small font-semibold text-on-charcoal underline decoration-[var(--vermillion)] decoration-2 underline-offset-4 hover:decoration-[var(--on-charcoal)]"
                  >
                    See the trophy case &rarr;
                  </Link>
                </p>
              </div>
            </div>
          </CurtainReveal>
        </section>
      ) : null}

      {/* 2b — What a brand gets (paper-shade): the same four strengths the home
          page argues to a retailer, argued here to a brand manager. Separate
          copy on purpose, so neither page reprints the other (AM10). Set as a
          2x2 spec plate beside a narrow heading rail rather than a fifth
          identical run of ruled rows. */}
      {strengths.length && strengthsSection ? (
        <section className="am-band bg-paper-shade" style={unitScope(UNIT)}>
          <div className="container-site">
            <div className="m-flow grid gap-x-12 gap-y-8 lg:grid-cols-12">
              <Reveal variant="fade" className="lg:col-span-4">
                <SectionHeading
                  heading={strengthsSection.heading}
                  lead={strengthsSection.lead}
                />
              </Reveal>
              <StaggerGroup
                as="ul"
                from="up"
                className="am-plate lg:col-span-7 lg:col-start-6"
                stagger={0.08}
                mLedger
              >
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
              </StaggerGroup>
            </div>
          </div>
        </section>
      ) : null}

      {/* 3a — The promise (paper): one idea, the widest air on the page, and
          the godown running off the right edge of the viewport.

          The promise and the four steps used to share one <section> with an
          internal seam, on the argument that the claim and the cycle behind it
          are one thought. Together they stood 1,274px on a laptop, so a reader
          had to scroll up and down to hold either half. They are two folds now,
          and the ground changes underneath them to say so. */}
      {twentyDayPromise ? (
        <section className="bg-paper" style={unitScope(UNIT)}>
          <div className="am-promise">
            <div className="am-promise__copy container-site">
              <Reveal variant="clip" className="m-pull flex flex-col gap-6">
                <span
                  aria-hidden="true"
                  className="block"
                  style={{
                    height: 3,
                    width: "clamp(3rem, 8vw, 4.5rem)",
                    background: "var(--vermillion)",
                  }}
                />
                <blockquote
                  className="font-display text-ink"
                  style={{
                    fontSize: "var(--text-display)",
                    fontWeight: 700,
                    lineHeight: 1.08,
                    letterSpacing: "-0.015em",
                    textWrap: "balance",
                    maxWidth: "17ch",
                  }}
                >
                  {twentyDayPromise}
                </blockquote>
              </Reveal>
            </div>

            {/* The wrapper carries the container padding; mBleed cancels that
                padding from the frame inside it. Putting both on one element
                makes the negative margin expand a box that is already full
                width, which scrolls the page sideways on a phone. */}
            <div className="am-promise__photo">
              <ParallaxImage
                src={photoSlots.marketingWarehouse.src}
                alt={photoSlots.marketingWarehouse.alt}
                ratio={photoSlots.marketingWarehouse.ratio}
                sizes="(max-width: 1023px) 100vw, 46vw"
                className="m-ar-4-3 border border-line"
                tilt
                mBleed
              />
            </div>
          </div>
        </section>
      ) : null}

      {/* 3b — the sequence itself (paper-shade). Four steps read across, not
          down: this is the one place on the page numbers are earned. */}
      {how && steps.length ? (
        <section className="bg-paper-shade" style={unitScope(UNIT)}>
          <div className="am-how__steps container-site m-flow flex flex-col gap-10">
            <Reveal variant="fade">
              <SectionHeading heading={how.heading} lead={how.lead} />
            </Reveal>

            <StaggerGroup
              as="ol"
              from="up"
              className="m-am-steps grid gap-x-8 gap-y-9 md:grid-cols-2 lg:grid-cols-4"
              stagger={0.1}
              mLedger
            >
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  className="m-am-step flex flex-col gap-2 border-t border-line pt-5"
                >
                  <span
                    aria-hidden="true"
                    className="font-display text-vermillion-deep"
                    style={{
                      fontVariantNumeric: "tabular-nums",
                      fontSize: "var(--text-h3)",
                      lineHeight: 1,
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="t-h4 text-ink">{step.title}</h3>
                  <p className="t-body text-ink-soft">{step.text}</p>
                </li>
              ))}
            </StaggerGroup>

            {/* The retailer ask, placed after the reader has seen how the cycle
                actually works rather than before (AM8). */}
            <div className="m-cta">
              <Button
                href={hero.primaryCta.href}
                variant="primary"
                size="lg"
                className="press"
              >
                {hero.primaryCta.label}
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      {/* 3c — Why a specialist (charcoal): written for a national brand manager
          weighing whether the region needs its own partner at all (X3). Four
          parallel arguments, so they carry named lead-ins and step down the
          measure rather than running as numbered rows. */}
      {specialist && reasons.length ? (
        <section className="am-band on-dark">
          <div className="container-site m-flow flex flex-col gap-[clamp(1.5rem,3vw,2.25rem)]">
            <div className="grid items-end gap-x-12 gap-y-10 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <SectionHeading
                  heading={specialist.heading}
                  lead={specialist.lead}
                  onDark
                />
              </div>
              <ParallaxImage
                src={photoSlots.marketingCorridor.src}
                alt={photoSlots.marketingCorridor.alt}
                ratio={photoSlots.marketingCorridor.ratio}
                sizes="(max-width: 1023px) 100vw, 30vw"
                className="m-ar-16-9 border border-line-dark lg:col-span-4 lg:col-start-9"
                tilt
                mBleed
              />
            </div>

            {/* Two up, not four deep. Read as an alternating stack these four
                arguments cost two full screens and looked like the third ruled
                ledger in a row; paired, they are one table a brand manager can
                take in at once. */}
            <StaggerGroup
              as="ul"
              from="up"
              className="grid gap-x-12 gap-y-[clamp(1.75rem,3vw,2.5rem)] lg:grid-cols-2"
              stagger={0.09}
              mLedger
            >
              {reasons.map((reason) => (
                <li
                  key={reason.title}
                  className="m-ledger-row flex flex-col gap-2.5 border-t border-line-dark pt-5"
                >
                  <h3 className="t-h4 text-on-charcoal">{reason.title}</h3>
                  <p className="t-body text-on-charcoal-soft">{reason.text}</p>
                </li>
              ))}
            </StaggerGroup>

            <div className="m-cta">
              <Button
                href="/contact?intent=brand"
                variant="onDark"
                size="lg"
                className="press"
              >
                Distribute your brand
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      {/* 4 — Brand wall (paper, run wide). The wall is capped at three rows so
          the section can be read without scrolling inside it; the labels a
          retailer is most likely to recognise lead (byPopularity, see
          src/content/partners.ts) and the link below carries the rest. */}
      {brandsSection ? (
        <section className="am-band bg-paper" style={unitScope(UNIT)}>
          <div className="container-wide">
            <Reveal className="m-flow flex flex-col gap-8">
              <SectionHeading
                heading={brandsSection.heading}
                lead={brandsSection.lead}
              />
              <LogoWall partners={marketingPartners} limit={18} />
              <p>
                <Link
                  href="/brands"
                  className="t-small font-semibold text-ink underline decoration-[var(--unit-accent)] decoration-2 underline-offset-4 hover:decoration-ink"
                >
                  See the full group portfolio &rarr;
                </Link>
              </p>
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* 5 — FAQ (paper-shade). Deliberately the quiet fold before the close. */}
      {faqs.length ? (
        <section className="am-band bg-paper-shade">
          <div className="container-site">
            <div className="m-flow grid gap-10 lg:grid-cols-[1fr_1.4fr]">
              <Reveal variant="fade">
                <SectionHeading heading={faqSection?.heading ?? "Straight answers"} />
              </Reveal>
              <FaqAccordion faqs={faqs} />
            </div>
          </div>
          <JsonLd data={faqJsonLd(faqs)} />
        </section>
      ) : null}

      {/* 6 — CTA band (single vermillion drench), set across rather than down
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
          {/* Both funnels, each with its own destination. The loose phone
              number that used to sit here routed brand enquiries to a
              distribution desk by hand; the form tags the intent instead
              (AM12). */}
          <div
            data-drench-reveal
            className="m-cta flex shrink-0 flex-col items-start gap-4"
          >
            <Button
              href="/contact?intent=retailer"
              variant="onDark"
              size="lg"
              className="press"
            >
              Become a retail partner
            </Button>
            <a
              href="/contact?intent=brand"
              className="m-tap t-small underline-offset-4 hover:underline"
              style={{ color: "var(--_text-soft)" }}
            >
              Distribute your brand &rarr;
            </a>
          </div>
        </div>
      </DrenchBand>
    </div>
  );
}
