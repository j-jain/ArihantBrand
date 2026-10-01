import type { Metadata } from "next";

import {
  Button,
  DrenchBand,
  JsonLd,
  ModelBoard,
  ParallaxImage,
  Reveal,
  SectionHeading,
  StaggerGroup,
  StoreCard,
} from "@/components";
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
              className="m-rail grid gap-6 md:grid-cols-4"
              stagger={0.12}
            >
              {stores.map((store, i) => (
                <StoreCard key={`${store.name}-${store.city}-${i}`} store={store} />
              ))}
            </StaggerGroup>
          </div>
        </div>
      </section>

      {/* 3 — Model band (charcoal): four pillars, each with a diagram that
          draws itself, plus the returns worksheet. This used to be three
          sentences in a hairline list, which could state the zero-deadstock
          claim but could not show it. The franchise ask stays inside the band,
          because this is where the model has just been explained (AR8). */}
      <ModelBoard
        id="model"
        tone="dark"
        heading={model.heading}
        lead={model.lead}
        model={retailModel}
        pageCta={{ label: "Own a retail store", href: "/partner" }}
        media={
          /* Arihant Retail's own floor, so it outranks stock here. */
          <ParallaxImage
            src={photos.retailInterior.src}
            alt={photos.retailInterior.alt}
            ratio={photos.retailInterior.ratio}
            sizes="(max-width: 767px) 100vw, 35vw"
            className="m-ar-4-3 border border-line-dark"
            tilt
            mBleed
          />
        }
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
              See the partnership model
            </Button>
          </div>
        </div>
      </DrenchBand>
    </div>
  );
}
