import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";

import {
  Button,
  DrenchBand,
  HeroIntro,
  JsonLd,
  ParallaxImage,
  Reveal,
  SectionHeading,
  StaggerGroup,
  StoreCard,
  cn,
} from "@/components";
import {
  getBusinesses,
  getPageCopy,
  getSiteSettings,
  getStores,
  pointsByIds,
} from "@/lib/content";
import { breadcrumbJsonLd, businessJsonLd, pageMetadata } from "@/lib/seo";
import { stockImages } from "@/content/images";
import { unitScope } from "@/lib/units";
import { EmphasisHeading } from "../_components/EmphasisHeading";

const UNIT = "retail" as const;
const PATH = "/arihant-retail";

/* Hero stat figures carry the purple unit identity; CTAs stay vermillion. */
const railValueStyle: CSSProperties = {
  fontFamily: "var(--font-archivo), system-ui, sans-serif",
  fontWeight: 800,
  fontStretch: "85%",
  fontVariantNumeric: "tabular-nums",
  fontSize: "var(--m-unit-stat, clamp(1.9rem, 1.5rem + 1.4vw, 2.5rem))",
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

export default async function ArihantRetailPage() {
  const [copy, businesses, stores, settings] = await Promise.all([
    getPageCopy(UNIT),
    getBusinesses(),
    getStores(),
    getSiteSettings(),
  ]);

  if (!copy) return null;

  const business = businesses.find((b) => b.unit === UNIT);
  const contact = settings.contacts.find((c) => c.unit === UNIT);
  const { hero, sections } = copy;
  const storesSection = sections.stores;
  const model = sections.model;
  const expansion = sections.expansion;
  const cta = sections.cta;

  // Content is selected by stable id, never by matching the copy — a rewrite
  // must never be able to blank a section.
  const modelPoints = pointsByIds(business, ["zero-deadstock", "legacy", "ebo"]);

  const stats = business?.stats ?? [];
  const stages = ["Today", "In fit-out", "By FY 26-27"];
  const roadmap = stats.slice(0, 3).map((stat, index) => ({
    stage: stages[index],
    value: formatStat(stat.value, stat.suffix),
    label: stat.label,
  }));

  return (
    <div>
      {business && contact ? (
        <JsonLd data={businessJsonLd(settings, business, contact)} />
      ) : null}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: business?.name ?? "Arihant Retail", path: PATH },
        ])}
      />

      {/* 1 — Hero (paper): headline + purple-accented logo/stats rail */}
      <section className="hero-pad bg-paper" style={unitScope(UNIT)}>
        <HeroIntro className="container-site">
          <div className="m-flow grid gap-12 lg:grid-cols-[1.35fr_1fr] lg:items-start">
            <div className="m-flow flex flex-col gap-6">
              <div className="m-flow-tight flex flex-col gap-5">
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
              <div data-hero-reveal className="m-cta mt-1 flex flex-wrap gap-3">
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
              <aside data-hero-reveal className="unit-hero__aside flex flex-col gap-6">
                <div className="unit-hero__plate rounded-md border border-line bg-white p-6">
                  <div className="unit-hero__logo relative aspect-[5/3]">
                    <Image
                      src={business.logo}
                      alt={`${business.name} logo`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 1024px) 80vw, 360px"
                    />
                  </div>
                </div>
                <dl className="unit-hero__stats flex flex-col">
                  {business.stats.map((stat, index) => (
                    <div
                      key={stat.label}
                      className={cn(
                        "unit-hero__stat flex items-baseline justify-between gap-4 py-4",
                        index > 0 && "border-t border-line",
                      )}
                    >
                      <dd style={railValueStyle}>{formatStat(stat.value, stat.suffix)}</dd>
                      <dt className="unit-hero__stat-label t-small max-w-[9rem] text-right text-ink-soft">{stat.label}</dt>
                    </div>
                  ))}
                </dl>
              </aside>
            ) : null}
          </div>
        </HeroIntro>
      </section>

      {/* 2 — Stores (paper-shade): the three REAL store photos lead, staggered */}
      <section className="section-pad bg-paper-shade">
        <div className="container-site">
          <div className="m-flow flex flex-col gap-10">
            <Reveal variant="fade">
              <SectionHeading heading={storesSection.heading} lead={storesSection.lead} />
            </Reveal>
            <StaggerGroup
              from="scale"
              className="m-rail grid gap-6 grid-cols-[repeat(auto-fit,minmax(280px,1fr))]"
              stagger={0.12}
            >
              {stores.map((store, i) => (
                <StoreCard key={`${store.name}-${store.city}-${i}`} store={store} />
              ))}
            </StaggerGroup>
          </div>
        </div>
      </section>

      {/* 3 — Model band (charcoal): the model as a closed ledger + an image duo */}
      <section className="section-pad on-dark">
        <div className="container-site">
          <div className="m-flow grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:items-start">
            <div className="m-flow flex flex-col gap-8">
              <SectionHeading heading={model.heading} lead={model.lead} onDark />
              {modelPoints.length ? (
                <StaggerGroup as="ul" from="left" className="flex flex-col" stagger={0.1} mLedger>
                  {modelPoints.map((point, index) => (
                    <li
                      key={point}
                      className={cn(
                        "m-ledger-row t-h4 border-t border-line-dark py-5 text-on-charcoal",
                        index === modelPoints.length - 1 && "border-b border-line-dark",
                      )}
                    >
                      {point}
                    </li>
                  ))}
                </StaggerGroup>
              ) : null}
            </div>

            {/* Image duo: a portrait interior with a wider shopfront pulled up
                over its bottom-left on desktop; a clean stack on mobile. Both
                are Arihant Retail's own floors, so they outrank stock here. */}
            <div className="m-duo flex flex-col">
              <ParallaxImage
                src="/images/photos/store-interior.jpg"
                alt="Inside an Arihant Retail floor: merchandised, staffed and stocked by our own team"
                ratio="4 / 5"
                sizes="(max-width: 1023px) 100vw, 35vw"
                className="m-ar-4-3 border border-line-dark"
                tilt
                mBleed
              />
              <ParallaxImage
                src="/images/photos/store-ebo-indian-terrain.jpg"
                alt="A national brand partner's outlet run by Arihant Retail"
                ratio="3 / 2"
                sizes="(max-width: 1023px) 100vw, 25vw"
                className="m-ar-16-9 mt-4 border border-line-dark lg:relative lg:z-10 lg:-mt-[18%] lg:mr-auto lg:w-[72%]"
                tilt
                mBleed
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4 — Expansion (purple accent-wash ground): temporal roadmap rail */}
      <section
        className="section-pad"
        style={{
          ...unitScope(UNIT),
          background: "var(--unit-accent-wash)",
          borderBlock: "1px solid var(--unit-accent-line)",
        }}
      >
        <div className="container-site">
          <div className="m-flow flex flex-col gap-12">
            <Reveal variant="fade">
              <SectionHeading heading={expansion.heading} lead={expansion.lead} />
            </Reveal>

            <div className="m-flow grid items-center gap-x-14 gap-y-12 lg:grid-cols-[1.4fr_1fr]">
              {roadmap.length ? (
                <div className="roadmap relative pt-2">
                  <div
                    aria-hidden="true"
                    className="roadmap__spine absolute left-0 right-0"
                    // Horizontal rule joining three columns on desktop; the
                    // mobile layer stands it up into a vertical spine, because
                    // once the nodes stack a horizontal line connects nothing.
                    style={{
                      top: "var(--m-spine-top, 9px)",
                      height: "var(--m-spine-height, 1px)",
                      background: "var(--line)",
                    }}
                  />
                  <StaggerGroup
                    as="ol"
                    from="up"
                    className="roadmap__list relative grid gap-x-6 gap-y-10 sm:grid-cols-3"
                    stagger={0.12}
                  >
                    {roadmap.map((node) => (
                      <li key={node.stage} className="roadmap__node flex flex-col gap-3">
                        <span
                          aria-hidden="true"
                          className="roadmap__dot block rounded-full"
                          style={{ height: 14, width: 14, background: "var(--unit-accent)" }}
                        />
                        <span className="t-label text-ink-soft">{node.stage}</span>
                        <span className="t-stat text-ink">{node.value}</span>
                        <span className="t-small text-ink-soft">{node.label}</span>
                      </li>
                    ))}
                  </StaggerGroup>
                </div>
              ) : null}
              <Reveal variant="clip">
                <ParallaxImage
                  src={stockImages.retailInterior2.src}
                  alt={stockImages.retailInterior2.alt}
                  ratio="4 / 3"
                  mBleed
                />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* 5 — Partner cross-sell (single vermillion drench) */}
      <DrenchBand className="section-pad">
        <div className="container-site m-flow flex max-w-3xl flex-col gap-6">
          <h2 data-drench-reveal className="t-h2">{cta.heading}</h2>
          {cta.lead ? (
            <p data-drench-reveal className="t-lead" style={{ color: "var(--_text-soft)" }}>
              {cta.lead}
            </p>
          ) : null}
          <div data-drench-reveal className="m-cta mt-1">
            <Button href="/partner" variant="onDark" size="lg" className="press">
              See the partnership model
            </Button>
          </div>
        </div>
      </DrenchBand>
    </div>
  );
}
