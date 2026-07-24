import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  Button,
  DrenchBand,
  FaqAccordion,
  JsonLd,
  LogoWall,
  ParallaxImage,
  Reveal,
  SectionHeading,
  StaggerGroup,
  cn,
} from "@/components";
import {
  getBusinesses,
  getFaqs,
  getMarketingStrengths,
  getPageCopy,
  getPartners,
  getSisScope,
  getSiteSettings,
  pointById,
} from "@/lib/content";
import {
  breadcrumbJsonLd,
  businessJsonLd,
  faqJsonLd,
  pageMetadata,
} from "@/lib/seo";
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
  const [copy, businesses, partners, faqs, settings, sisScope, strengths] =
    await Promise.all([
      getPageCopy(UNIT),
      getBusinesses(),
      getPartners(),
      getFaqs(UNIT),
      getSiteSettings(),
      getSisScope(),
      getMarketingStrengths(),
    ]);

  if (!copy) return null;

  const business = businesses.find((b) => b.unit === UNIT);
  const contact = settings.contacts.find((c) => c.unit === UNIT);
  const marketingPartners = partners.filter((p) => p.unit === UNIT);
  const { hero, sections } = copy;
  const award = sections.award;
  const strengthsSection = sections.strengths;
  const how = sections.how;
  const sis = sections.sis;
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

      {/* 2 — Award band (charcoal over a working warehouse, static for weight) */}
      <section className="section-pad on-dark relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <Image
            src={photoSlots.marketingBandGround.src}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-[0.14]"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "var(--m-band-scrim, linear-gradient(90deg, var(--charcoal) 34%, transparent))",
            }}
          />
        </div>
        <div className="container-site relative">
          <div className="grid lg:grid-cols-12">
            <div className="m-flow-tight flex flex-col gap-5 lg:col-span-7">
              <h2 className="t-h2 text-on-charcoal">{award.heading}</h2>
              <div
                aria-hidden="true"
                style={{ height: 3, width: "clamp(3rem, 8vw, 4.5rem)", background: "var(--vermillion)" }}
              />
              {award.lead ? (
                <p className="t-lead measure text-on-charcoal-soft">{award.lead}</p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* 2b — What a brand gets (paper-shade): the same four strengths the home
          page argues to a retailer, argued here to a brand manager. Separate
          copy on purpose, so neither page reprints the other (AM10). */}
      {strengths.length && strengthsSection ? (
        <section className="section-pad bg-paper-shade" style={unitScope(UNIT)}>
          <div className="container-site m-flow flex flex-col gap-10">
            <Reveal variant="fade">
              <SectionHeading
                heading={strengthsSection.heading}
                lead={strengthsSection.lead}
              />
            </Reveal>
            <StaggerGroup
              as="ul"
              from="up"
              className="flex flex-col border-t border-line"
              stagger={0.08}
              mLedger
            >
              {strengths.map((row) => (
                <li
                  key={row.title}
                  className="m-ledger-row grid items-baseline gap-x-8 gap-y-1 border-b border-line py-5 md:grid-cols-[minmax(0,16rem)_1fr]"
                >
                  <h3
                    className="font-sans text-ink"
                    style={{ fontWeight: 650, fontSize: "1.02rem", lineHeight: 1.3 }}
                  >
                    {row.title}
                  </h3>
                  <p className="t-body measure text-ink-soft">{row.text}</p>
                </li>
              ))}
            </StaggerGroup>
          </div>
        </section>
      ) : null}

      {/* 3 — How we work (paper): a warehouse-side intro + a numbered sequence */}
      <section className="section-pad bg-paper" style={unitScope(UNIT)}>
        <div className="container-site m-flow-loose flex flex-col gap-14">
          <Reveal
            variant="fade"
            className="m-flow grid gap-y-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16"
          >
            <div className="flex flex-col">
              <SectionHeading heading={how.heading} lead={how.lead} />
              {twentyDayPromise ? (
                <figure className="m-pull mt-10 flex flex-col gap-4">
                  <span
                    aria-hidden="true"
                    className="block"
                    style={{ height: 3, width: "3rem", background: "var(--vermillion)" }}
                  />
                  <blockquote
                    className="font-display measure text-ink"
                    style={{ fontStyle: "italic", fontSize: "var(--text-h3)", lineHeight: 1.28 }}
                  >
                    {twentyDayPromise}
                  </blockquote>
                </figure>
              ) : null}
            </div>

            <ParallaxImage
              src={photoSlots.marketingWarehouse.src}
              alt={photoSlots.marketingWarehouse.alt}
              ratio={photoSlots.marketingWarehouse.ratio}
              sizes="(max-width: 1023px) 100vw, 34vw"
              className="m-ar-4-3 border border-line"
              tilt
              mBleed
            />
          </Reveal>

          <StaggerGroup
            as="ol"
            from="left"
            className="flex flex-col"
            stagger={0.1}
            mLedger
          >
            {(how.body ?? []).map((step, index) => (
              <li
                key={step}
                className={cn(
                  "m-step grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-1 py-6",
                  index > 0 && "border-t border-line",
                )}
              >
                <span
                  aria-hidden="true"
                  className="t-h2 font-display text-vermillion-deep"
                  style={{ fontVariantNumeric: "tabular-nums", lineHeight: 1 }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="t-body text-ink-soft">{step}</p>
              </li>
            ))}
          </StaggerGroup>

          {/* The retailer ask, placed after the reader has seen how the cycle
              actually works rather than before (AM8). */}
          <div className="m-cta">
            <Button href={hero.primaryCta.href} variant="primary" size="lg" className="press">
              {hero.primaryCta.label}
            </Button>
          </div>
        </div>
      </section>

      {/* 4 — SIS band (maroon accent-wash ground): a ledger of what the team runs */}
      <section
        className="section-pad"
        style={{
          ...unitScope(UNIT),
          background: "var(--unit-accent-wash)",
          borderBlock: "1px solid var(--unit-accent-line)",
        }}
      >
        <div className="container-site m-flow flex flex-col gap-12">
          <Reveal variant="fade">
            <SectionHeading heading={sis.heading} lead={sis.lead} />
          </Reveal>
          <StaggerGroup
            as="ul"
            from="up"
            className="flex flex-col border-t border-line"
            stagger={0.08}
            mLedger
          >
            {sisScope.map((row) => (
              <li
                key={row.title}
                className="m-ledger-row grid items-baseline gap-x-8 gap-y-1 border-b border-line py-5 md:grid-cols-[minmax(0,15rem)_1fr]"
              >
                <h3
                  className="font-sans text-ink"
                  style={{ fontWeight: 650, fontSize: "1.02rem", lineHeight: 1.3 }}
                >
                  {row.title}
                </h3>
                <p className="t-body measure text-ink-soft">{row.text}</p>
              </li>
            ))}
          </StaggerGroup>
          <div className="m-cta">
            <Button href="/contact?intent=brand" variant="primary" size="lg" className="press">
              Distribute your brand
            </Button>
          </div>
        </div>
      </section>

      {/* 5 — Brand wall (paper) */}
      <section className="section-pad bg-paper" style={unitScope(UNIT)}>
        <div className="container-wide">
          <Reveal className="m-flow flex flex-col gap-8">
            <SectionHeading heading={brandsSection.heading} lead={brandsSection.lead} />
            <LogoWall partners={marketingPartners} />
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

      {/* 6 — FAQ (paper-shade) */}
      {faqs.length ? (
        <section className="section-pad bg-paper-shade">
          <div className="container-site">
            <div className="m-flow grid gap-10 lg:grid-cols-[1fr_1.4fr]">
              <Reveal variant="fade">
                <SectionHeading heading={faqSection.heading} />
              </Reveal>
              <FaqAccordion faqs={faqs} />
            </div>
          </div>
          <JsonLd data={faqJsonLd(faqs)} />
        </section>
      ) : null}

      {/* 7 — CTA band (single vermillion drench) */}
      <DrenchBand className="section-pad">
        <div className="container-site m-flow flex max-w-3xl flex-col gap-6">
          <h2 data-drench-reveal className="t-h2">
            {ctaSection?.heading ?? "Put thirty years of distribution behind your counter."}
          </h2>
          {ctaSection?.lead ? (
            <p data-drench-reveal className="t-lead" style={{ color: "var(--_text-soft)" }}>
              {ctaSection.lead}
            </p>
          ) : null}
          {/* Both funnels, each with its own destination. The loose phone
              number that used to sit here routed brand enquiries to a
              distribution desk by hand; the form tags the intent instead
              (AM12). */}
          <div
            data-drench-reveal
            className="m-cta mt-1 flex flex-wrap items-center gap-x-6 gap-y-4"
          >
            <Button href="/contact?intent=retailer" variant="onDark" size="lg" className="press">
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
