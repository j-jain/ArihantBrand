import Image from "next/image";
import Link from "next/link";
import type { Business, Stat } from "@/content/types";
import { Button } from "@/components";
import { UNIT_ACCENT } from "@/lib/units";
import { UnitQuickView } from "./UnitQuickView";

interface UnitShowcaseProps {
  business: Business;
  /** When true, the copy column sits left and the logo/facts column right. */
  flip?: boolean;
}

/** Format a stat en-IN. Bare four-digit values in a plausible year range stay
 *  ungrouped ("2013"); everything else groups ("15,000"). Mirrors StatBand. */
function formatStat({ value, suffix }: Stat): string {
  const isYear = !suffix && Number.isInteger(value) && value >= 1900 && value <= 2999;
  const body = isYear ? String(value) : new Intl.NumberFormat("en-IN").format(value);
  return suffix ? `${body}${suffix}` : body;
}

/** One business, rendered as an asymmetric 5/7 split: a white logo tile with a
 *  compact inline stat row on one side, and the name (linked to the unit page),
 *  positioning, a short proof list, and the audience CTAs on the other. Sides
 *  alternate row to row via `flip`. The row itself isn't a link — only the name
 *  is — so the CTAs and stats stay independently reachable. */
export function UnitShowcase({ business, flip = false }: UnitShowcaseProps) {
  const accent = UNIT_ACCENT[business.unit].token;
  const points = business.points.slice(0, 3);
  const [primaryCta, secondaryCta] = business.audienceCtas;
  const facts = [business.founded, business.leaders.join(" & ")]
    .filter(Boolean)
    .join(" · ");

  const media = (
    <div className="lg:col-span-5">
      <div className="rounded-md border border-line bg-white p-6">
        <div className="relative h-16 w-full">
          <Image
            src={business.logo}
            alt={business.name}
            fill
            sizes="(min-width: 1024px) 22rem, 60vw"
            className="object-contain object-left"
          />
        </div>
      </div>

      <dl className="mt-7 flex flex-wrap gap-x-9 gap-y-5">
        {business.stats.map((stat) => (
          <div key={stat.label} className="flex flex-col">
            <dt className="sr-only">{stat.label}</dt>
            <dd
              className="font-sans text-ink"
              style={{
                fontWeight: 800,
                fontStretch: "85%",
                fontVariantNumeric: "tabular-nums",
                fontSize: "1.7rem",
                lineHeight: 1.05,
                letterSpacing: "-0.01em",
              }}
            >
              {formatStat(stat)}
            </dd>
            <span className="t-small mt-1 text-ink-soft">{stat.label}</span>
          </div>
        ))}
      </dl>
    </div>
  );

  const copy = (
    <div className="flex flex-col gap-4 lg:col-span-7">
      <div>
        <h3 className="t-h3">
          <Link
            href={`/${business.slug}`}
            className="text-ink underline-offset-4 hover:underline"
          >
            {business.name}
          </Link>
        </h3>
        <span
          aria-hidden="true"
          className="mt-3 block h-[3px] w-14 rounded-full"
          style={{ background: accent }}
        />
      </div>

      <p className="t-small text-ink-soft">{facts}</p>
      <p className="t-lead measure text-ink">{business.positioning}</p>

      <ul className="mt-1 flex flex-col gap-2.5">
        {points.map((point) => (
          <li key={point} className="flex gap-2.5 text-ink-soft">
            <span
              aria-hidden="true"
              className="mt-1 shrink-0 leading-none"
              style={{ color: accent }}
            >
              ▸
            </span>
            <span className="t-body">{point}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap items-center gap-x-7 gap-y-3">
        {primaryCta ? (
          <Button variant="primary" href={primaryCta.href}>
            {primaryCta.label}
          </Button>
        ) : null}
        {secondaryCta ? (
          <Link
            href={secondaryCta.href}
            className="inline-flex items-center gap-1.5 font-sans font-semibold text-ink underline-offset-4 hover:underline"
          >
            {secondaryCta.label}
            <span aria-hidden="true">→</span>
          </Link>
        ) : null}
        <UnitQuickView business={business} />
      </div>
    </div>
  );

  return (
    <div className="grid items-center gap-x-12 gap-y-8 lg:grid-cols-12">
      {flip ? (
        <>
          {copy}
          {media}
        </>
      ) : (
        <>
          {media}
          {copy}
        </>
      )}
    </div>
  );
}
