"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Business, Stat } from "@/content/types";
import { Button, Modal } from "@/components";
import { UNIT_ACCENT, unitScope } from "@/lib/units";

function formatStat({ value, suffix }: Stat): string {
  const isYear =
    !suffix && Number.isInteger(value) && value >= 1900 && value <= 2999;
  const body = isYear
    ? String(value)
    : new Intl.NumberFormat("en-IN").format(value);
  return suffix ? `${body}${suffix}` : body;
}

/** "Quick view" trigger + rich business modal. Opens a token-styled panel with
 *  the unit's accent, the full proof list, every stat, leadership, and both
 *  CTAs plus a link to the unit page. Accent is decorative; the CTA stays the
 *  sitewide vermillion. */
export function UnitQuickView({ business }: { business: Business }) {
  const [open, setOpen] = useState(false);
  const titleId = `qv-${business.slug}`;
  const accent = UNIT_ACCENT[business.unit].token;
  const [primaryCta] = business.audienceCtas;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-ink-soft underline-offset-4 transition-colors hover:text-ink hover:underline"
        aria-haspopup="dialog"
      >
        Quick view
        <span aria-hidden="true">+</span>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} labelledBy={titleId}>
        <div style={unitScope(business.unit)} className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-40 shrink-0">
              <Image
                src={business.logo}
                alt={business.name}
                fill
                sizes="10rem"
                className="object-contain object-left"
              />
            </div>
            <span
              aria-hidden="true"
              className="h-8 w-px"
              style={{ background: "var(--unit-accent-line)" }}
            />
            <p className="t-small text-ink-soft">
              {[business.founded, business.leaders.join(" & ")]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>

          <div>
            <h2 id={titleId} className="t-h3 text-ink">
              {business.name}
            </h2>
            <span
              aria-hidden="true"
              className="mt-3 block h-[3px] w-14 rounded-full"
              style={{ background: accent }}
            />
          </div>

          <p className="t-lead text-ink">{business.positioning}</p>

          <div
            className="rounded-lg p-5"
            style={{ background: "var(--unit-accent-wash)" }}
          >
            <dl className="flex flex-wrap gap-x-9 gap-y-4">
              {business.stats.map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <dt className="sr-only">{stat.label}</dt>
                  <dd
                    className="font-sans text-ink"
                    style={{
                      fontWeight: 800,
                      fontStretch: "85%",
                      fontVariantNumeric: "tabular-nums",
                      fontSize: "1.55rem",
                      lineHeight: 1.05,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {formatStat(stat)}
                  </dd>
                  <span className="t-small mt-1 text-ink-soft">
                    {stat.label}
                  </span>
                </div>
              ))}
            </dl>
          </div>

          <ul className="flex flex-col gap-2.5">
            {business.points.map((point) => (
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

          <div className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-3">
            {primaryCta ? (
              <Button variant="primary" href={primaryCta.href}>
                {primaryCta.label}
              </Button>
            ) : null}
            <Link
              href={`/${business.slug}`}
              className="inline-flex items-center gap-1.5 font-sans font-semibold text-ink underline-offset-4 hover:underline"
            >
              Visit {business.name}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </Modal>
    </>
  );
}
