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
 *  out of drifting vapour, then a 7/5 split — the four systems as a hairline
 *  ledger beside a portrait godown photo — closed by a Besley-italic line. It
 *  carries no CTA — it is proof of the backend, not an ask. The whole band
 *  wipes in once via {@link CurtainReveal}; all text renders server-side and
 *  legibly without motion. */
export function InfrastructureSection({
  heading,
  lead,
  closing,
  systems,
}: InfrastructureSectionProps) {
  return (
    <CurtainReveal>
      <section className="on-dark">
        <div className="container-site section-pad flex flex-col gap-12">
          <div className="flex max-w-3xl flex-col gap-5">
            <VapourText as="h2" className="t-h2 text-on-charcoal" text={heading} />
            {lead ? (
              <p className="t-lead measure text-on-charcoal-soft">{lead}</p>
            ) : null}
          </div>

          <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Photo — right rail on desktop, above the rows on mobile. */}
            <ParallaxImage
              src={stockImages.systemsWarehouse1.src}
              alt={stockImages.systemsWarehouse1.alt}
              ratio="4 / 5"
              sizes="(max-width: 1023px) 100vw, 40vw"
              className="border border-line-dark lg:col-span-5 lg:col-start-8 lg:row-start-1"
              tilt
            />
            {/* Systems ledger — left rail on desktop, below the photo on mobile. */}
            <InfrastructureGrid
              systems={systems}
              className="lg:col-span-7 lg:col-start-1 lg:row-start-1"
            />
          </div>

          {closing ? (
            <p
              className="font-display measure italic text-on-charcoal"
              style={{ fontSize: "var(--text-h4)", lineHeight: 1.4 }}
            >
              {closing}
            </p>
          ) : null}
        </div>
      </section>
    </CurtainReveal>
  );
}
