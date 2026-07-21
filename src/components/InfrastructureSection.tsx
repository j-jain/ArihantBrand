import { CurtainReveal } from "./motion/CurtainReveal";
import { ParallaxImage } from "./motion/ParallaxImage";
import { VapourText } from "./motion/VapourText";
import { InfrastructureGrid } from "./InfrastructureGrid";
import { stockImages } from "@/content/images";

interface SystemRow {
  title: string;
  text: string;
}

interface InfrastructureSectionProps {
  heading: string;
  lead?: string;
  /** Closing line (Besley italic) — the section's quiet last word. */
  closing?: string;
  systems: SystemRow[];
}

/** The home "systems" band: a full-bleed charcoal section whose heading settles
 *  out of drifting vapour. On desktop it composes as a 7/5 split that reads in
 *  a single screen — heading, lead, the four systems as a 2x2 hairline ledger
 *  and the closing Besley-italic line stacked in the left seven columns, with
 *  the godown photo standing the full height of all of it on the right. It
 *  carries no CTA — it is proof of the backend, not an ask. The whole band
 *  wipes in once via {@link CurtainReveal}; all text renders server-side and
 *  legibly without motion, and below 1024px everything simply stacks. */
export function InfrastructureSection({
  heading,
  lead,
  closing,
  systems,
}: InfrastructureSectionProps) {
  return (
    <CurtainReveal>
      <section className="infra-band on-dark">
        <div className="container-site infra-band__inner">
          {/* DOM order is the stacked reading order — heading, photo, ledger.
              Desktop re-places the photo as a full-height right rail beside
              both copy blocks; see .infra-band__* in motion.css. */}
          <div className="infra-band__grid">
            <div className="infra-band__head flex max-w-3xl flex-col gap-4">
              <VapourText
                as="h2"
                className="t-h2 text-on-charcoal"
                text={heading}
              />
              {lead ? (
                <p className="t-lead measure text-on-charcoal-soft">{lead}</p>
              ) : null}
            </div>

            <ParallaxImage
              src={stockImages.systemsWarehouse1.src}
              alt={stockImages.systemsWarehouse1.alt}
              sizes="(max-width: 1023px) 100vw, 36vw"
              className="infra-band__photo border border-line-dark"
              tilt
              // Height comes from CSS, not an inline ratio: 4:5 while stacked,
              // then the full height of the copy column once side by side.
              fillHeight
            />

            <div className="infra-band__body">
              <InfrastructureGrid systems={systems} />

              {closing ? (
                <p
                  className="font-display measure italic text-on-charcoal"
                  style={{ fontSize: "var(--text-h4)", lineHeight: 1.4 }}
                >
                  {closing}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </CurtainReveal>
  );
}
