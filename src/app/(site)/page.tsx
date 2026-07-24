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
  InfrastructureSection,
  JsonLd,
  LogoMarquee,
  ParallaxImage,
  Reveal,
  SectionHeading,
  StaggerGroup,
  StatBand,
  WhatsAppIcon,
  cn,
  initialsOf,
} from "@/components";
import { stockImages } from "@/content/images";
import { phrase } from "@/content/facts";
import {
  getBusinesses,
  getFunnels,
  getGroupStats,
  getPageCopy,
  getPartners,
  getPillars,
  getPosts,
  getSiteSettings,
  getStores,
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
    stores,
    funnels,
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
    getStores(),
    getFunnels(),
  ]);

  if (!copy) notFound();

  const { hero, sections } = copy;
  // Every second partner keeps the marquee dense without listing all 77.
  const marqueePartners = partners.filter((_, i) => i % 2 === 0);
  const latestPosts = posts.slice(0, 3);
  const featured = testimonials[0];
  // The voice strip stands a real store photo beside the quote. It comes from
  // the store data rather than a path typed into this file, so swapping the
  // photograph is a content edit and the caption can never contradict the
  // store list.
  const featuredStore = stores.find((store) => Boolean(store.image));

  // Three figures above the fold, in the order a retailer weighs them: what
  // you can stock, who already buys, how long we have been at it. The fourth
  // group figure (warehousing) carries the proof band below instead, so no
  // number is stated twice on this page.
  const heroFigureIds = ["labels", "retailers", "years"];
  const heroFigures = heroFigureIds
    .map((id) => groupStats.find((stat) => stat.id === id))
    .filter((stat): stat is NonNullable<typeof stat> => Boolean(stat));
  const warehouseFigure = groupStats.find((stat) => stat.id === "warehouse");

  // The low-friction ask: most of this trade opens WhatsApp before a form.
  const brandListHref = `https://wa.me/${settings.defaultWhatsapp}?text=${encodeURIComponent(
    "Hello Arihant, please send me your brand list.",
  )}`;

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
              {/* Plain lead. The rotating word that used to sit here read as
                  decoration on a trade site and repeated a word already in the
                  sentence, so it is gone. */}
              <p data-hero-reveal className="t-lead measure text-ink-soft">
                {hero.lead}
              </p>
              <div
                data-hero-reveal
                className="m-cta mt-1 flex flex-wrap items-center gap-x-6 gap-y-3"
              >
                <Button variant="primary" size="lg" href={hero.primaryCta.href}>
                  {hero.primaryCta.label}
                </Button>
                {/* The cheap ask, beside the committing one. */}
                <a
                  href={brandListHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-wa group inline-flex min-h-11 items-center gap-2 font-sans font-semibold text-ink transition-colors"
                >
                  <span className="hero-wa__mark" aria-hidden="true">
                    <WhatsAppIcon width={18} height={18} />
                  </span>
                  <span className="underline-offset-4 group-hover:underline">
                    Brand list on WhatsApp
                  </span>
                </a>
              </div>

              {/* HP1: the numbers win the first screen, not a scroll. */}
              {heroFigures.length ? (
                <div data-hero-reveal className="hero-figures w-full">
                  <StatBand stats={heroFigures} compact />
                </div>
              ) : null}
            </div>

            <div data-hero-reveal className="lg:col-span-5">
              {/* Portrait beside the headline on desktop; edge to edge and
                  landscape on a phone, where a 4:5 frame at full width eats an
                  entire screen before the reader has reached anything. */}
              <ParallaxImage
                src={stockImages.homeTexture.src}
                alt={stockImages.homeTexture.alt}
                ratio="4 / 5"
                priority
                sizes="(max-width: 1023px) 100vw, 42vw"
                tilt
                mBleed
                className="m-ar-4-3"
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
              className="funnel-grid m-rail grid gap-px bg-line sm:grid-cols-2"
            >
              {funnels.map((funnel) => (
                <li key={funnel.id} className="flex">
                  <Link
                    href={funnel.cta.href}
                    className="funnel-card press group flex w-full flex-col gap-3"
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
            {/* Horizontal scrim on desktop, where the copy occupies the left
                two thirds. On a phone the copy is full width, so the mobile
                layer swaps this for a vertical one (see .proof-scrim). */}
            <div
              className="proof-scrim absolute inset-0"
              style={{
                background:
                  "var(--m-proof-scrim, linear-gradient(90deg, var(--charcoal) 30%, transparent))",
              }}
            />
          </div>

          <div className="container-site section-pad relative m-flow flex flex-col gap-10">
            <div className="m-flow-tight flex max-w-3xl flex-col gap-5">
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
              {/* The one group figure the hero does not carry, so no number on
                  this page is stated twice. */}
              {warehouseFigure ? (
                <p className="t-body text-on-charcoal-soft">
                  {phrase.groupWarehouse} of warehousing in Guwahati, across both
                  godowns.
                </p>
              ) : null}
            </div>
          </div>
        </section>
      </CurtainReveal>

      {/* 3 — Why Arihant (paper): sticky heading beside the pillar card stack */}
      <section className="bg-paper">
        <div className="container-site section-pad">
          <div className="m-flow grid gap-x-12 gap-y-10 md:grid-cols-12">
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
        <div className="container-site section-pad m-flow flex flex-col gap-12">
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
                className={cn(i > 0 && "m-divide mt-16 border-t border-line pt-16")}
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
        <div className="container-site section-pad m-flow flex flex-col gap-10">
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
              className="m-rail grid gap-x-6 gap-y-10 sm:grid-cols-3"
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
          <div className="container-site section-pad m-flow flex flex-col gap-8">
            <div className="m-flow grid gap-y-10 lg:grid-cols-12 lg:items-start lg:gap-16">
              <div className="m-flow flex flex-col gap-8 lg:col-span-7">
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

              {featuredStore?.image ? (
                <Reveal as="div" variant="clip" className="lg:col-span-5">
                  <figure className="flex flex-col gap-3">
                    <ParallaxImage
                      src={featuredStore.image}
                      alt={
                        featuredStore.caption ??
                        `${featuredStore.name}, an Arihant Retail store in ${featuredStore.city}`
                      }
                      ratio="4 / 5"
                      sizes="(max-width: 1023px) 100vw, 32vw"
                      className="m-ar-4-3 border border-line"
                      tilt
                      mBleed
                    />
                    <figcaption className="t-small text-ink-soft">
                      {featuredStore.name}, {featuredStore.city} · Arihant Retail
                    </figcaption>
                  </figure>
                </Reveal>
              ) : null}
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
