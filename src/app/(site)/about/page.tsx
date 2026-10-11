import type { Metadata } from "next";
import type { UnitKey } from "@/content/types";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Button,
  DrenchBand,
  HeroIntro,
  JsonLd,
  ParallaxImage,
  SectionHeading,
  SectionReveal,
  Timeline,
  ValuePanels,
} from "@/components";
import {
  getBusinesses,
  getLeaderPortraits,
  getPageCopy,
  getPhotoSlots,
  getSiteSettings,
  getTimeline,
  getValues,
} from "@/lib/content";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { UNIT_ACCENT } from "@/lib/units";
import { TowerLedger } from "./_components/TowerLedger";

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
  const [copy, businesses, values, timeline, portraits, photos, settings] = await Promise.all([
    getPageCopy("about"),
    getBusinesses(),
    getValues(),
    getTimeline(),
    getLeaderPortraits(),
    getPhotoSlots(),
    getSiteSettings(),
  ]);

  if (!copy) notFound();

  const { hero, sections } = copy;
  const storyBody = sections.story.body ?? [];

  // One row per named leader, tagged with their business, its floor of
  // Arihant Tower (from the contact settings) and the unit accent.
  const leaders = businesses.flatMap((business) =>
    business.leaders.map((name) => ({
      name,
      role: business.name,
      unit: business.unit,
      floor: settings.contacts.find((c) => c.unit === business.unit)?.floor,
    })),
  );
  // The same floors drive the hero's drawn elevation (change round 10).
  const floors: Partial<Record<UnitKey, string>> = {};
  for (const c of settings.contacts) if (c.floor) floors[c.unit] = c.floor;

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
          <div className="m-flow grid gap-x-14 gap-y-12 md:grid-cols-12 md:items-stretch">
            <div className="m-flow-tight flex flex-col items-start gap-6 md:col-span-7">
              <h1 data-hero-title className="t-display text-ink">
                {hero.heading}
              </h1>
              <p data-hero-reveal className="t-lead measure text-ink-soft">
                {hero.lead}
              </p>
            </div>

            {/* The three houses as a hairline ledger beside the building they
                share, drawn (change round 10): one row per business, level
                with its storey of Arihant Tower, stretched to stand level with
                the headline column. Each row opens that unit's page. */}
            <TowerLedger
              businesses={businesses}
              floors={floors}
              className="md:col-span-5"
            />
          </div>
        </HeroIntro>
      </section>

      {/* 2 — Story (paper-shade since change round 10: it stood on the same
          paper as the hero, a hairline between): one entrance for the band
          (change round 9), the heading's words first, the paragraphs after,
          the photograph opening out of its mask beside them. */}
      <section className="bg-paper-shade">
        <div className="container-site section-pad">
          <SectionReveal className="m-flow grid gap-x-14 gap-y-10 md:grid-cols-12">
            <div className="prose md:col-span-7">
              <h2 data-sr="heading" className="t-h2 text-ink">
                {sections.story.heading}
              </h2>
              <div data-sr="rows">
                {storyBody.map((paragraph, i) => (
                  <p
                    key={i}
                    className={i === 0 ? "mt-6 t-lead text-ink" : "mt-6 t-body text-ink-soft"}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Standing aside: the values headline over the people. */}
            <aside className="md:col-span-5">
              <div className="m-flow flex flex-col gap-8 md:sticky md:top-28">
                <div data-sr="lead">
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
                <div data-sr="media">
                  {/* A paper keyline round the frame, so the photograph reads
                      as an object on the shade (the feature heroes' inset
                      idiom); the mask stays on the wrapper above it. */}
                  <div className="photo-keyline">
                    <ParallaxImage
                      src={photos.aboutCraft.src}
                      alt={photos.aboutCraft.alt}
                      ratio={photos.aboutCraft.ratio}
                      sizes="(max-width: 767px) 100vw, 40vw"
                      tilt
                      mBleed
                      className="m-ar-4-3"
                    />
                  </div>
                </div>
              </div>
            </aside>
          </SectionReveal>
        </div>
      </section>

      {/* 3 — Values (charcoal): one screen of expanding photographic panels -- */}
      <ValuePanels
        heading={sections.values.heading}
        lead={sections.values.lead}
        items={values.slice(0, 3)}
        images={[photos.aboutValue1, photos.aboutValue2, photos.aboutValue3]}
      />

      {/* 4 — Leadership (paper), as a ruled ledger (change round 9). Four
          4:5 plates stood here with nothing but a monogram in each, because
          no portrait exists yet; a ledger says who, which house and which
          floor in one band, and takes a portrait beside the name the day one
          lands. The phone layer already set these hooks as a ledger
          (mobile.css, About), so the two now agree. */}
      <section className="bg-paper">
        <SectionReveal
          className="container-site section-pad m-flow flex flex-col gap-12"
          mobileRows="wipe"
        >
          <SectionHeading
            heading={sections.leadership.heading}
            lead={sections.leadership.lead}
            sr
          />
          <ul data-sr="rows" className="leaders flex flex-col border-t border-line">
            {leaders.map((leader) => {
              const portrait = portraits[leader.name];
              return (
                <li
                  key={leader.name}
                  className="leader press-soft flex items-center gap-6 border-b border-line py-5"
                >
                  <span className="leader__plate relative aspect-square w-16 shrink-0 overflow-hidden rounded-[2px] bg-paper-shade">
                    {portrait ? (
                      <Image
                        src={portrait.src}
                        alt={portrait.alt}
                        fill
                        sizes="(max-width: 767px) 76px, 64px"
                        className="object-cover"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 flex items-center justify-center font-display"
                        style={{
                          fontWeight: 700,
                          fontSize: "1.3rem",
                          lineHeight: 1,
                          letterSpacing: "0.02em",
                          color: "var(--ink-soft)",
                        }}
                      >
                        {leader.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </span>
                  <span className="leader__cap flex flex-1 flex-wrap items-baseline gap-x-6 gap-y-1">
                    <span
                      className="font-display text-ink"
                      style={{ fontWeight: 700, fontSize: "var(--text-h4)", lineHeight: 1.25 }}
                    >
                      {leader.name}
                    </span>
                    <span className="t-small inline-flex items-center gap-2 text-ink-soft">
                      <span
                        aria-hidden="true"
                        className="block h-[3px] w-6 rounded-full"
                        style={{ background: UNIT_ACCENT[leader.unit].token }}
                      />
                      {leader.role}
                    </span>
                    {leader.floor ? (
                      <span className="t-small text-ink-soft md:ml-auto">
                        {leader.floor}, Arihant Tower
                      </span>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ul>
        </SectionReveal>
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
