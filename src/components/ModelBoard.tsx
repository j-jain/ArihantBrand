"use client";

import { useRef, useState, type ReactNode } from "react";

import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import type { Cta, RetailModel } from "@/content/types";
import { Button } from "./Button";
import { ModelFigure } from "./ModelFigures";
import { ReturnsCalculator } from "./ReturnsCalculator";
import { SectionHeading } from "./SectionHeading";
import { SplitHeading } from "./motion/SplitHeading";
import { StaggerGroup } from "./motion/StaggerGroup";
import { CalculatorIcon, TrendIcon } from "./icons";
import { cn } from "./cn";
import { trackClass } from "./Analytics";

interface ModelBoardProps {
  /** Section h2. Retail passes sections.model; partner passes sections.promise. */
  heading: string;
  lead?: string;
  model: RetailModel;
  /** The page's own conversion CTA, set beside the worksheet trigger. */
  pageCta?: Cta;
  /** "dark" is the charcoal band; "paper" the light one. */
  tone?: "dark" | "paper";
  /** The photograph for the rail. Passed as an element so each page keeps
   *  ownership of which photo slot and which `sizes` it uses. */
  media?: ReactNode;
  /** One screen (change round 5, retail): from 768px up the band is one
   *  viewport tall under the header with its content centred, the rail is not
   *  sticky, the rows are tighter and the figures draw as one sequence. Pages
   *  with a photograph in the rail (/partner) leave it off. */
  fit?: boolean;
  id?: string;
  className?: string;
}

/**
 * The managed-store model, as a ledger board.
 *
 * This replaced a flat list of three sentences. Each of the four pillars now
 * carries a diagram that draws itself as the row arrives, which is the whole
 * point: the zero-deadstock claim is a thing that MOVES (stock leaving the
 * owner's books) and a sentence cannot show that.
 *
 * It is deliberately not a four-up icon card grid. DESIGN.md bans that shape,
 * and on the retail page the store atlas sits directly above this band (its
 * ruled store list included), so a card grid here would read as a template.
 * Hairline ledger rows are both compliant and truer to the trade-book identity.
 *
 * Row entry motion is delegated to StaggerGroup, which already owns the
 * desktop/mobile/reduced split, the already-on-screen guard, and the mobile
 * ledger wipe with its clearProps on clipPath. That is why this component
 * ships no clipPath tween of its own.
 */
export function ModelBoard({
  heading,
  lead,
  model,
  pageCta,
  tone = "dark",
  media,
  fit = false,
  id,
  className,
}: ModelBoardProps) {
  const ref = useRef<HTMLElement>(null);
  const [calcOpen, setCalcOpen] = useState(false);
  const onDark = tone === "dark";
  const headingId = id ? `${id}-heading` : undefined;

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;

      const mm = gsap.matchMedia(ref);

      mm.add(
        {
          reduced: "(prefers-reduced-motion: reduce)",
          mobile: "(prefers-reduced-motion: no-preference) and (max-width: 767px)",
          desktop: "(prefers-reduced-motion: no-preference) and (min-width: 768px)",
        },
        (ctx) => {
          const conditions = ctx.conditions as Record<string, boolean>;
          // Reduced motion is a no-op on purpose: the figures are already
          // drawn in their finished state in the served markup.
          if (conditions.reduced) return;

          const rows = gsap.utils.toArray<HTMLElement>(
            root.querySelectorAll(".model-row"),
          );

          // One screen: the four rows are in view together, so four per-row
          // triggers would fire at once. Their figures draw as one sequence
          // instead, each a beat after the one above, as the rows land.
          const master =
            fit && conditions.desktop ? gsap.timeline({ paused: true }) : null;

          rows.forEach((row, index) => {
            const figure = row.querySelector<SVGSVGElement>(".model-fig");
            if (!figure) return;

            // A handset gets one short settle per figure and pays for no dash
            // measurement: getTotalLength() four times is not worth it there.
            if (conditions.mobile) {
              gsap.from(figure, {
                autoAlpha: 0,
                scale: 0.94,
                transformOrigin: "50% 50%",
                duration: 0.4,
                ease: "power2.out",
                scrollTrigger: { trigger: row, start: "top 88%", once: true },
              });
              return;
            }

            const tl = gsap.timeline({ paused: !master });

            // Every tween is a `from`. The resting state in the HTML is the
            // finished state, so nothing is ever hidden by an un-run tween.
            const units = figure.querySelectorAll(".model-fig__unit");
            if (units.length) {
              tl.from(units, {
                x: -26,
                duration: 0.5,
                ease: "power3.out",
                stagger: 0.09,
              });
            }

            const tags = figure.querySelectorAll(".model-fig__tag rect");
            if (tags.length) {
              tl.from(tags, {
                scaleY: 0,
                transformOrigin: "50% 0%",
                duration: 0.4,
                ease: "power2.out",
                stagger: 0.06,
              });
            }

            const racks = figure.querySelectorAll(".model-fig__racks path");
            if (racks.length) {
              tl.from(racks, {
                autoAlpha: 0,
                duration: 0.3,
                ease: "power1.out",
                stagger: 0.07,
              });
            }

            const halves = figure.querySelectorAll<SVGGElement>(".model-fig__half");
            if (halves.length) {
              tl.from(halves, {
                scaleX: 0,
                transformOrigin: (i: number) => (i ? "100% 50%" : "0% 50%"),
                duration: 0.45,
                ease: "power3.out",
                stagger: 0.08,
              });
            }

            // Stroke-dash draws, cleared on completion so no residual dash
            // attribute is left on the path.
            const draws = figure.querySelectorAll<SVGPathElement>(
              ".model-fig__return, .model-fig__seam",
            );
            draws.forEach((path) => {
              const length = path.getTotalLength();
              if (!length) return;
              tl.fromTo(
                path,
                { strokeDasharray: length, strokeDashoffset: length },
                {
                  strokeDashoffset: 0,
                  duration: 0.55,
                  ease: "power2.inOut",
                  onComplete: () =>
                    gsap.set(path, {
                      clearProps: "strokeDasharray,strokeDashoffset",
                    }),
                },
                "<0.1",
              );
            });

            if (!tl.totalDuration()) {
              tl.kill();
              return;
            }

            if (master) {
              master.add(tl, 0.3 + index * 0.12);
              return;
            }

            ScrollTrigger.create({
              trigger: row,
              start: "top 85%",
              once: true,
              onEnter: () => tl.play(0),
            });
          });

          if (master && master.totalDuration()) {
            ScrollTrigger.create({
              trigger: root.querySelector(".model-rows") ?? root,
              start: "top 80%",
              once: true,
              onEnter: () => master.play(0),
            });
          }
        },
      );

      return () => mm.revert();
    },
    { scope: ref, dependencies: [model.pillars.length, fit] },
  );

  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={headingId}
      className={cn(
        "section-pad model-band",
        fit && "model-band--fit",
        onDark ? "on-dark" : "model-band--paper bg-paper",
        className,
      )}
    >
      <div className="container-site">
        {/* One screen: the heading takes the full measure, on one line, above
            both columns; in the rail it wrapped to three. */}
        {fit ? (
          <SplitHeading
            as="h2"
            id={headingId}
            className={cn("t-h2 model-board__title", onDark ? "text-on-charcoal" : "text-ink")}
            text={heading}
          />
        ) : null}
        <div className="model-board">
          <div className="model-board__rail m-flow flex flex-col gap-7">
            {fit ? (
              lead ? (
                <p
                  className={cn(
                    "t-lead measure",
                    onDark ? "text-on-charcoal-soft" : "text-ink-soft",
                  )}
                >
                  {lead}
                </p>
              ) : null
            ) : (
              <SectionHeading id={headingId} heading={heading} lead={lead} onDark={onDark} />
            )}

            {/* The return-on-capital line. Ruled, not boxed, and carrying no
                figure: franchise economics stay qualitative here by policy,
                not by omission (PRODUCT.md honesty rails). */}
            <p className="model-board__roic t-body">
              <TrendIcon className="model-board__roic-mark" />
              <span>{model.roicNote}</span>
            </p>

            <div className="model-board__actions m-cta">
              <button
                type="button"
                className={cn(
                  "calc-trigger press",
                  trackClass("CTA returns worksheet"),
                )}
                aria-haspopup="dialog"
                onClick={() => setCalcOpen(true)}
              >
                <CalculatorIcon />
                <span>{model.calculator.triggerLabel}</span>
              </button>
              {pageCta ? (
                <Button
                  href={pageCta.href}
                  variant={onDark ? "onDark" : "secondary"}
                  className="press"
                >
                  {pageCta.label}
                </Button>
              ) : null}
            </div>

            {media ? <div className="model-board__media">{media}</div> : null}
          </div>

          <StaggerGroup
            as="ul"
            from="left"
            stagger={0.1}
            mLedger
            className="model-rows"
          >
            {model.pillars.map((pillar) => (
              <li key={pillar.id} className="model-row m-ledger-row">
                <span className="model-row__fig" aria-hidden="true">
                  <ModelFigure id={pillar.id} />
                </span>
                <div className="model-row__body">
                  <h3 className="t-h4 model-row__title">{pillar.title}</h3>
                  <p className="t-body measure model-row__text">{pillar.text}</p>
                </div>
              </li>
            ))}
          </StaggerGroup>
        </div>
      </div>

      <ReturnsCalculator
        copy={model.calculator}
        open={calcOpen}
        onClose={() => setCalcOpen(false)}
      />
    </section>
  );
}
