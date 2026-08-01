import type { Metadata } from "next";

import {
  Button,
  DrenchBand,
  JsonLd,
  ParallaxImage,
  Reveal,
  SectionHeading,
  StaggerGroup,
  StoreCard,
  cn,
} from "@/components";
import {
  getBusinesses,
  getPageCopy,
  getSiteSettings,
  getStores,
  pointsByIds,
} from "@/lib/content";
import { photoSlots } from "@/content/images";
import {
  breadcrumbJsonLd,
  businessJsonLd,
  pageMetadata,
  storeListJsonLd,
} from "@/lib/seo";
import { UnitHero } from "../_components/UnitHero";

const UNIT = "retail" as const;
const PATH = "/arihant-retail";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPageCopy(UNIT);
  return pageMetadata({
    title: copy?.metaTitle ?? "",
    description: copy?.metaDescription ?? "",
    path: PATH,
  });
}

export default async function ArihantRetailPage() {
  const [copy, businesses, stores, settings] = await Promise.all([
    getPageCopy(UNIT),
    getBusinesses(),
    getStores(),
    getSiteSettings(),
  ]);

  if (!copy) return null;

  const business = businesses.find((b) => b.unit === UNIT);
  const contact = settings.contacts.find((c) => c.unit === UNIT);
  const { hero, sections } = copy;
  const storesSection = sections.stores;
  const model = sections.model;
  const cta = sections.cta;

  // Content is selected by stable id, never by matching the copy — a rewrite
  // must never be able to blank a section.
  const modelPoints = pointsByIds(business, [
    "zero-deadstock",
    "multi-brand",
    "legacy",
  ]);

  return (
    <div>
      {business && contact ? (
        <JsonLd data={businessJsonLd(settings, business, contact)} />
      ) : null}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: business?.name ?? "Arihant Retail", path: PATH },
        ])}
      />
      {/* Trading stores only. A door that has not opened is not a place. */}
      <JsonLd data={storeListJsonLd(settings, stores)} />

      {/* 1 — Hero (paper): lockup, headline, then the numbers full-measure */}
      {business ? <UnitHero business={business} hero={hero} /> : null}

      {/* 2 — Stores (paper-shade): the three REAL store photos lead, staggered */}
      <section className="section-pad bg-paper-shade">
        <div className="container-site">
          <div className="m-flow flex flex-col gap-10">
            <Reveal variant="fade">
              <SectionHeading heading={storesSection.heading} lead={storesSection.lead} />
            </Reveal>
            <StaggerGroup
              from="scale"
              className="m-rail grid gap-6 grid-cols-[repeat(auto-fit,minmax(280px,1fr))]"
              stagger={0.12}
            >
              {stores.map((store, i) => (
                <StoreCard key={`${store.name}-${store.city}-${i}`} store={store} />
              ))}
            </StaggerGroup>
          </div>
        </div>
      </section>

      {/* 3 — Model band (charcoal): the model as a closed ledger + an image duo */}
      <section className="section-pad on-dark">
        <div className="container-site">
          <div className="m-flow grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:items-start">
            <div className="m-flow flex flex-col gap-8">
              <SectionHeading heading={model.heading} lead={model.lead} onDark />
              {modelPoints.length ? (
                <StaggerGroup as="ul" from="left" className="flex flex-col" stagger={0.1} mLedger>
                  {modelPoints.map((point, index) => (
                    <li
                      key={point}
                      className={cn(
                        "m-ledger-row t-h4 border-t border-line-dark py-5 text-on-charcoal",
                        index === modelPoints.length - 1 && "border-b border-line-dark",
                      )}
                    >
                      {point}
                    </li>
                  ))}
                </StaggerGroup>
              ) : null}

              {/* The franchise ask, in the page rather than only in the closing
                  band, because this is where the model has just been explained
                  (AR8). */}
              <div className="m-cta">
                <Button href="/partner" variant="onDark" size="lg" className="press">
                  Own a managed store
                </Button>
              </div>
            </div>

            {/* One interior, not a pair. The shopfront that used to sit under
                this one repeated the same room from outside, so the band read
                as two photos of one store rather than one piece of evidence.
                Arihant Retail's own floor, so it outranks stock here. */}
            <div className="m-duo flex flex-col">
              <ParallaxImage
                src={photoSlots.retailInterior.src}
                alt={photoSlots.retailInterior.alt}
                ratio={photoSlots.retailInterior.ratio}
                sizes="(max-width: 1023px) 100vw, 35vw"
                className="m-ar-4-3 border border-line-dark"
                tilt
                mBleed
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5 — Partner cross-sell (single vermillion drench) */}
      <DrenchBand className="section-pad">
        <div className="container-site m-flow flex max-w-3xl flex-col gap-6">
          <h2 data-drench-reveal className="t-h2">{cta.heading}</h2>
          {cta.lead ? (
            <p data-drench-reveal className="t-lead" style={{ color: "var(--_text-soft)" }}>
              {cta.lead}
            </p>
          ) : null}
          <div data-drench-reveal className="m-cta mt-1">
            <Button href="/partner" variant="onDark" size="lg" className="press">
              See the partnership model
            </Button>
          </div>
        </div>
      </DrenchBand>
    </div>
  );
}
