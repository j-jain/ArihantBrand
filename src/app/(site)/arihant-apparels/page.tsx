import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  Button,
  FaqAccordion,
  JsonLd,
  LogoWall,
  Reveal,
  SectionHeading,
  ThreadLabel,
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

const UNIT = "apparels" as const;
const PATH = "/arihant-apparels";

const unitScope: CSSProperties = { "--unit-accent": "var(--unit-apparels)" } as CSSProperties;

const railValueStyle: CSSProperties = {
  fontFamily: "var(--font-archivo), system-ui, sans-serif",
  fontWeight: 800,
  fontStretch: "85%",
  fontVariantNumeric: "tabular-nums",
  fontSize: "clamp(1.9rem, 1.5rem + 1.4vw, 2.5rem)",
  lineHeight: 1,
  letterSpacing: "-0.01em",
  color: "var(--ink)",
};

function formatStat(value: number, suffix?: string): string {
  const isYear = !suffix && Number.isInteger(value) && value >= 1900 && value <= 2999;
  const body = isYear ? String(value) : new Intl.NumberFormat("en-IN").format(value);
  return suffix ? `${body}${suffix}` : body;
}

function HeroHeading({ heading, emphasis }: { heading: string; emphasis?: string }) {
  const i = emphasis ? heading.indexOf(emphasis) : -1;
  if (!emphasis || i === -1) {
    return <h1 className="t-display text-ink">{heading}</h1>;
  }
  return (
    <h1 className="t-display text-ink">
      {heading.slice(0, i)}
      <em className="font-display" style={{ fontStyle: "italic", color: "var(--unit-accent)" }}>
        {emphasis}
      </em>
      {heading.slice(i + emphasis.length)}
    </h1>
  );
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
    <div style={unitScope}>
      {business && contact ? (
        <JsonLd data={businessJsonLd(settings, business, contact)} />
      ) : null}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: business?.name ?? "Arihant Apparels", path: PATH },
        ])}
      />

      {/* 1 — Hero (paper) */}
      <section className="section-pad bg-paper">
        <div className="container-site">
          <div className="grid gap-12 lg:grid-cols-[1.35fr_1fr] lg:items-start">
            <div className="flex flex-col gap-6">
              <div>
                <ThreadLabel accent="var(--unit-accent)">{hero.threadLabel}</ThreadLabel>
              </div>
              <div className="flex flex-col gap-5">
                <HeroHeading heading={hero.heading} emphasis={hero.headingEmphasis} />
                <div
                  aria-hidden="true"
                  style={{
                    height: 3,
                    width: "clamp(3rem, 8vw, 4.5rem)",
                    background: "var(--unit-accent)",
                  }}
                />
              </div>
              <p className="t-lead measure text-ink-soft">{hero.lead}</p>
              <div className="mt-1 flex flex-wrap gap-3">
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
              <aside className="flex flex-col gap-6">
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
        </div>
      </section>

      {/* 2 — Mission split (paper-shade, generous, asymmetric 5/7) */}
      <section className="section-pad bg-paper-shade">
        <div className="container-site">
          <Reveal className="grid gap-y-8 gap-x-16 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 className="t-h2 text-ink">{mission.heading}</h2>
              <div
                aria-hidden="true"
                className="mt-5"
                style={{ height: 3, width: "clamp(3rem, 8vw, 4.5rem)", background: "var(--unit-accent)" }}
              />
            </div>
            <div className="flex flex-col gap-6 lg:col-span-7">
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

      {/* 3 — Exhibition band (charcoal): number-led "4 / 4" */}
      <section className="section-pad on-dark">
        <div className="container-site">
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

      {/* 4 — Category-leaders strip (paper) */}
      <section className="section-pad bg-paper">
        <div className="container-site">
          <Reveal className="grid gap-y-8 gap-x-16 lg:grid-cols-[1.4fr_1fr] lg:items-start">
            {leadersPoint ? (
              <p
                className="font-display measure text-ink"
                style={{ fontSize: "var(--text-h3)", lineHeight: 1.3 }}
              >
                {leadersPoint}
              </p>
            ) : null}
            {supportingPoints.length ? (
              <ul className="flex flex-col">
                {supportingPoints.map((point, index) => (
                  <li
                    key={point}
                    className={cn(
                      "t-body py-4 text-ink-soft",
                      index > 0 && "border-t border-line",
                    )}
                  >
                    {point}
                  </li>
                ))}
              </ul>
            ) : null}
          </Reveal>
        </div>
      </section>

      {/* 5 — Brand wall (paper-shade) */}
      <section className="section-pad bg-paper-shade">
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
              <SectionHeading heading={faqSection?.heading ?? "Straight answers"} />
              <FaqAccordion faqs={faqs} />
            </div>
          </div>
          <JsonLd data={faqJsonLd(faqs)} />
        </section>
      ) : null}

      {/* 7 — CTA band (vermillion drench) */}
      <section className="section-pad on-dark" style={{ background: "var(--vermillion-drench)" }}>
        <div className="container-site">
          <div className="flex max-w-3xl flex-col gap-6">
            <h2 className="t-h2 text-on-charcoal">
              {"Grow with the Northeast’s fastest-rising distributor."}
            </h2>
            {business ? (
              <p className="t-lead" style={{ color: "rgba(255,255,255,0.9)" }}>
                {business.positioning}
              </p>
            ) : null}
            <div className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Button href="/contact?intent=retailer" variant="onDark" size="lg">
                Stock our brands
              </Button>
              <a
                href="/contact?intent=brand"
                className="t-small underline-offset-4 hover:underline"
                style={{ color: "rgba(255,255,255,0.9)" }}
              >
                Partner as a brand &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
