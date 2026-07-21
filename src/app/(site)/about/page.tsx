import type { Metadata } from "next";
import Image from "next/image";
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
import { stockImages } from "@/content/images";
import {
  getBusinesses,
  getLeaderPortraits,
  getPageCopy,
  getPillars,
  getTimeline,
} from "@/lib/content";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { UNIT_ACCENT } from "@/lib/units";

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
  const [copy, businesses, pillars, timeline, portraits] = await Promise.all([
    getPageCopy("about"),
    getBusinesses(),
    getPillars(),
    getTimeline(),
    getLeaderPortraits(),
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
        <HeroIntro className="container-site section-pad">
          <div className="grid items-start gap-x-10 gap-y-12 lg:grid-cols-12">
            <div className="flex flex-col items-start gap-6 lg:col-span-7">
              <h1 data-hero-title className="t-display text-ink">
                {hero.heading}
              </h1>
              <p data-hero-reveal className="t-lead measure text-ink-soft">
                {hero.lead}
              </p>
            </div>

            {/* Founding-years ticket, echoing the home trade-ticket panel. */}
            <div data-hero-reveal className="lg:col-span-5 lg:pt-2">
              <div className="overflow-hidden rounded-[2px] border border-line bg-white">
                {businesses.map((business, i) => (
                  <div
                    key={business.slug}
                    className={cn(
                      "flex items-center gap-4 px-5 py-4",
                      i > 0 && "border-t border-line",
                    )}
                  >
                    <div className="relative h-8 w-24 shrink-0">
                      <Image
                        src={business.logo}
                        alt={business.name}
                        fill
                        sizes="96px"
                        className="object-contain object-left"
                      />
                    </div>
                    <p className="t-small text-ink-soft">{business.founded}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </HeroIntro>
      </section>

      {/* 2 — Story (paper) -------------------------------------------------- */}
      <section className="border-t border-line bg-paper">
        <div className="container-site section-pad">
          <div className="grid gap-x-14 gap-y-10 lg:grid-cols-12">
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
              <div className="flex flex-col gap-8 lg:sticky lg:top-28">
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
                  src={stockImages.aboutCraft1.src}
                  alt={stockImages.aboutCraft1.alt}
                  ratio="4 / 5"
                  sizes="(max-width: 1023px) 100vw, 40vw"
                  tilt
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
        items={pillars.slice(0, 3)}
        images={[
          stockImages.aboutCraft2,
          stockImages.apparelsRacks1,
          stockImages.systemsWarehouse1,
        ]}
      />

      {/* 4 — Leadership (paper) -------------------------------------------- */}
      <section className="bg-paper">
        <div className="container-site section-pad flex flex-col gap-12">
          <Reveal variant="fade">
            <SectionHeading
              heading={sections.leadership.heading}
              lead={sections.leadership.lead}
            />
          </Reveal>
          <StaggerGroup
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
            from="scale"
            stagger={0.08}
          >
            {leaders.map((leader) => {
              const portrait = portraits[leader.name];
              return (
                <figure
                  key={leader.name}
                  className="flex flex-col overflow-hidden rounded-[2px] border border-line"
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
                  <figcaption className="flex flex-col gap-3 p-6">
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
        <div className="container-site section-pad flex flex-col gap-10">
          <SectionHeading heading={sections.timeline.heading} />
          <Timeline entries={timeline} />
        </div>
      </section>

      {/* 6 — Soft CTA (single vermillion drench) --------------------------- */}
      <DrenchBand className="section-pad">
        <div className="container-site flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <p
            data-drench-reveal
            className="font-display max-w-[26ch] text-white"
            style={{ fontSize: "var(--text-h3)", fontWeight: 700, lineHeight: 1.2 }}
          >
            Work with the house the Northeast trade already trusts.
          </p>
          <div data-drench-reveal>
            <Button variant="onDark" href={hero.primaryCta.href}>
              {hero.primaryCta.label}
            </Button>
          </div>
        </div>
      </DrenchBand>
    </>
  );
}
