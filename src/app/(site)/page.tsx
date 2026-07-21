import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Button,
  CardsStack,
  CurtainReveal,
  DrenchBand,
  FlipLead,
  HeroIntro,
  InfrastructureSection,
  JsonLd,
  LogoMarquee,
  ParallaxImage,
  Reveal,
  SectionHeading,
  StaggerGroup,
  StatBand,
  cn,
  initialsOf,
} from "@/components";
import { stockImages } from "@/content/images";
import {
  getBusinesses,
  getGroupStats,
  getPageCopy,
  getPartners,
  getPillars,
  getPosts,
  getSiteSettings,
  getSystems,
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
  const [
    copy,
    groupStats,
    pillars,
    businesses,
    partners,
    posts,
    systems,
    testimonials,
    settings,
  ] = await Promise.all([
    getPageCopy("home"),
    getGroupStats(),
    getPillars(),
    getBusinesses(),
    getPartners(),
    getPosts(),
    getSystems(),
    getTestimonials(),
    getSiteSettings(),
  ]);

  if (!copy) notFound();

  const { hero, sections } = copy;
  // Every second partner keeps the marquee dense without listing all 77.
  const marqueePartners = partners.filter((_, i) => i % 2 === 0);
  const latestPosts = posts.slice(0, 3);
  const featured = testimonials[0];

  return (
    <>
      <JsonLd data={organizationJsonLd(settings)} />

      {/* 1 — Hero (paper): split headline + editorial garment image ---------- */}
      <section className="relative overflow-hidden bg-paper">
        <HeroIntro className="container-site hero-pad relative">
          <div className="grid items-center gap-x-10 gap-y-12 lg:grid-cols-12">
            <div className="flex flex-col items-start gap-6 lg:col-span-7">
              <EmphasisHeading
                as="h1"
                className="t-display text-ink"
                text={hero.heading}
                emphasis={hero.headingEmphasis}
                rest={{ "data-hero-title": "", style: { textWrap: "normal" } }}
              />
              {/* FlipLead can't carry data-* through its props, so the reveal
                  hook lives on this wrapper — HeroIntro selects it either way. */}
              <div data-hero-reveal className="measure">
                <FlipLead
                  text={hero.lead}
                  className="t-lead text-ink-soft"
                />
              </div>
              <div
                data-hero-reveal
                className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-3"
              >
                <Button variant="primary" size="lg" href={hero.primaryCta.href}>
                  {hero.primaryCta.label}
                </Button>
                {hero.secondaryCta ? (
                  <Link
                    href={hero.secondaryCta.href}
                    className="group inline-flex min-h-11 items-center gap-1.5 font-sans font-semibold text-ink-soft transition-colors hover:text-ink"
                  >
                    <span className="underline-offset-4 group-hover:underline">
                      {hero.secondaryCta.label}
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-vermillion-deep transition-transform group-hover:translate-x-0.5"
                    >
                      ▸
                    </span>
                  </Link>
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
                tilt
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
                  className="group flex flex-col gap-3 bg-white px-5 py-5 transition-colors hover:bg-paper-shade"
                >
                  <span className="relative block h-10 w-full">
                    <Image
                      src={business.logo}
                      alt=""
                      fill
                      sizes="(max-width: 639px) 80vw, 22vw"
                      className="object-contain object-left"
                    />
                  </span>
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

      {/* 2 — Proof band (charcoal over a working warehouse), curtain-revealed */}
      <CurtainReveal>
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
            <div className="flex max-w-3xl flex-col gap-5">
              <SectionHeading heading={sections.proof.heading} onDark />
              <span
                aria-hidden="true"
                className="block h-[3px] w-14 rounded-full"
                style={{ background: "var(--vermillion)" }}
              />
              {sections.proof.lead ? (
                <p
                  className="font-display measure italic text-on-charcoal"
                  style={{
                    fontSize: "var(--text-h3)",
                    fontWeight: 700,
                    lineHeight: 1.28,
                  }}
                >
                  {sections.proof.lead}
                </p>
              ) : null}
            </div>
            <StatBand stats={groupStats} onDark />
          </div>
        </section>
      </CurtainReveal>

      {/* 3 — Why Arihant (paper): sticky heading beside the pillar card stack */}
      <section className="bg-paper">
        <div className="container-site section-pad">
          <div className="grid gap-x-12 gap-y-10 md:grid-cols-12">
            <Reveal variant="fade" className="md:col-span-5">
              <div className="stack-heading">
                <SectionHeading heading={sections.why.heading} lead={sections.why.lead} />
              </div>
            </Reveal>
            <div className="md:col-span-7">
              <CardsStack items={pillars.slice(0, 4)} />
            </div>
          </div>
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

      {/* 5 — Infrastructure / systems (charcoal) --------------------------- */}
      <InfrastructureSection
        heading={sections.systems.heading}
        lead={sections.systems.lead}
        closing={sections.systems.body?.[0]}
        systems={systems}
      />

      {/* 6 — Brand marquee (paper) ----------------------------------------- */}
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

      {/* 7 — Trade Notes teaser (paper-shade) ------------------------------ */}
      {latestPosts.length > 0 ? (
        <section className="bg-paper-shade">
          <div className="container-site section-pad flex flex-col gap-10">
            <Reveal variant="fade">
              <SectionHeading
                heading={sections.notes.heading}
                lead={sections.notes.lead}
              />
            </Reveal>
            <StaggerGroup
              as="ul"
              from="up"
              stagger={0.1}
              className="grid gap-x-6 gap-y-10 sm:grid-cols-3"
            >
              {latestPosts.map((post) => (
                <li key={post.slug} className="flex">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex h-full w-full flex-col"
                  >
                    <div className="relative aspect-[3/2] overflow-hidden rounded-[6px] border border-line bg-paper">
                      {post.image ? (
                        <Image
                          src={post.image}
                          alt=""
                          fill
                          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 30vw"
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
                className="inline-flex items-center gap-1.5 font-sans font-semibold text-vermillion-deep underline-offset-4 hover:underline"
              >
                All Trade Notes
                <span aria-hidden="true">→</span>
              </Link>
            </p>
          </div>
        </section>
      ) : null}

      {/* 8 — Voice strip (paper): featured quote (7) beside a real store photo (5) */}
      {featured ? (
        <section className="bg-paper">
          <div className="container-site section-pad flex flex-col gap-8">
            <div className="grid gap-y-10 lg:grid-cols-12 lg:items-start lg:gap-16">
              <div className="flex flex-col gap-8 lg:col-span-7">
                <Reveal variant="fade">
                  <h2 className="t-h4 text-ink-soft">{sections.voice.heading}</h2>
                </Reveal>
                <Reveal variant="clip">
                  <figure className="flex flex-col gap-8">
                    <blockquote
                      className="font-display measure italic text-ink"
                      style={{ fontSize: "var(--text-h3)", lineHeight: 1.35 }}
                    >
                      <span aria-hidden="true" className="text-vermillion-deep">
                        “
                      </span>
                      {featured.quote}
                      <span aria-hidden="true" className="text-vermillion-deep">
                        ”
                      </span>
                    </blockquote>
                    <figcaption className="flex items-center gap-4">
                      <span
                        aria-hidden="true"
                        className="flex h-12 w-12 flex-none items-center justify-center rounded-full border border-line bg-paper-shade font-sans text-ink"
                        style={{ fontWeight: 650, fontSize: "0.9rem" }}
                      >
                        {initialsOf(featured.name)}
                      </span>
                      <span className="flex flex-col">
                        <span
                          className="t-small text-ink"
                          style={{ fontWeight: 650 }}
                        >
                          {featured.name}
                        </span>
                        {featured.role ? (
                          <span className="t-small text-ink-soft">
                            {featured.role}
                          </span>
                        ) : null}
                      </span>
                    </figcaption>
                  </figure>
                </Reveal>
              </div>

              <Reveal as="div" variant="clip" className="lg:col-span-5">
                <figure className="flex flex-col gap-3">
                  <ParallaxImage
                    src="/images/photos/store-urban-closet.jpg"
                    alt="Urban Closet in Guwahati, an Arihant Retail multi-brand store"
                    ratio="4 / 5"
                    sizes="(max-width: 1023px) 100vw, 32vw"
                    className="border border-line"
                    tilt
                  />
                  <figcaption className="t-small text-ink-soft">
                    Urban Closet, Guwahati · Arihant Retail
                  </figcaption>
                </figure>
              </Reveal>
            </div>
            <p>
              <Link
                href="/recognition"
                className="inline-flex items-center gap-1.5 font-sans font-semibold text-vermillion-deep underline-offset-4 hover:underline"
              >
                Awards &amp; testimonials
                <span aria-hidden="true">→</span>
              </Link>
            </p>
          </div>
        </section>
      ) : null}

      {/* 9 — CTA band (single vermillion drench) --------------------------- */}
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
