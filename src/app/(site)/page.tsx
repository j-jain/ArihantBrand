import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Button,
  CardsStack,
  CurtainReveal,
  DrenchBand,
  HeroIntro,
  JsonLd,
  LogoMarquee,
  ParallaxImage,
  Reveal,
  SectionHeading,
  StaggerGroup,
  TestimonialColumns,
  cn,
  trackClass,
} from "@/components";
import {
  getAwards,
  getBusinesses,
  getFunnels,
  getPageCopy,
  getPartners,
  getPhotoSlots,
  getPillars,
  getPosts,
  getSiteSettings,
  getTestimonials,
} from "@/lib/content";
import { localBusinessJsonLd, organizationJsonLd, pageMetadata } from "@/lib/seo";
import { BusinessTags } from "./_components/BusinessTags";
import { EmphasisHeading } from "./_components/EmphasisHeading";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPageCopy("home");
  if (!copy) return {};
  return pageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/",
  });
}

/** Group the WhatsApp/phone digits into the spoken "+91 94350 45528" form. */
function formatTel(digits: string): string {
  const local = digits.replace(/^91/, "");
  const grouped = local.replace(/(\d{5})(\d{5})/, "$1 $2");
  return `+91 ${grouped}`;
}

/** One hero figure line (change round 3): the figure first, set in the stat
 *  face and right-aligned in a shared column so both figures align, then the
 *  label. A line that does not open on a figure (a Studio document still
 *  holding older wording) keeps the old inline treatment across both columns,
 *  so it still reads as one sentence. The words are never changed. */
const LEADING_FIGURE = /^(\d[\d,]*\+?)\s+(\S.*)$/;
function HeroPoint({ text }: { text: string }) {
  const lead = text.match(LEADING_FIGURE);
  if (lead) {
    return (
      <>
        <span className="hero-points__fig">{lead[1]}</span>{" "}
        <span className="hero-points__label">{lead[2]}</span>
      </>
    );
  }
  const fig = text.match(/\d[\d,]*\+?/);
  if (!fig || fig.index === undefined) {
    return <span className="hero-points__inline">{text}</span>;
  }
  return (
    <span className="hero-points__inline">
      {text.slice(0, fig.index)}
      <span className="hero-points__fig">{fig[0]}</span>
      {text.slice(fig.index + fig[0].length)}
    </span>
  );
}

export default async function HomePage() {
  const [
    copy,
    pillars,
    businesses,
    partners,
    posts,
    testimonials,
    settings,
    awards,
    funnels,
    photos,
  ] = await Promise.all([
    getPageCopy("home"),
    getPillars(),
    getBusinesses(),
    getPartners(),
    getPosts(),
    getTestimonials(),
    getSiteSettings(),
    getAwards(),
    getFunnels(),
    getPhotoSlots(),
  ]);

  if (!copy) notFound();

  const { hero, sections } = copy;
  // Partners arrive from the content layer already in wall order, recognised
  // national labels first (byPopularity, src/content/partners.ts), so the
  // marquee only has to thin the tail: every second unranked label keeps the
  // track dense without printing all 77.
  const marqueePartners = [
    ...partners.filter((p) => p.rank !== undefined),
    ...partners
      .filter((p) => p.rank === undefined)
      .filter((_, i) => i % 2 === 0),
  ];
  const latestPosts = posts.slice(0, 3);
  return (
    <>
      <JsonLd data={organizationJsonLd(settings)} />
      <JsonLd data={localBusinessJsonLd(settings)} />

      {/* 1 — Hero (paper): headline, lead, the two figures and the photo, all
          on the first screen at every size (change round 2). From 768px up the
          section is exactly one viewport tall under the header and the photo's
          4:5 frame caps itself to that height, so a short laptop screen crops
          the picture wider instead of pushing the figures below the fold. On a
          phone the photo takes whatever height the copy leaves (mobile.css). */}
      <section className="relative overflow-hidden bg-paper">
        <HeroIntro className="container-site hero--fit relative" pixelEmphasis>
          <div className="hero-fit__grid grid items-center gap-x-10 gap-y-8 md:grid-cols-12">
            <div className="hero-copy flex flex-col items-start gap-6 md:col-span-6">
              <EmphasisHeading
                as="h1"
                className="t-display text-ink"
                text={hero.heading}
                emphasis={hero.headingEmphasis}
                rest={{ "data-hero-title": "", style: { textWrap: "normal" } }}
              />
              <p data-hero-reveal className="t-lead measure text-ink-soft">
                {hero.lead}
              </p>
              {/* The two figures, number first (change round 3): figures in
                  one right-aligned column, labels beside them, one ledger row
                  each, no taller than the sentence rows they replaced. */}
              {hero.points?.length ? (
                <ul data-hero-reveal className="hero-points">
                  {hero.points.map((point) => (
                    <li key={point} className="hero-points__row">
                      <HeroPoint text={point} />
                    </li>
                  ))}
                </ul>
              ) : null}
              {/* The one thing the header cannot do in a line: send a reader to
                  whichever of the three businesses is theirs. The "Partner with
                  us" ask lives in the header and closes the page. */}
              {hero.secondaryCta ? (
                <div data-hero-reveal>
                  <Link
                    href={hero.secondaryCta.href}
                    className="group inline-flex min-h-11 items-center gap-1.5 font-sans font-semibold text-ink transition-colors hover:text-vermillion-deep"
                  >
                    <span className="underline decoration-line decoration-2 underline-offset-4 transition-colors group-hover:decoration-vermillion-deep">
                      {hero.secondaryCta.label}
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-vermillion-deep transition-transform group-hover:translate-x-0.5"
                    >
                      ▸
                    </span>
                  </Link>
                </div>
              ) : null}
            </div>

            <div data-hero-reveal className="hero-fit__media md:col-span-6">
              {/* Stand-in photograph until the client's own lands: swap it in
                  `photoSlots.homeHero` (src/content/images.ts) or the Studio. */}
              <ParallaxImage
                src={photos.homeHero.src}
                alt={photos.homeHero.alt}
                ratio={photos.homeHero.ratio}
                priority
                sizes="(max-width: 767px) 100vw, 48vw"
                tilt
                mBleed
                className="hero-frame"
              />
            </div>
          </div>
        </HeroIntro>
      </section>

      {/* 1b — The two funnels, one card and one CTA each ------------------- */}
      {/* A retailer wanting stock and an investor wanting a store were being
          sent down the same button. They are different people, worth different
          amounts, and each now gets their own card directly below the fold.
          The three-business ticket nav that used to sit here is redundant with
          section 4 and with the header's Businesses panel. */}
      {funnels.length ? (
        <section className="funnels bg-paper-shade">
          <div className="container-site">
            <StaggerGroup
              as="ul"
              from="up"
              stagger={0.1}
              className="funnel-grid grid gap-px bg-line sm:grid-cols-2"
            >
              {funnels.map((funnel) => (
                <li key={funnel.id} className="flex">
                  <Link
                    href={funnel.cta.href}
                    className={cn(
                      "funnel-card press group flex w-full flex-col gap-3",
                      trackClass(`CTA funnel ${funnel.id}`),
                    )}
                  >
                    <h2 className="t-h3 text-ink">{funnel.title}</h2>
                    <p className="t-body measure text-ink-soft">{funnel.text}</p>
                    <span className="funnel-card__cta t-h4 mt-auto inline-flex items-center gap-2 pt-3 text-vermillion-deep">
                      {funnel.cta.label}
                      <span
                        aria-hidden="true"
                        className="transition-transform group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </StaggerGroup>
          </div>
        </section>
      ) : null}

      {/* 2 — Awards and testimonials (charcoal over a working warehouse) ----
          Change round 2 replaced the single retail-partner quote that sat here
          with the whole record: the awards as a ruled list beside the trade's
          voices, scrolling in two slow columns. It keeps the slot directly
          under the funnels, the warehouse ground and the curtain reveal. The
          full trophy case and the rest of the voices live on /recognition. */}
      {awards.length || testimonials.length ? (
        <CurtainReveal>
          <section className="awards-band on-dark relative overflow-hidden">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <Image
                src={photos.homeProofGround.src}
                alt=""
                fill
                sizes="100vw"
                className="object-cover opacity-[0.16]"
              />
              {/* Horizontal scrim on desktop, where the copy holds the left
                  columns. On a phone the copy is full width, so the mobile
                  layer swaps this for a vertical one (see .proof-scrim). */}
              <div
                className="proof-scrim absolute inset-0"
                style={{
                  background:
                    "var(--m-proof-scrim, linear-gradient(90deg, var(--charcoal) 35%, transparent))",
                }}
              />
            </div>

            <div className="container-site section-pad relative">
              <div className="m-flow grid gap-y-10 md:grid-cols-12 md:items-start md:gap-x-14">
                <div className="m-flow flex flex-col gap-8 md:col-span-5">
                  <SectionHeading
                    heading={sections.voice.heading}
                    lead={sections.voice.lead}
                    onDark
                  />
                  {awards.length ? (
                    <ol className="award-list award-list--compact">
                      {awards.map((award, i) => (
                        <li
                          key={award.title}
                          className={cn("award-row", i === 0 && "award-row--lead")}
                        >
                          <h3
                            className={cn(
                              "text-on-charcoal",
                              i === 0 ? "t-h3 max-w-[20ch]" : "t-h4 max-w-[26ch]",
                            )}
                          >
                            {award.title}
                          </h3>
                          <p className="award-row__issuer t-small text-on-charcoal-soft">
                            {award.issuer}
                          </p>
                          <p className="award-row__year t-label text-on-charcoal-soft">
                            {award.year}
                          </p>
                        </li>
                      ))}
                    </ol>
                  ) : null}
                  <p>
                    <Link
                      href="/recognition"
                      className="m-link inline-flex items-center gap-1.5 font-sans font-semibold text-on-charcoal underline-offset-4 hover:underline"
                    >
                      Awards &amp; testimonials
                      <span aria-hidden="true" style={{ color: "var(--vermillion)" }}>
                        →
                      </span>
                    </Link>
                  </p>
                </div>

                <div className="md:col-span-7">
                  <TestimonialColumns testimonials={testimonials} columns={2} tone="dark" />
                </div>
              </div>
            </div>
          </section>
        </CurtainReveal>
      ) : null}

      {/* 3 — Why us? (paper): the pinned card deck. From 768px up the section
          holds one viewport tall while the cards land; on a phone only the deck
          pins and the heading scrolls away. See CardsStack. */}
      <section className="bg-paper">
        <CardsStack
          items={pillars.slice(0, 4)}
          heading={
            <Reveal variant="fade">
              <SectionHeading heading={sections.why.heading} lead={sections.why.lead} />
            </Reveal>
          }
        />
      </section>

      {/* 4 — Businesses (paper-shade), as swing tags (change round 8, the
          client's pick from four prototypes): one tag per business on a
          clothes rail, its line, figures and barcode on the front, its asks
          on the back; a tap turns it over and back, the cord winding as it
          turns. The hero's "The three businesses" link lands here. See
          BusinessTags. */}
      <section id="businesses" className="bg-paper-shade">
        <BusinessTags
          businesses={businesses}
          floors={Object.fromEntries(settings.contacts.map((c) => [c.unit, c.floor]))}
          heading={sections.businesses.heading}
          lead={sections.businesses.lead}
        />
      </section>

      {/* 5 — Brand marquee (paper). Heading and link on the page's left axis
          like every other section (change round 8; they were the one centred
          block on the page). */}
      <section className="bg-paper">
        <div className="brands-band container-site section-pad m-flow flex flex-col gap-10">
          <Reveal variant="fade">
            <SectionHeading heading={sections.brands.heading} lead={sections.brands.lead} />
          </Reveal>
          <LogoMarquee partners={marqueePartners} />
          <p>
            <Link
              href="/brands"
              className="m-link inline-flex items-center gap-1.5 font-sans font-semibold text-vermillion-deep underline-offset-4 hover:underline"
            >
              See all {partners.length} labels
              <span aria-hidden="true">→</span>
            </Link>
          </p>
        </div>
      </section>

      {/* 6 — Trade Notes teaser (paper-shade) ------------------------------ */}
      {latestPosts.length > 0 ? (
        <section className="bg-paper-shade">
          <div className="container-site section-pad m-flow flex flex-col gap-10">
            <Reveal variant="fade">
              <SectionHeading
                heading={sections.notes.heading}
                lead={sections.notes.lead}
              />
            </Reveal>
            {/* Three stacked cards is three screens of scroll on a phone; as a
                rail the whole teaser reads in one band. */}
            <StaggerGroup
              as="ul"
              from="up"
              stagger={0.1}
              className="notes-rail m-rail grid gap-x-6 gap-y-10 sm:grid-cols-3"
            >
              {latestPosts.map((post) => (
                <li key={post.slug} className="flex">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="press group flex h-full w-full flex-col"
                  >
                    <div className="relative aspect-[3/2] overflow-hidden rounded-[6px] border border-line bg-paper">
                      {post.image ? (
                        <Image
                          src={post.image}
                          alt=""
                          fill
                          sizes="(max-width: 639px) 100vw, (max-width: 767px) 50vw, 30vw"
                          className="object-cover transition-transform duration-500 [transition-timing-function:var(--ease)] will-change-transform group-hover:scale-[1.045]"
                        />
                      ) : null}
                    </div>
                    <p className="t-label mt-5 text-vermillion-deep">
                      {post.audience}
                    </p>
                    <h3 className="t-h4 mt-2 text-ink">
                      <span className="underline-offset-4 group-hover:underline">
                        {post.title}
                      </span>
                    </h3>
                    <p
                      className="t-small mt-2.5 text-ink-soft"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {post.excerpt}
                    </p>
                  </Link>
                </li>
              ))}
            </StaggerGroup>
            <p>
              <Link
                href="/blog"
                className="m-link inline-flex items-center gap-1.5 font-sans font-semibold text-vermillion-deep underline-offset-4 hover:underline"
              >
                All Trade Notes
                <span aria-hidden="true">→</span>
              </Link>
            </p>
          </div>
        </section>
      ) : null}

      {/* 7 — CTA band (single vermillion drench) --------------------------- */}
      <DrenchBand id="cta" className="section-pad">
        <div className="container-site m-flow flex flex-col items-start gap-6">
          <h2 data-drench-reveal className="t-h2 max-w-[20ch]">
            {sections.cta.heading}
          </h2>
          <p
            data-drench-reveal
            className="t-lead measure"
            style={{ color: "var(--_text-soft)" }}
          >
            {sections.cta.lead}
          </p>
          <div
            data-drench-reveal
            className="m-cta mt-1 flex flex-wrap items-center gap-x-7 gap-y-4"
          >
            <Button variant="onDark" href={hero.primaryCta.href} className="press">
              {hero.primaryCta.label}
            </Button>
            <a
              href={`tel:+${settings.defaultWhatsapp}`}
              className="m-tap font-sans font-semibold text-white underline-offset-4 hover:underline"
            >
              Call {formatTel(settings.defaultWhatsapp)}
            </a>
          </div>
        </div>
      </DrenchBand>
    </>
  );
}
