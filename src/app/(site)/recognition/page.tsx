import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Button,
  CurtainReveal,
  DrenchBand,
  HeroIntro,
  JsonLd,
  ParallaxImage,
  SectionHeading,
  SectionReveal,
  TestimonialColumns,
  TrophyShelf,
} from "@/components";
import { isPendingSlot } from "@/content/images";
import type { Award } from "@/content/types";
import {
  getAwards,
  getPageCopy,
  getPhotoSlots,
  getRecognitionPhotos,
  getTestimonials,
} from "@/lib/content";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { EmphasisHeading } from "../_components/EmphasisHeading";

/* The photograph beside an award row: the award's own image when the Studio
   or the seed carries one, in a 4:5 plate that never crops it (trophies are
   portrait, certificates landscape). Since change round 11 a row without one
   simply has no frame (the drawn stand-in of change round 10 is gone): the
   row runs full width, as on the home band. */
function AwardMedia({ award, lead }: { award: Award; lead?: boolean }) {
  if (!award.image) return null;
  return (
    <div className="award-row__media">
      <span className="award-row__frame">
        <Image
          src={award.image}
          alt={award.imageAlt ?? ""}
          fill
          sizes={lead ? "(max-width: 767px) 7rem, 13rem" : "(max-width: 767px) 5.5rem, 9.5rem"}
          className="award-row__img"
        />
      </span>
    </div>
  );
}

/** The row's grid only when it has a photograph to end on. */
function rowClass(award: Award, lead = false): string {
  return [
    "award-row",
    lead ? "award-row--lead" : "",
    award.image ? "award-row--media" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPageCopy("recognition");
  if (!copy) return {};
  return pageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/recognition",
  });
}

/* No phone formatter here any more. This page's closing band used to print a
   tel: link beside its CTA; it was removed at the client's request, and with
   it the only reason this route read site settings at all. */

export default async function RecognitionPage() {
  const [copy, awards, photos, testimonials, slots] = await Promise.all([
    getPageCopy("recognition"),
    getAwards(),
    getRecognitionPhotos(),
    getTestimonials(),
    getPhotoSlots(),
  ]);

  if (!copy) notFound();

  const { hero, sections } = copy;
  // The whole record (change round 9). The home wall prints the first eight
  // voices; this page is where every one of them can be read.
  const columnVoices = testimonials;
  // Render only the awards the data actually carries (honesty rail): the CMAI
  // award leads the list; the rest follow at a smaller size.
  const [headlineAward, ...otherAwards] = awards;
  // The cabinet's first three objects, in Studio order, stand in the hero
  // while no photograph has been uploaded for it (change round 11).
  const heroTrio = photos.slice(0, 3);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Recognition", path: "/recognition" },
        ])}
      />

      {/* 1 — Hero (paper): the copy in seven columns beside the awards in
          five (change round 10; it was copy alone on section-pad). The frame
          is the `recognitionHero` slot when the Studio carries a photograph;
          otherwise (change round 11) it is a plate with the cabinet's first
          three cut-outs on a shelf, opening out of the hero's mask like a
          photograph would. The drawn stand-in of change round 10 is gone. */}
      <section className="bg-paper">
        <HeroIntro className="container-site hero-pad">
          <div className="rec-hero m-flow grid gap-x-14 gap-y-10 md:grid-cols-12 md:items-center">
            <div className="m-flow flex flex-col items-start gap-6 md:col-span-7">
              <EmphasisHeading
                as="h1"
                className="t-display text-ink"
                text={hero.heading}
                emphasis={hero.headingEmphasis}
                rest={{ "data-hero-title": "" }}
              />
              <p data-hero-reveal className="t-lead measure text-ink-soft">
                {hero.lead}
              </p>
              <div data-hero-reveal className="m-cta mt-1 w-full">
                <Button variant="primary" size="lg" href={hero.primaryCta.href} className="press">
                  {hero.primaryCta.label}
                </Button>
              </div>
            </div>
            <div className="rec-hero__media md:col-span-5">
              <div data-hero-clip className="rec-hero__clip">
                {isPendingSlot(slots.recognitionHero) ? (
                  heroTrio.length ? (
                    <div className="rec-hero__frame shelf-plate m-bleed">
                      <TrophyShelf
                        variant="hero"
                        photos={heroTrio}
                        label={sections.gallery.heading}
                      />
                    </div>
                  ) : null
                ) : (
                  <ParallaxImage
                    src={slots.recognitionHero.src}
                    alt={slots.recognitionHero.alt}
                    ratio={slots.recognitionHero.ratio}
                    priority
                    tilt
                    mBleed
                    sizes="(max-width: 767px) 100vw, 40vw"
                    className="rec-hero__frame border border-line"
                  />
                )}
              </div>
            </div>
          </div>
        </HeroIntro>
      </section>

      {/* 2 — Trophy case (charcoal, curtain-revealed) ----------------------- */}
      <section className="on-dark">
        <CurtainReveal className="container-site section-pad">
          <div className="m-flow flex flex-col gap-12 md:gap-16">
            <SectionHeading
              heading={sections.awards.heading}
              lead={sections.awards.lead}
              onDark
            />

            {/* R1/R2: the award is the headline, not the year. A 7rem "2015"
                used to be the largest thing on the page, which told a reader
                the date mattered more than what was won. Every award now reads
                as one row: what it is, who gave it, and the year set small
                underneath. The CMAI award leads at a larger size because it is
                the one that needs no explaining in this trade. */}
            {/* A row ends on the award's photograph when it has one
                (award-row--media); otherwise it runs full width. */}
            <ol className="award-list">
              {headlineAward ? (
                <li className={rowClass(headlineAward, true)}>
                  <div className="award-row__body">
                    <h3 className="t-h2 max-w-[18ch] text-on-charcoal">
                      {headlineAward.title}
                    </h3>
                    {headlineAward.issuer ? (
                      <p className="award-row__issuer t-lead text-on-charcoal-soft">
                        {headlineAward.issuer}
                      </p>
                    ) : null}
                    {headlineAward.year ? (
                      <p className="award-row__year t-label text-on-charcoal-soft">
                        {headlineAward.year}
                      </p>
                    ) : null}
                    {headlineAward.detail ? (
                      <p className="t-body measure mt-3 text-on-charcoal-soft">
                        {headlineAward.detail}
                      </p>
                    ) : null}
                  </div>
                  <AwardMedia award={headlineAward} lead />
                </li>
              ) : null}

              {otherAwards.map((award) => (
                <li key={award.title} className={rowClass(award)}>
                  <div className="award-row__body">
                    <h3 className="t-h3 max-w-[22ch] text-on-charcoal">
                      {award.title}
                    </h3>
                    {/* An award may be its title alone (change round 13:
                        the footfall entry). */}
                    {award.issuer ? (
                      <p className="award-row__issuer t-body text-on-charcoal-soft">
                        {award.issuer}
                      </p>
                    ) : null}
                    {award.year ? (
                      <p className="award-row__year t-label text-on-charcoal-soft">
                        {award.year}
                      </p>
                    ) : null}
                    {award.detail ? (
                      <p className="t-small measure mt-2 text-on-charcoal-soft">
                        {award.detail}
                      </p>
                    ) : null}
                  </div>
                  <AwardMedia award={award} />
                </li>
              ))}
            </ol>
          </div>
        </CurtainReveal>
      </section>

      {/* 2b — Cabinet (paper): every trophy and certificate cut out of its
          background and stood on a drawn shelf (change round 11, TrophyShelf;
          it was a fan of snapshot cards). The band's one entrance staggers
          the objects onto their shelves after the heading. */}
      {photos.length ? (
        <section className="bg-paper">
          <SectionReveal className="container-site section-pad m-flow flex flex-col gap-10">
            <SectionHeading
              heading={sections.gallery.heading}
              lead={sections.gallery.lead}
              sr
            />
            <TrophyShelf photos={photos} label={sections.gallery.heading} />
          </SectionReveal>
        </section>
      ) : null}

      {/* 3 — Voices (paper-shade) ------------------------------------------- */}
      {/* The dated milestones that sat here ("When each of these happened")
          went in change round 7 at the client's request; /about still tells
          the same years as its timeline. Paper-shade now, so the cabinet and
          the voices do not run together on one paper ground. */}
      <section className="bg-paper-shade">
        <SectionReveal className="container-site section-pad m-flow flex flex-col gap-12">
          <SectionHeading
            heading={sections.voices.heading}
            lead={sections.voices.lead}
            sr
          />
          <div data-sr="item">
            <TestimonialColumns testimonials={columnVoices} />
          </div>
        </SectionReveal>
      </section>

      {/* 4 — Closing CTA (single vermillion drench) ------------------------- */}
      <DrenchBand className="section-pad">
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
          {/* No tel: link here, at the client's request. This band offers
              references on a call, and putting one family member's personal
              number under that promise made him the switchboard for every
              reference request on the site. The inquiry route below reaches
              the right person instead. */}
          <div data-drench-reveal className="m-cta mt-1">
            <Button variant="onDark" href={hero.primaryCta.href} className="press">
              {hero.primaryCta.label}
            </Button>
          </div>
        </div>
      </DrenchBand>
    </>
  );
}
