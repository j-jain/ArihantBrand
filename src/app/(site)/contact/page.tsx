import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getPageCopy, getSiteSettings } from "@/lib/content";
import { breadcrumbJsonLd, mapsUrl, pageMetadata } from "@/lib/seo";
import {
  ContactChannels,
  DrenchBand,
  HeroIntro,
  JsonLd,
  MapPinIcon,
  SectionHeading,
  SectionReveal,
} from "@/components";
import { ContactForm } from "./_components/ContactForm";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPageCopy("contact");
  if (!copy) return {};
  return pageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/contact",
  });
}

export default async function ContactPage() {
  const [copy, settings] = await Promise.all([
    getPageCopy("contact"),
    getSiteSettings(),
  ]);

  if (!copy) notFound();

  const { hero, sections } = copy;
  const directionsUrl = mapsUrl(settings);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Contact", path: "/contact" },
  ]);

  return (
    <>
      <JsonLd data={breadcrumb} />

      {/* 1 — Hero (compact) */}
      <section
        className="bg-paper"
        style={{
          paddingBlock: "var(--m-hero-compact-pad, clamp(3rem, 6vw, 5.5rem))",
        }}
      >
        <HeroIntro className="container-site">
          <div className="m-flow-tight flex flex-col gap-6">
            <h1
              data-hero-title
              className="t-display measure text-ink"
              style={{ textWrap: "normal" }}
            >
              {hero.heading}
            </h1>
            <p data-hero-reveal className="t-lead measure text-ink-soft">
              {hero.lead}
            </p>
            {/* The hero's one ask as a quiet jump to the form (change round
                9; the field existed and nothing rendered it). */}
            {hero.primaryCta?.label ? (
              <div data-hero-reveal>
                <a href={hero.primaryCta.href} className="hero-jump group press">
                  <span className="underline decoration-line decoration-2 underline-offset-4 transition-colors group-hover:decoration-vermillion-deep">
                    {hero.primaryCta.label}
                  </span>
                  <span aria-hidden="true" className="hero-jump__chev">
                    ▾
                  </span>
                </a>
              </div>
            ) : null}
          </div>
        </HeroIntro>
      </section>

      {/* 2 — Form + direct channels split */}
      <section id="inquiry" className="section-pad bg-paper-shade">
        <div className="container-site">
          {/* One entrance for the split (change round 9): both headings'
              words rise together, the channels rule in as rows. The form is
              never hidden, so a reader arriving on #inquiry finds it ready. */}
          <SectionReveal className="m-flow-loose grid gap-x-12 gap-y-14 md:grid-cols-12">
            <div className="md:col-span-7">
              <div className="m-flow flex flex-col gap-8">
                <SectionHeading heading={sections.form.heading} sr />
                <Suspense fallback={null}>
                  <ContactForm
                    whatsapp={settings.defaultWhatsapp}
                    contacts={settings.contacts}
                  />
                </Suspense>
              </div>
            </div>

            <div className="md:col-span-5">
              <aside className="m-flow flex flex-col gap-8">
                <SectionHeading heading={sections.direct.heading} lead={sections.direct.lead} sr />

                <div data-sr="rows" className="[&>div]:!grid-cols-1">
                  <ContactChannels contacts={settings.contacts} />
                </div>

                <div data-sr="item" className="contact-address flex flex-col gap-2 border-t border-line pt-6">
                  <p className="flex items-start gap-2 t-body text-ink">
                    <span className="mt-0.5 flex-none text-ink-soft">
                      <MapPinIcon />
                    </span>
                    <span>
                      {settings.addressLine}
                      <br />
                      {settings.locality}, {settings.city}, {settings.state}{" "}
                      {settings.postalCode}
                    </span>
                  </p>
                  <a
                    className="channel-link ml-7 text-vermillion-deep"
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontWeight: 650 }}
                  >
                    <span>Get directions</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </aside>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* 3 — Quiet close (single vermillion drench) */}
      <DrenchBand className="py-[clamp(2.75rem,5vw,4rem)]">
        <div className="container-site m-flow-tight flex flex-col gap-2">
          <p data-drench-reveal className="t-h3">{settings.tagline}.</p>
          <p data-drench-reveal className="t-body" style={{ color: "var(--_text-soft)" }}>
            We will call you within one working day.
          </p>
        </div>
      </DrenchBand>
    </>
  );
}
