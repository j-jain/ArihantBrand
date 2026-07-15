import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Button,
  DrenchBand,
  HeroIntro,
  JsonLd,
  LogoMarquee,
  ParallaxImage,
  Reveal,
  SectionHeading,
  StaggerGroup,
  StatBand,
  TestimonialRail,
  cn,
} from "@/components";
import { stockImages } from "@/content/images";
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

      {/* 1 — Hero (paper): split headline + editorial garment image ---------- */}
      <section className="relative overflow-hidden bg-paper">
        <HeroIntro className="container-site section-pad relative">
          <div className="grid items-center gap-x-10 gap-y-12 lg:grid-cols-12">
            <div className="flex flex-col items-start gap-6 lg:col-span-7">
              <EmphasisHeading
                as="h1"
                className="t-display text-ink"
                text={hero.heading}
                emphasis={hero.headingEmphasis}
                rest={{ "data-hero-title": "", style: { textWrap: "normal" } }}
              />
              <p
                data-hero-reveal
                className="t-lead measure text-ink-soft"
              >
                {hero.lead}
              </p>
              <div data-hero-reveal className="mt-1 flex flex-wrap gap-3">
                <Button variant="primary" size="lg" href={hero.primaryCta.href}>
                  {hero.primaryCta.label}
                </Button>
                {hero.secondaryCta ? (
                  <Button
                    variant="secondary"
                    size="lg"
                    href={hero.secondaryCta.href}
                  >
                    {hero.secondaryCta.label}
                  </Button>
                ) : null}
              </div>
            </div>

            <div data-hero-reveal className="lg:col-span-5">
              <ParallaxImage
                src={stockImages.homeTexture.src}
                alt={stockImages.homeTexture.alt}
                ratio="4 / 5"
                priority
                sizes="(max-width: 1023px) 100vw, 42vw"
              />
            </div>
          </div>

          {/* Trade-ticket quick nav to the three businesses. */}
          <div
            data-hero-reveal
            className="mt-14 overflow-hidden rounded-[2px] border border-line bg-line"
          >
            <div className="grid gap-px bg-line sm:grid-cols-3">
              {businesses.map((business) => (
                <Link
                  key={business.slug}
                  href={`/${business.slug}`}
                  className="group flex flex-col gap-1 bg-white px-5 py-4 transition-colors hover:bg-paper-shade"
                >
                  <span className="flex items-center justify-between gap-3">
                    <span
                      className="font-display text-ink"
                      style={{ fontWeight: 700, fontSize: "1.1rem", lineHeight: 1.2 }}
                    >
                      {business.name}
                    </span>
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-vermillion-deep transition-transform group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </span>
                  <span className="t-small text-ink-soft">
                    {business.positioning}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </HeroIntro>
      </section>

      {/* 2 — Proof band (charcoal over a working warehouse) ------------------ */}
      <section className="on-dark relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <Image
            src={stockImages.marketingWarehouse2.src}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-[0.16]"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, var(--charcoal) 30%, transparent)",
            }}
          />
        </div>

        <div className="container-site section-pad relative flex flex-col gap-10">
          <Reveal
            as="p"
            variant="fade"
            className="font-display measure italic text-on-charcoal"
            style={{ fontSize: "var(--text-h3)", fontWeight: 700, lineHeight: 1.25 }}
          >
            Named{" "}
            <span style={{ color: "var(--vermillion)" }}>
              Best Distributor of India
            </span>{" "}
            by CMAI in 2015. We have held the line every season since.
          </Reveal>
          <StatBand stats={groupStats} onDark />
        </div>
      </section>

      {/* 3 — Why Arihant (paper) ------------------------------------------- */}
      <section className="bg-paper">
        <div className="container-site section-pad flex flex-col gap-12">
          <Reveal variant="fade">
            <SectionHeading heading={sections.why.heading} lead={sections.why.lead} />
          </Reveal>
          <StaggerGroup
            className="grid gap-x-12 gap-y-10 md:grid-cols-2"
            from="up"
            stagger={0.12}
          >
            {pillars.slice(0, 4).map((pillar, i) => (
              <div
                key={pillar.title}
                className={cn(
                  "border-t border-line pt-6",
                  i % 2 === 1 && "md:mt-10",
                )}
              >
                <h3 className="t-h3 text-ink">{pillar.title}</h3>
                <p className="t-body measure mt-3 text-ink-soft">{pillar.text}</p>
              </div>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* 4 — Businesses (paper-shade) -------------------------------------- */}
      <section id="businesses" className="bg-paper-shade">
        <div className="container-site section-pad flex flex-col gap-12">
          <Reveal variant="fade">
            <SectionHeading
              heading={sections.businesses.heading}
              lead={sections.businesses.lead}
            />
          </Reveal>
          <div className="flex flex-col">
            {businesses.map((business, i) => (
              <Reveal
                key={business.slug}
                as="div"
                variant={i % 2 === 0 ? "rise" : "clip"}
                className={cn(i > 0 && "mt-16 border-t border-line pt-16")}
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
          <Reveal variant="fade">
            <SectionHeading
              heading={sections.brands.heading}
              lead={sections.brands.lead}
              align="center"
            />
          </Reveal>
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

      {/* 7 — CTA band (single vermillion drench) --------------------------- */}
      <DrenchBand id="cta" className="section-pad">
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
