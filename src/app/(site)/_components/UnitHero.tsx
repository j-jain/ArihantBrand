import Image from "next/image";
import type { ReactNode } from "react";
import { StatBand } from "@/components";
import type { Business, Hero } from "@/content/types";
import { unitScope } from "@/lib/units";
import { HeroIntro } from "@/components";
import { EmphasisHeading } from "./EmphasisHeading";

interface UnitHeroProps {
  business: Business;
  hero: Hero;
  /** Optional extra beneath the stat band (e.g. a single inline CTA). */
  children?: ReactNode;
  /** Photographs set beside the copy; used only with `fit` (retail).
   *  Marketing and Apparels pass neither and render exactly as before. */
  media?: ReactNode;
  /** Render the stat band under the lead. Default true. Retail passes false,
   *  because its three figures key the store atlas instead. */
  showStats?: boolean;
  /** One screen, split (change round 5, retail): from 768px up the hero is
   *  one viewport tall under the header, the copy in eight columns and
   *  `media` in four beside it, with `children` under the lead. `media` owns
   *  its own reveal (HeroIntro's [data-hero-clip]). */
  fit?: boolean;
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
 */
export function UnitHero({
  business,
  hero,
  children,
  media,
  showStats = true,
  fit = false,
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
        className="t-display text-ink"
        text={hero.heading}
        emphasis={hero.headingEmphasis}
        emphasisColor="var(--unit-accent)"
        rest={{ "data-hero-title": "", style: { textWrap: "normal" } }}
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
