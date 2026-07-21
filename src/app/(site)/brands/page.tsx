import type { Metadata } from "next";

import {
  Button,
  DrenchBand,
  HeroIntro,
  JsonLd,
  LogoWall,
  Reveal,
  SectionHeading,
} from "@/components";
import { getPageCopy, getPartners } from "@/lib/content";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

const PATH = "/brands";

function HeroHeading({ heading, emphasis }: { heading: string; emphasis?: string }) {
  const i = emphasis ? heading.indexOf(emphasis) : -1;
  if (!emphasis || i === -1) {
    return (
      <h1 data-hero-title className="t-display text-ink">
        {heading}
      </h1>
    );
  }
  return (
    <h1 data-hero-title className="t-display text-ink">
      {heading.slice(0, i)}
      <em className="font-display" style={{ fontStyle: "italic", color: "var(--vermillion-deep)" }}>
        {emphasis}
      </em>
      {heading.slice(i + emphasis.length)}
    </h1>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPageCopy("brands");
  return pageMetadata({
    title: copy?.metaTitle ?? "",
    description: copy?.metaDescription ?? "",
    path: PATH,
  });
}

export default async function BrandsPage() {
  const [copy, partners] = await Promise.all([getPageCopy("brands"), getPartners()]);

  if (!copy) return null;

  const { hero, sections } = copy;
  const cta = sections.cta;
  const marketingCount = partners.filter((p) => p.unit === "marketing").length;
  const apparelsCount = partners.filter((p) => p.unit === "apparels").length;

  return (
    <div>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Brand Portfolio", path: PATH },
        ])}
      />

      {/* 1 — Hero (paper) */}
      <section className="bg-paper">
        <HeroIntro className="container-site hero-pad">
          <div className="m-flow flex max-w-3xl flex-col gap-6">
            <div className="m-flow-tight flex flex-col gap-5">
              <HeroHeading heading={hero.heading} emphasis={hero.headingEmphasis} />
              <div
                data-hero-reveal
                aria-hidden="true"
                style={{ height: 3, width: "clamp(3rem, 8vw, 4.5rem)", background: "var(--vermillion)" }}
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
            <p data-hero-reveal className="t-small text-ink-soft">
              {marketingCount} labels via Arihant Marketing &middot; {apparelsCount} via Arihant Apparels
            </p>
          </div>
        </HeroIntro>
      </section>

      {/* 2 — The wall (paper-shade): filterable, every tile opens the modal */}
      <section className="section-pad bg-paper-shade">
        <div className="container-wide m-flow flex flex-col gap-8">
          <Reveal variant="fade">
            <SectionHeading heading={sections.wall?.heading ?? "The portfolio"} />
          </Reveal>
          <LogoWall partners={partners} filterable />
        </div>
      </section>

      {/* 3 — CTA band (single vermillion drench) */}
      <DrenchBand className="section-pad">
        <div className="container-site m-flow flex max-w-3xl flex-col gap-6">
          <h2 data-drench-reveal className="t-h2 text-white">
            {cta.heading}
          </h2>
          {cta.lead ? (
            <p
              data-drench-reveal
              className="t-lead"
              style={{ color: "var(--_text-soft)" }}
            >
              {cta.lead}
            </p>
          ) : null}
          <div data-drench-reveal className="m-cta mt-1">
            <Button href="/contact?intent=brand" variant="onDark" size="lg" className="press">
              {hero.primaryCta.label}
            </Button>
          </div>
        </div>
      </DrenchBand>
    </div>
  );
}
