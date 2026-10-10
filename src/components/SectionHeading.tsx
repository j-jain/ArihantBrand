import { EmphasisHeading } from "@/app/(site)/_components/EmphasisHeading";
import { cn } from "./cn";
import { SplitHeading } from "./motion/SplitHeading";

interface SectionHeadingProps {
  heading: string;
  lead?: string;
  align?: "start" | "center";
  onDark?: boolean;
  id?: string;
  /** Inside a {@link SectionReveal} (change round 9): the heading and lead
   *  take their `data-sr` roles and the section's one timeline animates them,
   *  instead of the heading carrying its own SplitHeading trigger. */
  sr?: boolean;
}

/** Plain scaled section heading (h2) with an optional lead. No eyebrows or
 *  numbered markers — inner sections stay quiet per the brand system. The h2
 *  rises its words in when scrolled to (via {@link SplitHeading}, or the
 *  enclosing SectionReveal when `sr` is set); the API and layout are unchanged. */
export function SectionHeading({
  heading,
  lead,
  align = "start",
  onDark = false,
  id,
  sr = false,
}: SectionHeadingProps) {
  const headingClass = cn("t-h2", onDark ? "text-on-charcoal" : "text-ink");
  return (
    <div
      className={cn(
        "section-head flex flex-col gap-3",
        align === "center" && "items-center text-center",
      )}
    >
      {sr ? (
        <EmphasisHeading
          as="h2"
          className={headingClass}
          text={heading}
          rest={{ ...(id ? { id } : {}), "data-sr": "heading" }}
        />
      ) : (
        <SplitHeading as="h2" id={id} className={headingClass} text={heading} />
      )}
      {lead ? (
        <p
          {...(sr ? { "data-sr": "lead" } : {})}
          className={cn(
            "t-lead measure",
            align === "center" && "mx-auto",
            onDark ? "text-on-charcoal-soft" : "text-ink-soft",
          )}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}
