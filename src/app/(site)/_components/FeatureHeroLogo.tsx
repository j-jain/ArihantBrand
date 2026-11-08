import Image from "next/image";

interface FeatureHeroLogoProps {
  /** The business's own logo (a trimmed transparent cut-out). */
  src: string;
  /** The business's name, said once for a screen reader. */
  alt: string;
  /** The cut-out's pixel size, so the frame holds its exact proportions. */
  width: number;
  height: number;
}

/**
 * The Marketing hero's media since change round 14 (8 November 2026, the
 * client's request): the house's own logo, large, on a white plate, in the
 * place the wide photograph held. Same frame as `FeatureHeroMedia` (the
 * column's full height, run to the screen's right edge, rounded on the
 * copy's side) and the same entrance: HeroIntro opens the plate out of its
 * mask ([data-hero-clip]) and settles the logo from a slight push in.
 * Phones get the plate full-bleed and shorter (mobile.css section 22).
 */
export function FeatureHeroLogo({ src, alt, width, height }: FeatureHeroLogoProps) {
  return (
    <div className="feature-logo">
      <div data-hero-clip className="feature-logo__plate">
        <span className="feature-logo__mark" style={{ aspectRatio: `${width} / ${height}` }}>
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            priority
            fetchPriority="high"
            sizes="(max-width: 767px) 60vw, 26rem"
            className="feature-logo__img"
          />
        </span>
      </div>
    </div>
  );
}
