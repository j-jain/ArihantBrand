import type { Metadata } from "next";

import { Button, DrenchBand, JsonLd, ModelBoard, ParallaxImage } from "@/components";
import {
  getBusinesses,
  getPageCopy,
  getPhotoSlots,
  getRetailModel,
  getSiteSettings,
  getStores,
} from "@/lib/content";
import {
  breadcrumbJsonLd,
  businessJsonLd,
  pageMetadata,
  storeListJsonLd,
} from "@/lib/seo";
import { UnitHero } from "../_components/UnitHero";
import { StoreAtlas } from "./_components/StoreAtlas";

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

/**
 * Arihant Retail (change round 3 re-composition).
 *
 *  1. Hero (paper): the one unit hero with a photograph. The store-interior
 *     shot moved here from the model band, and the stat band went: its three
 *     figures now key the store atlas. No CTA on the hero.
 *  2. Store atlas (paper-shade): where the stores are and who owns each one,
 *     on a square-pixel map over a ruled list, then the page's first two asks.
 *  3. ModelBoard (charcoal): the worksheet is its only control. Without the
 *     photograph and the page CTA its rail no longer outruns its rows.
 *  4. Drench: the franchise ask that follows the model (AR8).
 *
 * Exactly two /partner asks, with the model between them.
 */
export default async function ArihantRetailPage() {
  const [copy, businesses, stores, settings, photos, retailModel] = await Promise.all([
    getPageCopy(UNIT),
    getBusinesses(),
    getStores(),
    getSiteSettings(),
    getPhotoSlots(),
    getRetailModel(),
  ]);

  if (!copy) return null;

  const business = businesses.find((b) => b.unit === UNIT);
  const contact = settings.contacts.find((c) => c.unit === UNIT);
  const { hero, sections } = copy;
  const storesSection = sections.stores;
  const model = sections.model;
  const cta = sections.cta;

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

      {/* 1 — Hero (paper): lockup, headline, rule, then the lead beside
          Arihant Retail's own floor. Real, so it outranks stock. */}
      {business ? (
        <UnitHero
          business={business}
          hero={hero}
          showStats={false}
          media={
            <ParallaxImage
              src={photos.retailInterior.src}
              alt={photos.retailInterior.alt}
              ratio="4 / 5"
              parallax={false}
              sizes="(max-width: 767px) 100vw, 280px"
              className="m-ar-4-3 border border-line"
              tilt
              priority
              mBleed
            />
          }
        />
      ) : null}

      {/* 2 — Store atlas (paper-shade) */}
      <StoreAtlas
        heading={storesSection.heading}
        lead={storesSection.lead}
        stores={stores}
        stats={business?.stats ?? []}
        primaryCta={hero.primaryCta}
        secondaryCta={hero.secondaryCta}
      />

      {/* 3 — Model band (charcoal): four pillars, each with a diagram that
          draws itself, plus the returns worksheet, its only control. The
          franchise asks sit either side of it: the atlas foot above, the
          drench below. */}
      <ModelBoard
        id="model"
        tone="dark"
        heading={model.heading}
        lead={model.lead}
        model={retailModel}
      />

      {/* 4 — Partner cross-sell (single vermillion drench) */}
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
              {cta.ctaLabel}
            </Button>
          </div>
        </div>
      </DrenchBand>
    </div>
  );
}
