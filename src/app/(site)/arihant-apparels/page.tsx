import type { Metadata } from "next";
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
  getPageCopy,
  getPartners,
  getPhotoSlots,
  getSiteSettings,
  getTeam,
  pointById,
  pointsByIds,
} from "@/lib/content";
import {
  breadcrumbJsonLd,
  businessJsonLd,
  faqJsonLd,
  pageMetadata,
} from "@/lib/seo";
import { unitScope } from "@/lib/units";
import { UnitHero } from "../_components/UnitHero";

const UNIT = "apparels" as const;
const PATH = "/arihant-apparels";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPageCopy(UNIT);
  return pageMetadata({
    title: copy?.metaTitle ?? "",
    description: copy?.metaDescription ?? "",
    path: PATH,
  });
}

export default async function ArihantApparelsPage() {
  const [copy, businesses, partners, faqs, settings, team, photos] = await Promise.all([
    getPageCopy(UNIT),
    getBusinesses(),
    getPartners(),
    getFaqs(UNIT),
    getSiteSettings(),
    getTeam(UNIT),
    getPhotoSlots(),
  ]);

  if (!copy) return null;

  const business = businesses.find((b) => b.unit === UNIT);
  const contact = settings.contacts.find((c) => c.unit === UNIT);
  const apparelsPartners = partners.filter((p) => p.unit === UNIT);
  const { hero, sections } = copy;
  const mission = sections.mission;
  const teamSection = sections.team;
  const brandsSection = sections.brands;
  const faqSection = sections.faq;
  const ctaSection = sections.cta;

  // Content is selected by stable id, never by matching the copy.
  // Category-leaders point drives the pull-line; the warehouse and portfolio
  // points support it. The exhibition-footfall point already headlines section
  // 3 and the mission point is carried by section 2, so neither is echoed here.
  const leadersPoint = pointById(business, "category-leaders");
  const supportingPoints = pointsByIds(business, ["warehouse", "portfolio"]);

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

      {/* 1 — Hero (paper): lockup, headline, then the numbers full-measure */}
      {business ? <UnitHero business={business} hero={hero} /> : null}

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
          <Reveal variant="fade" className="m-flow grid gap-y-8 gap-x-16 md:grid-cols-12 md:items-start">
            <ParallaxImage
              src={photos.apparelsWarehouse.src}
              alt={photos.apparelsWarehouse.alt}
              ratio={photos.apparelsWarehouse.ratio}
              sizes="(max-width: 767px) 100vw, 40vw"
              className="m-ar-4-3 border border-line md:col-span-5"
              tilt
              mBleed
            />
            <div className="m-flow flex flex-col gap-6 md:col-span-7">
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
              {/* The retailer ask, inline where the mission has just been made
                  (AA4). */}
              <div className="m-cta mt-1">
                <Button href={hero.primaryCta.href} variant="primary" size="lg" className="press">
                  {hero.primaryCta.label}
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* The film that used to sit here is Arihant Marketing's event footage,
          not Apparels', so it moved to /arihant-marketing. The asset keeps its
          original filename. */}

      {/* 3b — Team (accent-wash): the real people who run it */}
      {team.length ? (
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
              <SectionHeading heading={teamSection.heading} lead={teamSection.lead} />
            </Reveal>
            <div className="m-flow grid gap-y-10 gap-x-16 md:grid-cols-12 md:items-start">
              <ParallaxImage
                src={photos.apparelsTeam.src}
                alt={photos.apparelsTeam.alt}
                ratio={photos.apparelsTeam.ratio}
                sizes="(max-width: 767px) 100vw, 46vw"
                className="border border-line md:col-span-6"
                tilt
                mBleed
              />
              <StaggerGroup
                as="ul"
                from="up"
                className="flex flex-col border-t border-line md:col-span-6"
                stagger={0.08}
                mLedger
              >
                {team.map((member) => (
                  <li
                    key={member.name}
                    className="m-ledger-row flex items-baseline justify-between gap-4 border-b border-line py-4"
                  >
                    <span
                      className="font-sans text-ink"
                      style={{ fontWeight: 650, fontSize: "1.02rem", lineHeight: 1.3 }}
                    >
                      {member.name}
                    </span>
                    <span className="t-small max-w-[13rem] text-right text-ink-soft">
                      {member.title}
                    </span>
                  </li>
                ))}
              </StaggerGroup>
            </div>
          </div>
        </section>
      ) : null}

      {/* 4 — Category-leaders strip (paper): pull-line + accent-marked facts */}
      <section className="section-pad bg-paper" style={unitScope(UNIT)}>
        <div className="container-site">
          <div className="m-flow grid gap-y-8 gap-x-16 md:grid-cols-[1.4fr_1fr] md:items-start">
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
              <StaggerGroup as="ul" from="right" className="flex flex-col" stagger={0.1} mLedger>
                {supportingPoints.map((point, index) => (
                  <li
                    key={point}
                    className={cn(
                      "m-ledger-row t-body border-t border-line py-5 text-ink-soft",
                      index === supportingPoints.length - 1 && "border-b border-line",
                    )}
                  >
                    {point}
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
          <Reveal className="m-flow flex flex-col gap-8">
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
            <div className="m-flow grid gap-10 md:grid-cols-[1fr_1.4fr]">
              <Reveal variant="fade">
                <SectionHeading heading={faqSection?.heading ?? ""} />
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
          {ctaSection?.heading ? (
            <h2 data-drench-reveal className="t-h2">
              {ctaSection.heading}
            </h2>
          ) : null}
          {ctaSection?.lead ? (
            <p data-drench-reveal className="t-lead" style={{ color: "var(--_text-soft)" }}>
              {ctaSection.lead}
            </p>
          ) : null}
          <div data-drench-reveal className="m-cta mt-1 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Button href="/contact?intent=retailer" variant="onDark" size="lg" className="press">
              Shop fast moving brands
            </Button>
            <a
              href="/contact?intent=brand"
              className="m-tap t-small underline-offset-4 hover:underline"
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
