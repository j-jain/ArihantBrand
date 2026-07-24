import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getPageCopy, getSiteSettings } from "@/lib/content";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import {
  ContactChannels,
  DrenchBand,
  HeroIntro,
  JsonLd,
  MapPinIcon,
  Reveal,
  SectionHeading,
} from "@/components";
import { ContactForm } from "./_components/ContactForm";

const DIRECTIONS_URL =
  "https://maps.google.com/?q=Arihant+Tower,+Jyotikuchi,+Guwahati+781040";

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
          </div>
        </HeroIntro>
      </section>

      {/* 2 — Form + direct channels split */}
      <section id="inquiry" className="section-pad bg-paper-shade">
        <div className="container-site">
          <div className="m-flow-loose grid gap-x-12 gap-y-14 lg:grid-cols-12">
            <Reveal variant="clip" className="lg:col-span-7">
              <div className="m-flow flex flex-col gap-8">
                <SectionHeading heading={sections.form.heading} />
                <Suspense fallback={null}>
                  <ContactForm
                    whatsapp={settings.defaultWhatsapp}
                    contacts={settings.contacts}
                  />
                </Suspense>
              </div>
            </Reveal>

            <Reveal variant="fade" delay={0.08} className="lg:col-span-5">
              <aside className="m-flow flex flex-col gap-8">
                <SectionHeading heading={sections.direct.heading} lead={sections.direct.lead} />

                <div className="[&>div]:!grid-cols-1">
                  <ContactChannels contacts={settings.contacts} />
                </div>

                <div className="contact-address flex flex-col gap-2 border-t border-line pt-6">
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
                    href={DIRECTIONS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontWeight: 650 }}
                  >
                    <span>Get directions</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </aside>
            </Reveal>
          </div>
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
