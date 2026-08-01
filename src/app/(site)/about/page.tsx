import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Button,
  DrenchBand,
  HeroIntro,
  JsonLd,
  ParallaxImage,
  Reveal,
  SectionHeading,
  StaggerGroup,
  Timeline,
  ValuePanels,
  cn,
} from "@/components";
import {
  getBusinesses,
  getLeaderPortraits,
  getPageCopy,
  getPhotoSlots,
  getTimeline,
  getValues,
} from "@/lib/content";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { UNIT_ACCENT } from "@/lib/units";

/* Founding date-stamp on the hero ledger: Archivo condensed with tabular
   figures, matching the stat treatment on the unit pages but held quiet — it
   is a date, not a headline number. */
const foundedStyle: CSSProperties = {
  fontFamily: "var(--font-archivo), system-ui, sans-serif",
  fontWeight: 700,
  fontStretch: "85%",
  fontVariantNumeric: "tabular-nums",
  fontSize: "1rem",
  lineHeight: 1.1,
  color: "var(--ink)",
};

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPageCopy("about");
  if (!copy) return {};
  return pageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/about",
  });
}

export default async function AboutPage() {
  const [copy, businesses, values, timeline, portraits, photos] = await Promise.all([
    getPageCopy("about"),
    getBusinesses(),
    getValues(),
    getTimeline(),
    getLeaderPortraits(),
    getPhotoSlots(),
  ]);

  if (!copy) notFound();

  const { hero, sections } = copy;
  const storyBody = sections.story.body ?? [];

  // One nameplate per named leader, tagged with their business + unit accent.
  const leaders = businesses.flatMap((business) =>
    business.leaders.map((name) => ({
      name,
      role: business.name,
      unit: business.unit,
    })),
  );

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />

      {/* 1 — Hero (paper) --------------------------------------------------- */}
      <section className="bg-paper">
        <HeroIntro className="container-site hero-pad">
          <div className="m-flow grid gap-x-14 gap-y-12 lg:grid-cols-12 lg:items-stretch">
            <div className="m-flow-tight flex flex-col items-start gap-6 lg:col-span-7">
              <h1 data-hero-title className="t-display text-ink">
                {hero.heading}
              </h1>
              <p data-hero-reveal className="t-lead measure text-ink-soft">
                {hero.lead}
              </p>
            </div>

            {/* The three houses as a hairline ledger: one row per business,
                stretched to stand level with the headline column rather than
                floating as a short card. Each row opens that unit's page. */}
            <div
              data-hero-reveal
              className="flex flex-col border-t border-line lg:col-span-5"
            >
              {businesses.map((business) => (
                <Link
                  key={business.slug}
                  href={`/${business.slug}`}
                  className="about-house press group flex flex-1 flex-col justify-center gap-2.5 border-b border-line py-5 transition-colors hover:bg-paper-shade"
                >
                  <span
                    aria-hidden="true"
                    className="block h-[3px] w-8 rounded-full"
                    style={{ background: UNIT_ACCENT[business.unit].token }}
                  />
                  <span className="flex items-end justify-between gap-4">
                    <span className="relative block h-8 w-28 shrink-0">
                      <Image
                        src={business.logo}
                        alt={business.name}
                        fill
                        sizes="112px"
                        className="object-contain object-left"
                      />
                    </span>
                    <span style={foundedStyle}>{business.founded}</span>
                  </span>
                  {/* Who runs it, not what it sells. The home page already
                      carries each unit's positioning line; repeating it here
                      told the reader nothing new (G2). */}
                  <span className="t-small text-ink-soft">
                    {business.leaders.join(" and ")}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </HeroIntro>
      </section>

      {/* 2 — Story (paper) -------------------------------------------------- */}
      <section className="border-t border-line bg-paper">
        <div className="container-site section-pad">
          <div className="m-flow grid gap-x-14 gap-y-10 lg:grid-cols-12">
            <div className="prose lg:col-span-7">
              <h2 className="t-h2 text-ink">{sections.story.heading}</h2>
              {storyBody.map((paragraph, i) => (
                <p
                  key={i}
                  className={cn(
                    "mt-6 text-ink",
                    i === 0 ? "t-lead" : "t-body text-ink-soft",
                  )}
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Standing aside: the values headline over an editorial craft photo. */}
            <aside className="lg:col-span-5">
              <div className="m-flow flex flex-col gap-8 lg:sticky lg:top-28">
                <div>
                  <span
                    aria-hidden="true"
                    className="mb-5 block h-[3px] w-16 rounded-full bg-vermillion-deep"
                  />
                  <p
                    className="font-display text-ink"
                    style={{ fontWeight: 700, fontSize: "var(--text-h3)", lineHeight: 1.2 }}
                  >
                    {sections.story.lead}
                  </p>
                </div>
                <ParallaxImage
                  src={photos.aboutCraft.src}
                  alt={photos.aboutCraft.alt}
                  ratio={photos.aboutCraft.ratio}
                  sizes="(max-width: 1023px) 100vw, 40vw"
                  tilt
                  mBleed
                  className="m-ar-4-3"
                />
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* 3 — Values (charcoal): one screen of expanding photographic panels -- */}
      <ValuePanels
        heading={sections.values.heading}
        lead={sections.values.lead}
        items={values.slice(0, 3)}
        images={[photos.aboutValue1, photos.aboutValue2, photos.aboutValue3]}
      />

      {/* 4 — Leadership (paper) -------------------------------------------- */}
      <section className="bg-paper">
        <div className="container-site section-pad m-flow flex flex-col gap-12">
          <Reveal variant="fade">
            <SectionHeading
              heading={sections.leadership.heading}
              lead={sections.leadership.lead}
            />
          </Reveal>
          <StaggerGroup
            className="leaders grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
            from="scale"
            stagger={0.08}
          >
            {leaders.map((leader) => {
              const portrait = portraits[leader.name];
              return (
                <figure
                  key={leader.name}
                  className="leader press-soft flex flex-col overflow-hidden rounded-[2px] border border-line"
                >
                  {/* Portrait frame. Until a real photograph is dropped in, the
                      monogram plate holds the space deliberately rather than
                      leaving the card a bare nameplate. */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-paper-shade">
                    {portrait ? (
                      <Image
                        src={portrait.src}
                        alt={portrait.alt}
                        fill
                        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 22vw"
                        className="object-cover"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 flex items-center justify-center font-display"
                        style={{
                          fontWeight: 700,
                          fontSize: "clamp(3rem, 6vw, 4.25rem)",
                          lineHeight: 1,
                          letterSpacing: "0.02em",
                          color: "var(--line)",
                        }}
                      >
                        {leader.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <figcaption className="leader__cap flex flex-col gap-3 p-6">
                    <span
                      aria-hidden="true"
                      className="block h-[3px] w-10 rounded-full"
                      style={{ background: UNIT_ACCENT[leader.unit].token }}
                    />
                    <span
                      className="font-display text-ink"
                      style={{ fontWeight: 700, fontSize: "var(--text-h4)", lineHeight: 1.25 }}
                    >
                      {leader.name}
                    </span>
                    <span className="t-small text-ink-soft">{leader.role}</span>
                  </figcaption>
                </figure>
              );
            })}
          </StaggerGroup>
        </div>
      </section>

      {/* 5 — Timeline (paper-shade): full-width so its ghost-year column breathes */}
      <section className="bg-paper-shade">
        <div className="container-site section-pad m-flow flex flex-col gap-10">
          <SectionHeading heading={sections.timeline.heading} />
          <Timeline entries={timeline} />
        </div>
      </section>

      {/* 6 — Soft CTA (single vermillion drench) --------------------------- */}
      <DrenchBand className="section-pad">
        <div className="container-site m-flow flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <p
            data-drench-reveal
            className="font-display max-w-[26ch] text-white"
            style={{ fontSize: "var(--text-h3)", fontWeight: 700, lineHeight: 1.2 }}
          >
            Work with the house the Northeast trade already trusts.
          </p>
          <div data-drench-reveal className="m-cta w-full">
            <Button variant="onDark" href={hero.primaryCta.href} className="press">
              {hero.primaryCta.label}
            </Button>
          </div>
        </div>
      </DrenchBand>
    </>
  );
}
