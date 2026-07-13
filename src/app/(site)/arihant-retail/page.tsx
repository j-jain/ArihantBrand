import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";

import {
  Button,
  JsonLd,
  Reveal,
  SectionHeading,
  StoreCard,
  ThreadLabel,
  cn,
} from "@/components";
import {
  getBusinesses,
  getPageCopy,
  getSiteSettings,
  getStores,
} from "@/lib/content";
import { breadcrumbJsonLd, businessJsonLd, pageMetadata } from "@/lib/seo";

const UNIT = "retail" as const;
const PATH = "/arihant-retail";

const unitScope: CSSProperties = { "--unit-accent": "var(--unit-retail)" } as CSSProperties;

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

  const points = business?.points ?? [];
  const modelPoints = [
    points.find((p) => p.toLowerCase().includes("zero-deadstock")),
    points.find((p) => p.toLowerCase().includes("legacy")),
    points.find((p) => p.toLowerCase().includes("ebo")),
  ].filter((p): p is string => Boolean(p));

  const stats = business?.stats ?? [];
  const stages = ["Today", "In fit-out", "By FY 26-27"];
  const roadmap = stats.slice(0, 3).map((stat, index) => ({
    stage: stages[index],
    value: formatStat(stat.value, stat.suffix),
    label: stat.label,
  }));

  return (
    <div style={unitScope}>
      {business && contact ? (
        <JsonLd data={businessJsonLd(settings, business, contact)} />
      ) : null}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: business?.name ?? "Arihant Retail", path: PATH },
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

      {/* 2 — Stores (paper-shade) */}
      <section className="section-pad bg-paper-shade">
        <div className="container-site">
          <Reveal className="flex flex-col gap-10">
            <SectionHeading heading={storesSection.heading} lead={storesSection.lead} />
            <div
              className="grid gap-6"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
            >
              {stores.map((store) => (
                <StoreCard key={`${store.name}-${store.city}-${store.status}`} store={store} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* 3 — Model band (charcoal) */}
      <section className="section-pad on-dark">
        <div className="container-site">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
            <SectionHeading heading={model.heading} lead={model.lead} onDark />
            {modelPoints.length ? (
              <ul className="flex flex-col self-center">
                {modelPoints.map((point, index) => (
                  <li
                    key={point}
                    className={cn(
                      "t-h4 py-5 text-on-charcoal",
                      index > 0 && "border-t border-line-dark",
                    )}
                  >
                    {point}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </section>

      {/* 4 — Expansion (paper): one temporal roadmap rail carrying the figures */}
      <section className="section-pad bg-paper">
        <div className="container-site">
          <Reveal className="flex flex-col gap-12">
            <SectionHeading heading={expansion.heading} lead={expansion.lead} />

            {roadmap.length ? (
              <div className="relative pt-2">
                <div
                  aria-hidden="true"
                  className="absolute left-0 right-0"
                  style={{ top: "9px", height: 1, background: "var(--line)" }}
                />
                <ol className="relative grid gap-x-6 gap-y-10 sm:grid-cols-3">
                  {roadmap.map((node) => (
                    <li key={node.stage} className="flex flex-col gap-3">
                      <span
                        aria-hidden="true"
                        className="block rounded-full"
                        style={{ height: 14, width: 14, background: "var(--unit-accent)" }}
                      />
                      <span className="t-label text-ink-soft">{node.stage}</span>
                      <span className="t-stat text-ink">{node.value}</span>
                      <span className="t-small text-ink-soft">{node.label}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </Reveal>
        </div>
      </section>

      {/* 5 — Partner cross-sell (vermillion drench) */}
      <section className="section-pad on-dark" style={{ background: "var(--vermillion-drench)" }}>
        <div className="container-site">
          <div className="flex max-w-3xl flex-col gap-6">
            <h2 className="t-h2 text-on-charcoal">{cta.heading}</h2>
            {cta.lead ? (
              <p className="t-lead" style={{ color: "rgba(255,255,255,0.9)" }}>
                {cta.lead}
              </p>
            ) : null}
            <div className="mt-1">
              <Button href="/partner" variant="onDark" size="lg">
                See the partnership model
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
