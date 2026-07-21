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
  getSisScope,
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

const UNIT = "marketing" as const;
const PATH = "/arihant-marketing";

/* Compact Archivo-condensed stat figure for the hero rail (no count-up —
   server-rendered, static). The figure is tinted with the maroon unit accent
   to carry the Arihant Marketing identity; CTAs stay vermillion. */
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

/** Group en-IN; leave plausible bare years ungrouped. */
function formatStat(value: number, suffix?: string): string {
  const isYear = !suffix && Number.isInteger(value) && value >= 1900 && value <= 2999;
  const body = isYear ? String(value) : new Intl.NumberFormat("en-IN").format(value);
  return suffix ? `${body}${suffix}` : body;
}

function formatPhone(phone: string): string {
  return phone.replace(/(\d{5})(\d{5})/, "$1 $2");
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
  const [copy, businesses, partners, faqs, settings, sisScope] =
    await Promise.all([
      getPageCopy(UNIT),
      getBusinesses(),
      getPartners(),
      getFaqs(UNIT),
      getSiteSettings(),
      getSisScope(),
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
  const ctaSection = sections.cta;

  const twentyDayPromise = business?.points.find((p) => p.includes("20 days"));
  const firstPhone = contact?.phones[0];

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

      {/* 1 — Hero (paper): headline + maroon-accented logo/stats rail */}
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

            {/* Right rail: unit logo plate + three stacked stats */}
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

      {/* 2 — Award band (charcoal over a working warehouse, static for weight) */}
      <section className="section-pad on-dark relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <Image
            src={stockImages.marketingWarehouse2.src}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-[0.14]"
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(90deg, var(--charcoal) 34%, transparent)" }}
          />
        </div>
        <div className="container-site relative">
          <div className="grid lg:grid-cols-12">
            <div className="flex flex-col gap-5 lg:col-span-7">
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

      {/* 3 — How we work (paper): a warehouse-side intro + a numbered sequence */}
      <section className="section-pad bg-paper" style={unitScope(UNIT)}>
        <div className="container-site flex flex-col gap-14">
          <Reveal
            variant="fade"
            className="grid gap-y-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16"
          >
            <div className="flex flex-col">
              <SectionHeading heading={how.heading} lead={how.lead} />
              {twentyDayPromise ? (
                <figure className="mt-10 flex flex-col gap-4">
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
              src={stockImages.marketingWarehouse1.src}
              alt={stockImages.marketingWarehouse1.alt}
              ratio="4 / 5"
              sizes="(max-width: 1023px) 100vw, 34vw"
              className="border border-line"
              tilt
            />
          </Reveal>

          <StaggerGroup as="ol" from="left" className="flex flex-col" stagger={0.1}>
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
          </StaggerGroup>
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
        <div className="container-site flex flex-col gap-12">
          <Reveal variant="fade">
            <SectionHeading heading={sis.heading} lead={sis.lead} />
          </Reveal>
          <StaggerGroup
            as="ul"
            from="up"
            className="flex flex-col border-t border-line"
            stagger={0.08}
          >
            {sisScope.map((row) => (
              <li
                key={row.title}
                className="grid items-baseline gap-x-8 gap-y-1 border-b border-line py-5 md:grid-cols-[minmax(0,15rem)_1fr]"
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
          <div>
            <Button href="/contact?intent=brand" variant="primary" size="lg">
              Distribute your brand
            </Button>
          </div>
        </div>
      </section>

      {/* 5 — Brand wall (paper) */}
      <section className="section-pad bg-paper" style={unitScope(UNIT)}>
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
        <div className="container-site flex max-w-3xl flex-col gap-6">
          <h2 data-drench-reveal className="t-h2">
            {ctaSection?.heading ?? "Put thirty years of distribution behind your counter."}
          </h2>
          {ctaSection?.lead ? (
            <p data-drench-reveal className="t-lead" style={{ color: "var(--_text-soft)" }}>
              {ctaSection.lead}
            </p>
          ) : null}
          <div data-drench-reveal className="mt-1 flex flex-col gap-4">
            <div>
              <Button href="/contact?intent=retailer" variant="onDark" size="lg">
                Become a retail partner
              </Button>
            </div>
            {firstPhone ? (
              <a
                href={`tel:+91${firstPhone.phone}`}
                className="t-small w-fit underline-offset-4 hover:underline"
                style={{ color: "var(--_text-soft)" }}
              >
                Or call {firstPhone.name} &middot; {formatPhone(firstPhone.phone)}
              </a>
            ) : null}
          </div>
        </div>
      </DrenchBand>
    </div>
  );
}
