import { cn } from "./cn";
import { SplitHeading } from "./motion/SplitHeading";

interface SectionHeadingProps {
  heading: string;
  lead?: string;
  align?: "start" | "center";
  onDark?: boolean;
  id?: string;
}

/** Plain scaled section heading (h2) with an optional lead. No eyebrows or
 *  numbered markers — inner sections stay quiet per the brand system. The h2
 *  rises its words in when scrolled to (via {@link SplitHeading}); the API and
 *  layout are unchanged. */
export function SectionHeading({
  heading,
  lead,
  align = "start",
  onDark = false,
  id,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
      )}
    >
      <SplitHeading
        as="h2"
        id={id}
        className={cn("t-h2", onDark ? "text-on-charcoal" : "text-ink")}
        text={heading}
      />
      {lead ? (
        <p
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
