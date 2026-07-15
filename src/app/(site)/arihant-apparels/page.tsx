import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  Button,
  DrenchBand,
  FaqAccordion,
  HeroIntro,
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
  getPageCopy,
  getPartners,
  getSiteSettings,
} from "@/lib/content";
import {
  breadcrumbJsonLd,
  businessJsonLd,
  faqJsonLd,
  pageMetadata,
} from "@/lib/seo";
import { stockImages } from "@/content/images";
import { unitScope } from "@/lib/units";
import { EmphasisHeading } from "../_components/EmphasisHeading";

const UNIT = "apparels" as const;
const PATH = "/arihant-apparels";

/* Hero stat figures carry the ink (crown-black) unit identity; CTAs stay
   vermillion. */
const railValueStyle: CSSProperties = {
  fontFamily: "var(--font-archivo), system-ui, sans-serif",
  fontWeight: 800,
  fontStretch: "85%",
  fontVariantNumeric: "tabular-nums",
  fontSize: "clamp(1.9rem, 1.5rem + 1.4vw, 2.5rem)",
  lineHeight: 1,
  letterSpacing: "-0.01em",
  color: "var(--unit-accent)",
};

function formatStat(value: number, suffix?: string): string {
  const isYear = !suffix && Number.isInteger(value) && value >= 1900 && value <= 2999;
  const body = isYear ? String(value) : new Intl.NumberFormat("en-IN").format(value);
  return suffix ? `${body}${suffix}` : body;
}

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPageCopy(UNIT);
  return pageMetadata({
    title: copy?.metaTitle ?? "",
    description: copy?.metaDescription ?? "",
    path: PATH,
  });
}

export default async function ArihantApparelsPage() {
  const [copy, businesses, partners, faqs, settings] = await Promise.all([
    getPageCopy(UNIT),
    getBusinesses(),
    getPartners(),
    getFaqs(UNIT),
    getSiteSettings(),
  ]);

  if (!copy) return null;

  const business = businesses.find((b) => b.unit === UNIT);
  const contact = settings.contacts.find((c) => c.unit === UNIT);
  const apparelsPartners = partners.filter((p) => p.unit === UNIT);
  const { hero, sections } = copy;
  const mission = sections.mission;
  const exhibitions = sections.exhibitions;
  const brandsSection = sections.brands;
  const faqSection = sections.faq;

  const exhStat = business?.stats.find((s) => s.label.toLowerCase().includes("exhibition"));
  // Category-leaders point drives the strip; two concrete facts support it.
  const leadersPoint = business?.points.find((p) => p.toLowerCase().includes("category leaders"));
  const supportingPoints = (business?.points ?? []).filter(
    (p) =>
      p.toLowerCase().includes("largest") ||
      p.toLowerCase().includes("sq ft"),
  );

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

      {/* 1 — Hero (paper): headline + ink-accented logo/stats rail */}
      <section className="section-pad bg-paper" style={unitScope(UNIT)}>
        <HeroIntro className="container-site">
          <div className="grid gap-12 lg:grid-cols-[1.35fr_1fr] lg:items-start">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-5">
                <EmphasisHeading
                  as="h1"
                  className="t-display text-ink"
                  text={hero.heading}
                  emphasis={hero.headingEmphasis}
                  emphasisColor="var(--unit-accent)"
                  rest={{ "data-hero-title": "", style: { textWrap: "normal" } }}
                />
                <div
                  data-hero-reveal
                  aria-hidden="true"
                  style={{
                    height: 3,
                    width: "clamp(3rem, 8vw, 4.5rem)",
                    background: "var(--unit-accent)",
                  }}
                />
              </div>
              <p data-hero-reveal className="t-lead measure text-ink-soft">
                {hero.lead}
              </p>
              <div data-hero-reveal className="mt-1 flex flex-wrap gap-3">
                <Button href={hero.primaryCta.href} variant="primary" size="lg">
                  {hero.primaryCta.label}
                </Button>
                {hero.secondaryCta ? (
                  <Button href={hero.secondaryCta.href} variant="secondary" size="lg">
                    {hero.secondaryCta.label}
                  </Button>
                ) : null}
              </div>
            </div>

            {business ? (
              <aside data-hero-reveal className="flex flex-col gap-6">
                <div className="rounded-md border border-line bg-white p-6">
                  <div className="relative aspect-[5/3]">
                    <Image
                      src={business.logo}
                      alt={`${business.name} logo`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 1024px) 80vw, 360px"
                    />
                  </div>
                </div>
                <dl className="flex flex-col">
                  {business.stats.map((stat, index) => (
                    <div
                      key={stat.label}
                      className={cn(
                        "flex items-baseline justify-between gap-4 py-4",
                        index > 0 && "border-t border-line",
                      )}
                    >
                      <dd style={railValueStyle}>{formatStat(stat.value, stat.suffix)}</dd>
                      <dt className="t-small max-w-[9rem] text-right text-ink-soft">{stat.label}</dt>
                    </div>
                  ))}
                </dl>
              </aside>
            ) : null}
          </div>
        </HeroIntro>
      </section>

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
          <Reveal variant="fade" className="grid gap-y-8 gap-x-16 lg:grid-cols-12 lg:items-center">
            <ParallaxImage
              src={stockImages.apparelsRacks1.src}
              alt={stockImages.apparelsRacks1.alt}
              ratio="4 / 5"
              sizes="(max-width: 1023px) 100vw, 40vw"
              className="border border-line lg:col-span-5"
            />
            <div className="flex flex-col gap-6 lg:col-span-7">
              <div>
                <h2 className="t-h2 text-ink">{mission.heading}</h2>
                <div
                  aria-hidden="true"
                  className="mt-5"
                  style={{ height: 3, width: "clamp(3rem, 8vw, 4.5rem)", background: "var(--unit-accent)" }}
                />
              </div>
              {mission.lead ? (
                <p
                  className="font-display measure text-ink"
                  style={{ fontStyle: "italic", fontSize: "var(--text-h3)", lineHeight: 1.3 }}
                >
                  {mission.lead}
                </p>
              ) : null}
              {business ? (
                <p className="t-lead measure text-ink-soft">{business.summary}</p>
              ) : null}
            </div>
          </Reveal>
        </div>
      </section>

      {/* 3 — Exhibition band (charcoal over racks): number-led "4 / 4", static */}
      <section className="section-pad on-dark relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <Image
            src={stockImages.apparelsRacks2.src}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-[0.12]"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, var(--charcoal) 42%, color-mix(in oklch, var(--charcoal), transparent 22%))",
            }}
          />
        </div>
        <div className="container-site relative">
          <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-16">
            {exhStat ? (
              <p
                aria-hidden="true"
                className="flex items-baseline"
                style={{
                  fontFamily: "var(--font-archivo), system-ui, sans-serif",
                  fontWeight: 800,
                  fontStretch: "85%",
                  fontVariantNumeric: "tabular-nums",
                  lineHeight: 0.9,
                  letterSpacing: "-0.02em",
                  fontSize: "clamp(5rem, 3rem + 14vw, 11rem)",
                  color: "var(--on-charcoal)",
                }}
              >
                <span>{exhStat.value}</span>
                <span style={{ color: "var(--vermillion)", padding: "0 0.08em" }}>/</span>
                <span>{exhStat.value}</span>
              </p>
            ) : null}
            <div className="flex flex-col gap-4">
              <h2 className="t-h2 text-on-charcoal">{exhibitions.heading}</h2>
              {exhibitions.lead ? (
                <p className="t-lead measure text-on-charcoal-soft">{exhibitions.lead}</p>
              ) : null}
              {exhStat ? (
                <p className="t-label text-on-charcoal-soft" style={{ letterSpacing: "0.06em" }}>
                  {exhStat.label}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* 4 — Category-leaders strip (paper): pull-line + accent-marked facts */}
      <section className="section-pad bg-paper" style={unitScope(UNIT)}>
        <div className="container-site">
          <div className="grid gap-y-8 gap-x-16 lg:grid-cols-[1.4fr_1fr] lg:items-start">
            {leadersPoint ? (
              <Reveal
                as="p"
                variant="fade"
                className="font-display measure text-ink"
                style={{ fontSize: "var(--text-h3)", lineHeight: 1.3 }}
              >
                {leadersPoint}
              </Reveal>
            ) : null}
            {supportingPoints.length ? (
              <StaggerGroup as="ul" from="right" className="flex flex-col" stagger={0.1}>
                {supportingPoints.map((point, index) => (
                  <li
                    key={point}
                    className={cn(
                      "flex items-start gap-3 py-4",
                      index > 0 && "border-t border-line",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="mt-[0.6em] flex-none"
                      style={{ height: 2, width: "1.35rem", background: "var(--unit-accent)" }}
                    />
                    <span className="t-body text-ink-soft">{point}</span>
                  </li>
                ))}
              </StaggerGroup>
            ) : null}
          </div>
        </div>
      </section>

      {/* 5 — Brand wall (paper-shade) */}
      <section className="section-pad bg-paper-shade" style={unitScope(UNIT)}>
        <div className="container-wide">
          <Reveal className="flex flex-col gap-8">
            <SectionHeading heading={brandsSection.heading} lead={brandsSection.lead} />
            <LogoWall partners={apparelsPartners} />
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

      {/* 6 — FAQ (paper) — renders only when the CMS has apparels FAQs */}
      {faqs.length ? (
        <section className="section-pad bg-paper">
          <div className="container-site">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
              <Reveal variant="fade">
                <SectionHeading heading={faqSection?.heading ?? "Straight answers"} />
              </Reveal>
              <FaqAccordion faqs={faqs} />
            </div>
          </div>
          <JsonLd data={faqJsonLd(faqs)} />
        </section>
      ) : null}

      {/* 7 — CTA band (single vermillion drench) */}
      <DrenchBand className="section-pad">
        <div className="container-site flex max-w-3xl flex-col gap-6">
          <h2 data-drench-reveal className="t-h2">
            {"Grow with one of the Northeast’s five largest distributors."}
          </h2>
          {business ? (
            <p data-drench-reveal className="t-lead" style={{ color: "var(--_text-soft)" }}>
              {business.positioning}
            </p>
          ) : null}
          <div data-drench-reveal className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Button href="/contact?intent=retailer" variant="onDark" size="lg">
              Stock our brands
            </Button>
            <a
              href="/contact?intent=brand"
              className="t-small underline-offset-4 hover:underline"
              style={{ color: "var(--_text-soft)" }}
            >
              Partner as a brand &rarr;
            </a>
          </div>
        </div>
      </DrenchBand>
    </div>
  );
}
