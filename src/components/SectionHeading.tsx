import { cn } from "./cn";

interface SectionHeadingProps {
  heading: string;
  lead?: string;
  align?: "start" | "center";
  onDark?: boolean;
  id?: string;
}

/** Plain scaled section heading (h2) with an optional lead. No eyebrows or
 *  numbered markers — inner sections stay quiet per the brand system. */
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
      <h2 id={id} className={cn("t-h2", onDark ? "text-on-charcoal" : "text-ink")}>
        {heading}
      </h2>
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
