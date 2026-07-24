import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Button,
  CardFan,
  CurtainReveal,
  DrenchBand,
  HeroIntro,
  JsonLd,
  SectionHeading,
  TestimonialColumns,
  Timeline,
} from "@/components";
import {
  getAwards,
  getPageCopy,
  getRecognitionPhotos,
  getSiteSettings,
  getTestimonials,
  getTimeline,
} from "@/lib/content";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { featuredTestimonialIndex } from "@/content/seed";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPageCopy("recognition");
  if (!copy) return {};
  return pageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/recognition",
  });
}

/** Group the WhatsApp/phone digits into the spoken "+91 94350 45528" form. */
function formatTel(digits: string): string {
  const local = digits.replace(/^91/, "");
  const grouped = local.replace(/(\d{5})(\d{5})/, "$1 $2");
  return `+91 ${grouped}`;
}

export default async function RecognitionPage() {
  const [copy, awards, photos, timeline, testimonials, settings] = await Promise.all([
    getPageCopy("recognition"),
    getAwards(),
    getRecognitionPhotos(),
    getTimeline(),
    getTestimonials(),
    getSiteSettings(),
  ]);

  if (!copy) notFound();

  const { hero, sections } = copy;
  // The home page has already printed one of these voices; show the rest here
  // so a reader never meets the same quote twice (HP12).
  const columnVoices = testimonials.filter(
    (_, i) => i !== featuredTestimonialIndex,
  );
  // Render only the awards the data actually carries (honesty rail): the CMAI
  // award leads the list; the rest follow at a smaller size.
  const [headlineAward, ...otherAwards] = awards;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Recognition", path: "/recognition" },
        ])}
      />

      {/* 1 — Hero (paper) --------------------------------------------------- */}
      <section className="bg-paper">
        <HeroIntro className="container-site section-pad">
          <div className="m-flow flex max-w-3xl flex-col items-start gap-6">
            <h1 data-hero-title className="t-display text-ink">
              {hero.heading}
            </h1>
            <p data-hero-reveal className="t-lead measure text-ink-soft">
              {hero.lead}
            </p>
            <div data-hero-reveal className="m-cta mt-1 w-full">
              <Button variant="primary" size="lg" href={hero.primaryCta.href} className="press">
                {hero.primaryCta.label}
              </Button>
            </div>
          </div>
        </HeroIntro>
      </section>

      {/* 2 — Trophy case (charcoal, curtain-revealed) ----------------------- */}
      <section className="on-dark">
        <CurtainReveal className="container-site section-pad">
          <div className="m-flow flex flex-col gap-12 lg:gap-16">
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
            <ol className="award-list">
              {headlineAward ? (
                <li className="award-row award-row--lead">
                  <h3 className="t-h2 max-w-[18ch] text-on-charcoal">
                    {headlineAward.title}
                  </h3>
                  <p className="award-row__issuer t-lead text-on-charcoal-soft">
                    {headlineAward.issuer}
                  </p>
                  <p className="award-row__year t-label text-on-charcoal-soft">
                    {headlineAward.year}
                  </p>
                  {headlineAward.detail ? (
                    <p className="t-body measure mt-3 text-on-charcoal-soft">
                      {headlineAward.detail}
                    </p>
                  ) : null}
                </li>
              ) : null}

              {otherAwards.map((award) => (
                <li key={award.title} className="award-row">
                  <h3 className="t-h3 max-w-[22ch] text-on-charcoal">
                    {award.title}
                  </h3>
                  <p className="award-row__issuer t-body text-on-charcoal-soft">
                    {award.issuer}
                  </p>
                  <p className="award-row__year t-label text-on-charcoal-soft">
                    {award.year}
                  </p>
                  {award.detail ? (
                    <p className="t-small measure mt-2 text-on-charcoal-soft">
                      {award.detail}
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </CurtainReveal>
      </section>

      {/* 2b — Cabinet gallery (paper): real certificate & trophy photos ----- */}
      {photos.length ? (
        <section className="bg-paper">
          <div className="container-site section-pad m-flow flex flex-col gap-10">
            <SectionHeading
              heading={sections.gallery.heading}
              lead={sections.gallery.lead}
            />
            <CardFan photos={photos} label={sections.gallery.heading} />
          </div>
        </section>
      ) : null}

      {/* 3 — Timeline (paper-shade) ----------------------------------------- */}
      {/* R7: this was a 6-cell grid of year + title, which gave a reader six
          labels and no account of anything. It is the same Timeline the About
          page uses, so each year carries its story here too. */}
      <section className="bg-paper-shade">
        <div className="container-site section-pad m-flow flex flex-col gap-10">
          <SectionHeading
            heading={sections.milestones.heading}
            lead={sections.milestones.lead}
          />
          <Timeline entries={timeline} />
        </div>
      </section>

      {/* 4 — Voices (paper) ------------------------------------------------- */}
      <section className="bg-paper">
        <div className="container-site section-pad m-flow flex flex-col gap-12">
          <SectionHeading
            heading={sections.voices.heading}
            lead={sections.voices.lead}
          />
          <TestimonialColumns testimonials={columnVoices} />
        </div>
      </section>

      {/* 5 — Closing CTA (single vermillion drench) ------------------------- */}
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
