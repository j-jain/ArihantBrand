import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button, StatBand } from "@/components";
import type { Business, Hero } from "@/content/types";
import { unitScope } from "@/lib/units";
import { HeroIntro } from "@/components";
import { EmphasisHeading } from "./EmphasisHeading";

interface UnitHeroProps {
  business: Business;
  hero: Hero;
  /** Optional extra beneath the stat band (e.g. a single inline CTA). */
  children?: ReactNode;
  /** Photographs set beside the copy: the retail stack with `fit`, the
   *  wide photograph and its inset with `feature`. */
  media?: ReactNode;
  /** Render the stat band under the lead. Default true. Retail passes false,
   *  because its three figures key the store atlas instead. */
  showStats?: boolean;
  /** One screen, split (change round 5, retail): from 768px up the hero is
   *  one viewport tall under the header, the copy in eight columns and
   *  `media` in four beside it, with `children` under the lead. `media` owns
   *  its own reveal (HeroIntro's [data-hero-clip]). */
  fit?: boolean;
  /** One screen, featured (change round 6, Marketing and Apparels): the copy
   *  in seven columns (lockup, headline, lead, the two asks, the figures and
   *  an optional proof line), `media` in five, run to the screen's edge. */
  feature?: boolean;
  /** A short line of proof under the figures (Marketing: its award). */
  proof?: string;
}

/**
 * The hero shared by the three unit pages.
 *
 * What changed and why (change brief, AM1/AM2/AM3 and AA1/AA2):
 *  - The logo used to sit in a large white plate in a right-hand rail, which
 *    made the page open on a logo rather than on a claim. It is now a small
 *    mark in a lockup ABOVE the headline, where a reader looks for "which
 *    company am I on".
 *  - The entity name is stated in that lockup. The headline no longer has to
 *    carry identification as well as argument.
 *  - The stats ran down a thin right-hand rail at 2.5rem. They now run across
 *    the full measure under the headline at display size, which makes the
 *    numbers the visual anchor of the page they are the proof for.
 *  - Retail is the one unit hero with photographs and no stat band (its
 *    three figures key the store atlas below). Since change round 5 it is
 *    the `fit` variant: one screen, the copy beside a two-photo stack.
 *  - Marketing and Apparels (change round 6) are the `feature` variant: one
 *    screen, the claim and its two asks beside a wide photograph that runs
 *    to the screen's edge, the figures under the asks.
 */
export function UnitHero({
  business,
  hero,
  children,
  media,
  showStats = true,
  fit = false,
  feature = false,
  proof,
}: UnitHeroProps) {
  /* Which company this is, said plainly and small. */
  const lockup = (
    <div data-hero-reveal className="unit-lockup flex items-center gap-3">
      <span className="unit-lockup__logo relative block">
        <Image
          src={business.logo}
          alt=""
          fill
          className="object-contain object-left"
          sizes="140px"
        />
      </span>
      <span className="unit-lockup__name t-label text-ink-soft">{business.name}</span>
    </div>
  );

  const heading = (
    <div className="m-flow-tight flex flex-col gap-5">
      <EmphasisHeading
        as="h1"
        // A feature headline past about 44 characters steps down a size, so
        // it sets in three even lines in its seven columns, not four ragged.
        className={
          feature && hero.heading.length > 44
            ? "t-display text-ink t-display--feature-long"
            : "t-display text-ink"
        }
        text={hero.heading}
        emphasis={hero.headingEmphasis}
        emphasisColor="var(--unit-accent)"
        // The feature hero's headline sits in seven columns, where an
        // unbalanced break leaves two words alone on the first line.
        rest={{ "data-hero-title": "", style: { textWrap: feature ? "balance" : "normal" } }}
      />
      <div
        data-hero-reveal
        aria-hidden="true"
        style={{
          height: 3,
          width: "clamp(3rem, 8vw, 4.5rem)",
          background: "var(--unit-accent)",
        }}
      />
    </div>
  );

  if (feature && media) {
    const ask = hero.secondaryCta;
    return (
      <section className="unit-hero--feature-band bg-paper" style={unitScope(business.unit)}>
        <HeroIntro className="container-site unit-hero--feature">
          <div className="unit-hero-feature__grid grid gap-x-12 gap-y-10 md:grid-cols-12">
            <div className="unit-hero-feature__copy m-flow flex flex-col gap-6 md:col-span-7">
              {lockup}
              {heading}
              <p data-hero-reveal className="t-lead measure text-ink-soft">
                {hero.lead}
              </p>
              <div
                data-hero-reveal
                className="unit-hero-feature__asks m-cta flex flex-wrap items-center gap-x-7 gap-y-3"
              >
                <Button href={hero.primaryCta.href} variant="primary" size="lg" className="press">
                  {hero.primaryCta.label}
                </Button>
                {ask ? (
                  <Link href={ask.href} className="hero-ask group press">
                    <span className="underline decoration-line decoration-2 underline-offset-4 transition-colors group-hover:decoration-[var(--unit-accent)]">
                      {ask.label}
                    </span>
                    <span aria-hidden="true" className="hero-ask__chev">
                      ▸
                    </span>
                  </Link>
                ) : null}
              </div>
              {showStats && business.stats.length ? (
                <div data-hero-reveal className="unit-hero-feature__figures">
                  <StatBand stats={business.stats} compact />
                </div>
              ) : null}
              {proof ? (
                <p data-hero-reveal className="unit-hero-feature__proof t-label">
                  <span aria-hidden="true" className="unit-hero-feature__seal" />
                  {proof}
                </p>
              ) : null}
            </div>
            <div className="unit-hero-feature__media md:col-span-5">{media}</div>
          </div>
        </HeroIntro>
      </section>
    );
  }

  if (fit && media) {
    return (
      <section className="unit-hero--fit-band bg-paper" style={unitScope(business.unit)}>
        <HeroIntro className="container-site unit-hero--fit">
          <div className="unit-hero-fit__grid grid items-center gap-x-12 gap-y-10 md:grid-cols-12">
            <div className="unit-hero-fit__copy m-flow flex flex-col gap-6 md:col-span-8">
              {lockup}
              {heading}
              <p data-hero-reveal className="t-lead measure text-ink-soft">
                {hero.lead}
              </p>
              {children}
            </div>
            <div className="unit-hero-fit__media md:col-span-4">{media}</div>
          </div>
        </HeroIntro>
      </section>
    );
  }

  return (
    <section className="hero-pad bg-paper" style={unitScope(business.unit)}>
      <HeroIntro className="container-site">
        <div className="unit-hero m-flow flex flex-col gap-8">
          <div className="m-flow flex flex-col gap-6">
            {lockup}
            {heading}
            <p data-hero-reveal className="t-lead measure text-ink-soft">
              {hero.lead}
            </p>
          </div>

          {/* The numbers, across the whole measure. */}
          {showStats && business.stats.length ? (
            <div data-hero-reveal className="unit-hero__figures">
              <StatBand stats={business.stats} />
            </div>
          ) : null}

          {children}
        </div>
      </HeroIntro>
    </section>
  );
}
