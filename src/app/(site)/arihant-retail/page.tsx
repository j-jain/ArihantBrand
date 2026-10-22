import type { Metadata } from "next";
import Link from "next/link";

import {
  Button,
  DrenchBand,
  JsonLd,
  ModelBoard,
  SectionHeading,
  SectionReveal,
} from "@/components";
import { storeGallery } from "@/content/seed";
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
import { RetailHeroPhotos } from "./_components/RetailHeroPhotos";
import { StoreAtlas } from "./_components/StoreAtlas";
import { StoreGallery } from "./_components/StoreGallery";

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
 * Arihant Retail (change round 3 re-composition; round 5 made it one screen
 * per band and moved up a grade in finish and motion).
 *
 *  1. Hero (paper): one screen, the copy beside a stack of the two real store
 *     photographs. No stat band (its three figures key the store atlas) and
 *     no /partner ask: its one action is a quiet jump to the stores.
 *  2. Store atlas (paper-shade): where the stores are and who owns each one,
 *     on a terrain map over a ruled list, then the page's first two asks.
 *     Hovering a store opens its card: its photograph, or until there is one
 *     a drawn shopfront with its name on the fascia.
 *  3. Inside the stores (paper, change round 11): the client's photographs
 *     of the floors, a grid of captioned tiles.
 *  4. ModelBoard (charcoal), fitted to one screen: the worksheet is its only
 *     control.
 *  5. Drench: the franchise ask that follows the model (AR8).
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
  const gallery = sections.gallery;
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

      {/* 1 — Hero (paper), one screen: lockup, headline, rule and lead
          beside Arihant Retail's own floor and storefront. Real, so they
          outrank stock. */}
      {business ? (
        <UnitHero
          business={business}
          hero={hero}
          showStats={false}
          fit
          media={
            <RetailHeroPhotos
              interior={photos.retailInterior}
              storefront={photos.retailStorefront}
            />
          }
        >
          <div data-hero-reveal>
            <Link href="#stores" className="hero-jump group press">
              <span className="underline decoration-line decoration-2 underline-offset-4 transition-colors group-hover:decoration-[var(--unit-accent)]">
                {storesSection.heading}
              </span>
              <span aria-hidden="true" className="hero-jump__chev">
                ▾
              </span>
            </Link>
          </div>
        </UnitHero>
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

      {/* 3 — Inside the stores (paper): the floors as they trade, from the
          client's own shoot (change round 11). One entrance for the band:
          the heading's words, the lead, then the tiles in a stagger. */}
      {gallery && storeGallery.length ? (
        <section className="section-pad bg-paper">
          <div className="container-site">
            <SectionReveal className="m-flow flex flex-col gap-10">
              <SectionHeading heading={gallery.heading} lead={gallery.lead} sr />
              <StoreGallery photos={storeGallery} />
            </SectionReveal>
          </div>
        </section>
      ) : null}

      {/* 4 — Model band (charcoal): four pillars, each with a diagram that
          draws itself, plus the returns worksheet, its only control. The
          franchise asks sit either side of it: the atlas foot above, the
          drench below. */}
      <ModelBoard
        id="model"
        tone="dark"
        fit
        heading={model.heading}
        lead={model.lead}
        model={retailModel}
      />

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
              {cta.ctaLabel}
            </Button>
          </div>
        </div>
      </DrenchBand>
    </div>
  );
}
