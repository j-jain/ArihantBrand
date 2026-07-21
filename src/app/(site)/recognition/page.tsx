import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Button,
  CardFan,
  CurtainReveal,
  DrenchBand,
  HeroIntro,
  JsonLd,
  Reveal,
  SectionHeading,
  TestimonialColumns,
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
  // Render only the awards the data actually carries (honesty rail): the CMAI
  // award anchors the trophy case; the rest sit in the flanking cards.
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
          <div className="flex max-w-3xl flex-col items-start gap-6">
            <h1 data-hero-title className="t-display text-ink">
              {hero.heading}
            </h1>
            <p data-hero-reveal className="t-lead measure text-ink-soft">
              {hero.lead}
            </p>
            <div data-hero-reveal className="mt-1">
              <Button variant="primary" size="lg" href={hero.primaryCta.href}>
                {hero.primaryCta.label}
              </Button>
            </div>
          </div>
        </HeroIntro>
      </section>

      {/* 2 — Trophy case (charcoal, curtain-revealed) ----------------------- */}
      <section className="on-dark">
        <CurtainReveal className="container-site section-pad">
          <div className="flex flex-col gap-12 lg:gap-16">
            <SectionHeading
              heading={sections.awards.heading}
              lead={sections.awards.lead}
              onDark
            />

            <div className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
              {/* Centerpiece: the CMAI award, oversized. */}
              {headlineAward ? (
                <div className="flex flex-col gap-4 lg:col-span-7">
                  <span
                    className="t-stat"
                    style={{
                      color: "var(--vermillion)",
                      fontSize: "clamp(3.75rem, 9vw, 7rem)",
                      lineHeight: 0.95,
                    }}
                  >
                    {headlineAward.year}
                  </span>
                  <h3 className="t-h2 max-w-[16ch] text-on-charcoal">
                    {headlineAward.title}
                  </h3>
                  <p className="t-label text-on-charcoal-soft">
                    {headlineAward.issuer}
                  </p>
                  <p className="t-body measure text-on-charcoal-soft">
                    {headlineAward.detail}
                  </p>
                </div>
              ) : null}

              {/* Flanking cards: the remaining recognitions. */}
              {otherAwards.length > 0 ? (
                <div className="flex flex-col gap-6 lg:col-span-5">
                  {otherAwards.map((award) => (
                    <div
                      key={award.title}
                      className="flex flex-col gap-2 p-6"
                      style={{
                        background: "var(--charcoal-raise)",
                        border: "1px solid var(--line-dark)",
                        borderRadius: "10px",
                      }}
                    >
                      <span
                        aria-hidden="true"
                        className="mb-1 block h-2.5 w-2.5"
                        style={{ background: "var(--vermillion)" }}
                      />
                      <span className="t-label text-on-charcoal-soft">
                        {award.year}
                      </span>
                      <h4 className="t-h4 text-on-charcoal">{award.title}</h4>
                      <p className="t-small text-on-charcoal-soft">
                        {award.issuer}
                      </p>
                      <p className="t-small text-on-charcoal-soft">
                        {award.detail}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </CurtainReveal>
      </section>

      {/* 2b — Cabinet gallery (paper): real certificate & trophy photos ----- */}
      {photos.length ? (
        <section className="bg-paper">
          <div className="container-site section-pad flex flex-col gap-10">
            <SectionHeading
              heading={sections.gallery.heading}
              lead={sections.gallery.lead}
            />
            <CardFan photos={photos} label={sections.gallery.heading} />
          </div>
        </section>
      ) : null}

      {/* 3 — Milestones strip (paper-shade) --------------------------------- */}
      <section className="bg-paper-shade">
        <div className="container-site section-pad flex flex-col gap-8">
          <SectionHeading heading={sections.milestones.heading} />
          <Reveal variant="fade">
            <ol className="grid grid-cols-2 gap-px overflow-hidden rounded-[2px] border border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
              {timeline.map((entry) => (
                <li
                  key={entry.year}
                  className="flex flex-col gap-1 bg-paper px-4 py-5"
                >
                  <span
                    className="font-display text-ink"
                    style={{ fontWeight: 700, fontSize: "1.15rem", lineHeight: 1.2 }}
                  >
                    {entry.year}
                  </span>
                  <span className="t-small text-ink-soft">{entry.title}</span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* 4 — Voices (paper) ------------------------------------------------- */}
      <section className="bg-paper">
        <div className="container-site section-pad flex flex-col gap-12">
          <SectionHeading
            heading={sections.voices.heading}
            lead={sections.voices.lead}
          />
          <TestimonialColumns testimonials={testimonials} />
        </div>
      </section>

      {/* 5 — Closing CTA (single vermillion drench) ------------------------- */}
      <DrenchBand className="section-pad">
        <div className="container-site flex flex-col items-start gap-6">
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
            className="mt-1 flex flex-wrap items-center gap-x-7 gap-y-4"
          >
            <Button variant="onDark" href={hero.primaryCta.href}>
              {hero.primaryCta.label}
            </Button>
            <a
              href={`tel:+${settings.defaultWhatsapp}`}
              className="font-sans font-semibold text-white underline-offset-4 hover:underline"
            >
              Call {formatTel(settings.defaultWhatsapp)}
            </a>
          </div>
        </div>
      </DrenchBand>
    </>
  );
}
