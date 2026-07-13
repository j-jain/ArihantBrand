import Image from "next/image";
import type { CSSProperties } from "react";
import type { Partner } from "@/content/types";

interface LogoMarqueeProps {
  partners: Partner[];
}

function MarqueeGroup({
  partners,
  clone = false,
}: {
  partners: Partner[];
  clone?: boolean;
}) {
  return (
    <div
      className="marquee__group"
      data-clone={clone ? "true" : undefined}
      aria-hidden={clone || undefined}
    >
      {partners.map((partner) => (
        <div
          key={`${clone ? "clone-" : ""}${partner.slug}`}
          className="relative h-16 w-32 shrink-0 rounded-md border border-line bg-white p-3"
        >
          <div className="relative h-full w-full">
            <Image
              src={partner.image}
              alt={clone ? "" : partner.name}
              fill
              className="object-contain"
              sizes="128px"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/** CSS-only logo marquee: a duplicated track loops seamlessly, pauses on hover
 *  or focus, and falls back to a static wrapped grid under reduced motion.
 *  Fixed row height keeps it CLS-free. */
export function LogoMarquee({ partners }: LogoMarqueeProps) {
  return (
    <div
      className="marquee py-2"
      style={{ "--marquee-duration": "48s" } as CSSProperties}
    >
      <div className="marquee__track">
        <MarqueeGroup partners={partners} />
        <MarqueeGroup partners={partners} clone />
      </div>
    </div>
  );
}
