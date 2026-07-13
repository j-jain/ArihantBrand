import type { Metadata } from "next";

import {
  Button,
  JsonLd,
  LogoWall,
  Reveal,
  SectionHeading,
  ThreadLabel,
} from "@/components";
import { getPageCopy, getPartners } from "@/lib/content";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

const PATH = "/brands";

function HeroHeading({ heading, emphasis }: { heading: string; emphasis?: string }) {
  const i = emphasis ? heading.indexOf(emphasis) : -1;
  if (!emphasis || i === -1) {
    return <h1 className="t-display text-ink">{heading}</h1>;
  }
  return (
    <h1 className="t-display text-ink">
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
      <section className="section-pad bg-paper">
        <div className="container-site">
          <div className="flex max-w-3xl flex-col gap-6">
            <div>
              <ThreadLabel>{hero.threadLabel}</ThreadLabel>
            </div>
            <div className="flex flex-col gap-5">
              <HeroHeading heading={hero.heading} emphasis={hero.headingEmphasis} />
              <div
                aria-hidden="true"
                style={{ height: 3, width: "clamp(3rem, 8vw, 4.5rem)", background: "var(--vermillion)" }}
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
            <p className="t-small text-ink-soft">
              {marketingCount} labels via Arihant Marketing &middot; {apparelsCount} via Arihant Apparels
            </p>
          </div>
        </div>
      </section>

      {/* 2 — The wall (paper-shade): filterable, all partners */}
      <section className="section-pad bg-paper-shade">
        <div className="container-wide">
          <Reveal className="flex flex-col gap-8">
            <SectionHeading heading={sections.wall?.heading ?? "The portfolio"} />
            <LogoWall partners={partners} filterable />
          </Reveal>
        </div>
      </section>

      {/* 3 — CTA band (charcoal) */}
      <section className="section-pad on-dark">
        <div className="container-site">
          <div className="flex max-w-3xl flex-col gap-6">
            <h2 className="t-h2 text-on-charcoal">{cta.heading}</h2>
            {cta.lead ? <p className="t-lead text-on-charcoal-soft">{cta.lead}</p> : null}
            <div className="mt-1">
              <Button href="/contact?intent=brand" variant="onDark" size="lg">
                {hero.primaryCta.label}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
