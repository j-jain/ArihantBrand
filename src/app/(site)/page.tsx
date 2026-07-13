import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Button,
  JsonLd,
  LogoMarquee,
  Reveal,
  SectionHeading,
  StatBand,
  TestimonialRail,
  ThreadLabel,
  cn,
} from "@/components";
import {
  getBusinesses,
  getGroupStats,
  getPageCopy,
  getPartners,
  getPillars,
  getSiteSettings,
  getTestimonials,
} from "@/lib/content";
import { organizationJsonLd, pageMetadata } from "@/lib/seo";
import { EmphasisHeading } from "./_components/EmphasisHeading";
import { UnitShowcase } from "./_components/UnitShowcase";

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

export default async function HomePage() {
  const [copy, groupStats, pillars, businesses, partners, testimonials, settings] =
    await Promise.all([
      getPageCopy("home"),
      getGroupStats(),
      getPillars(),
      getBusinesses(),
      getPartners(),
      getTestimonials(),
      getSiteSettings(),
    ]);

  if (!copy) notFound();

  const { hero, sections } = copy;
  // Every third partner keeps both distribution portfolios represented.
  const marqueePartners = partners.filter((_, i) => i % 3 === 0);

  return (
    <>
      <JsonLd data={organizationJsonLd(settings)} />

      {/* 1 — Hero (paper) --------------------------------------------------- */}
      <section className="relative overflow-hidden bg-paper">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 right-0 w-[min(56rem,88%)] opacity-[0.1]"
        >
          <Image
            src="/images/motifs/wave-light.png"
            alt=""
            width={1591}
            height={529}
            priority
            className="h-auto w-full"
          />
        </div>

        <div className="container-site section-pad relative">
          <div className="grid items-center gap-x-10 gap-y-12 lg:grid-cols-12">
            <div className="flex flex-col items-start gap-6 lg:col-span-7">
              <ThreadLabel>{hero.threadLabel}</ThreadLabel>
              <EmphasisHeading
                as="h1"
                className="t-display text-ink"
                text={hero.heading}
                emphasis={hero.headingEmphasis}
              />
              <p className="t-lead measure text-ink-soft">{hero.lead}</p>
              <div className="mt-1 flex flex-wrap gap-3">
                <Button variant="primary" size="lg" href={hero.primaryCta.href}>
                  {hero.primaryCta.label}
                </Button>
                {hero.secondaryCta ? (
                  <Button variant="secondary" size="lg" href={hero.secondaryCta.href}>
                    {hero.secondaryCta.label}
                  </Button>
                ) : null}
              </div>
            </div>

            {/* Trade-ticket panel: one bordered panel, hairline-divided rows. */}
            <div className="lg:col-span-5">
              <div className="overflow-hidden rounded-[2px] border border-line bg-white">
                {businesses.map((business, i) => (
                  <Link
                    key={business.slug}
                    href={`/${business.slug}`}
                    className={cn(
                      "group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-paper-shade",
                      i > 0 && "border-t border-line",
                    )}
                  >
                    <span className="flex flex-col gap-0.5">
                      <span
                        className="font-display text-ink"
                        style={{ fontWeight: 700, fontSize: "1.15rem", lineHeight: 1.2 }}
                      >
                        {business.name}
                      </span>
                      <span className="t-small text-ink-soft">{business.positioning}</span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-vermillion-deep transition-transform group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2 — Proof band (charcoal) ----------------------------------------- */}
      <section className="on-dark relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-40 top-1/2 -translate-y-1/2 opacity-[0.07]"
        >
          <Image
            src="/images/motifs/chevron.png"
            alt=""
            width={680}
            height={710}
            className="h-auto w-[42rem] max-w-none"
          />
        </div>

        <div className="container-site section-pad relative flex flex-col gap-10">
          <p
            className="font-display measure italic text-on-charcoal"
            style={{ fontSize: "var(--text-h3)", fontWeight: 700, lineHeight: 1.25 }}
          >
            Named{" "}
            <span style={{ color: "var(--vermillion)" }}>Best Distributor of India</span>{" "}
            by CMAI in 2015.
          </p>
          <StatBand stats={groupStats} onDark />
        </div>
      </section>

      {/* 3 — Why Arihant (paper) ------------------------------------------- */}
      <section className="bg-paper">
        <div className="container-site section-pad flex flex-col gap-12">
          <SectionHeading heading={sections.why.heading} lead={sections.why.lead} />
          <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
            {pillars.slice(0, 4).map((pillar, i) => (
              <Reveal
                key={pillar.title}
                as="div"
                delay={i * 0.08}
                className={cn(
                  "border-t border-line pt-6",
                  i % 2 === 1 && "md:mt-10",
                )}
              >
                <h3 className="t-h3 text-ink">{pillar.title}</h3>
                <p className="t-body measure mt-3 text-ink-soft">{pillar.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4 — Businesses (paper-shade) -------------------------------------- */}
      <section id="businesses" className="bg-paper-shade">
        <div className="container-site section-pad flex flex-col gap-12">
          <SectionHeading
            heading={sections.businesses.heading}
            lead={sections.businesses.lead}
          />
          <div className="flex flex-col">
            {businesses.map((business, i) => (
              <Reveal
                key={business.slug}
                as="div"
                className={cn(
                  i > 0 && "mt-16 border-t border-line pt-16",
                )}
              >
                <UnitShowcase business={business} flip={i % 2 === 1} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5 — Brand marquee (paper) ----------------------------------------- */}
      <section className="bg-paper">
        <div className="container-site section-pad flex flex-col gap-10">
          <SectionHeading
            heading={sections.brands.heading}
            lead={sections.brands.lead}
            align="center"
          />
          <LogoMarquee partners={marqueePartners} />
          <p className="text-center">
            <Link
              href="/brands"
              className="inline-flex items-center gap-1.5 font-sans font-semibold text-vermillion-deep underline-offset-4 hover:underline"
            >
              See all {partners.length} labels
              <span aria-hidden="true">→</span>
            </Link>
          </p>
        </div>
      </section>

      {/* 6 — Testimonials (only when real entries are published) ------------ */}
      {testimonials.length > 0 ? (
        <section className="bg-paper-shade">
          <div className="container-site section-pad">
            <TestimonialRail testimonials={testimonials} />
          </div>
        </section>
      ) : null}

      {/* 7 — CTA band (vermillion drench) ---------------------------------- */}
      <section
        className="on-dark section-pad"
        style={{ background: "var(--vermillion-drench)" }}
      >
        <div className="container-site flex flex-col items-start gap-6">
          <h2 className="t-h2 max-w-[20ch] text-white">{sections.cta.heading}</h2>
          <p className="t-lead measure text-white/90">{sections.cta.lead}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Button variant="onDark" href={hero.primaryCta.href}>
              {hero.primaryCta.label}
            </Button>
            <a
              href={`tel:+${settings.defaultWhatsapp}`}
              className="font-sans font-semibold text-white underline-offset-4 hover:underline focus-visible:outline-white"
            >
              Call {formatTel(settings.defaultWhatsapp)}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
