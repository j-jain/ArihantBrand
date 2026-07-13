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

const UNIT = "marketing" as const;
const PATH = "/arihant-marketing";

/* Scoped decorative identity: the maroon unit accent colours the hero rule,
   index marks and the pull-line rule — never the CTAs (those stay vermillion). */
const unitScope: CSSProperties = { "--unit-accent": "var(--unit-marketing)" } as CSSProperties;

/* Compact Archivo-condensed stat figure for the hero rail (no count-up —
   server-rendered, static). Duplicated per page by design. */
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

/** Group en-IN; leave plausible bare years ungrouped. */
function formatStat(value: number, suffix?: string): string {
  const isYear = !suffix && Number.isInteger(value) && value >= 1900 && value <= 2999;
  const body = isYear ? String(value) : new Intl.NumberFormat("en-IN").format(value);
  return suffix ? `${body}${suffix}` : body;
}

function formatPhone(phone: string): string {
  return phone.replace(/(\d{5})(\d{5})/, "$1 $2");
}

/** h1 with the emphasis word set in Besley italic + the unit accent. */
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

export default async function ArihantMarketingPage() {
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
  const marketingPartners = partners.filter((p) => p.unit === UNIT);
  const { hero, sections } = copy;
  const award = sections.award;
  const how = sections.how;
  const sis = sections.sis;
  const brandsSection = sections.brands;
  const faqSection = sections.faq;

  const twentyDayPromise = business?.points.find((p) => p.includes("20 days"));
  const firstPhone = contact?.phones[0];

  const sisFacts = ["Plug-and-play team", "AI-driven", "Data-backed"];

  return (
    <div style={unitScope}>
      {business && contact ? (
        <JsonLd data={businessJsonLd(settings, business, contact)} />
      ) : null}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: business?.name ?? "Arihant Marketing", path: PATH },
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

            {/* Right rail: unit logo plate + three stacked stats */}
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

      {/* 2 — Award band (charcoal, monumental + quiet) */}
      <section className="section-pad on-dark">
        <div className="container-site">
          <div className="flex max-w-3xl flex-col gap-5">
            <h2 className="t-h2 text-on-charcoal">{award.heading}</h2>
            <div
              aria-hidden="true"
              style={{ height: 3, width: "clamp(3rem, 8vw, 4.5rem)", background: "var(--vermillion)" }}
            />
            {award.lead ? <p className="t-lead text-on-charcoal-soft">{award.lead}</p> : null}
          </div>
        </div>
      </section>

      {/* 3 — How we work (paper): a true numbered sequence */}
      <section className="section-pad bg-paper">
        <div className="container-site">
          <Reveal className="grid gap-y-12 gap-x-16 lg:grid-cols-[1fr_1.4fr]">
            <div className="flex flex-col">
              <SectionHeading heading={how.heading} lead={how.lead} />
              {twentyDayPromise ? (
                <div className="mt-10 flex flex-col gap-4">
                  <div
                    aria-hidden="true"
                    style={{ height: 3, width: "3rem", background: "var(--unit-accent)" }}
                  />
                  <p
                    className="font-display measure text-ink"
                    style={{ fontStyle: "italic", fontSize: "var(--text-h3)", lineHeight: 1.28 }}
                  >
                    {twentyDayPromise}
                  </p>
                </div>
              ) : null}
            </div>

            <ol className="flex flex-col">
              {(how.body ?? []).map((step, index) => (
                <li
                  key={step}
                  className={cn(
                    "grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-1 py-6",
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
            </ol>
          </Reveal>
        </div>
      </section>

      {/* 4 — SIS band (paper-shade): heading + a compact fact row */}
      <section className="section-pad bg-paper-shade">
        <div className="container-site">
          <Reveal className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-center">
            <SectionHeading heading={sis.heading} lead={sis.lead} />
            <ul className="flex flex-col">
              {sisFacts.map((fact, index) => (
                <li
                  key={fact}
                  className={cn(
                    "t-label py-4 text-ink",
                    index > 0 && "border-t border-line",
                  )}
                  style={{ fontSize: "1rem", letterSpacing: "0.05em" }}
                >
                  {fact}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* 5 — Brand wall (paper) */}
      <section className="section-pad bg-paper">
        <div className="container-wide">
          <Reveal className="flex flex-col gap-8">
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
            <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
              <SectionHeading heading={faqSection.heading} />
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
            <h2 className="t-h2 text-on-charcoal">{"Put Arihant behind your counter."}</h2>
            {business ? (
              <p className="t-lead" style={{ color: "rgba(255,255,255,0.9)" }}>
                {business.positioning}
              </p>
            ) : null}
            <div className="mt-1 flex flex-col gap-4">
              <div>
                <Button href="/contact?intent=retailer" variant="onDark" size="lg">
                  Become a retail partner
                </Button>
              </div>
              {firstPhone ? (
                <a
                  href={`tel:+91${firstPhone.phone}`}
                  className="t-small w-fit underline-offset-4 hover:underline"
                  style={{ color: "rgba(255,255,255,0.9)" }}
                >
                  Or call {firstPhone.name} &middot; {formatPhone(firstPhone.phone)}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
