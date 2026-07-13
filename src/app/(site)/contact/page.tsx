import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getPageCopy, getSiteSettings } from "@/lib/content";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import {
  ContactChannels,
  JsonLd,
  MapPinIcon,
  SectionHeading,
  ThreadLabel,
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
        style={{ paddingBlock: "clamp(3rem, 6vw, 5.5rem)" }}
      >
        <div className="container-site">
          <div className="flex flex-col gap-6">
            <ThreadLabel>{hero.threadLabel}</ThreadLabel>
            <h1 className="t-display measure text-ink">{hero.heading}</h1>
            <p className="t-lead measure text-ink-soft">{hero.lead}</p>
          </div>
        </div>
      </section>

      {/* 2 — Form + direct channels split */}
      <section id="inquiry" className="section-pad bg-paper-shade">
        <div className="container-site">
          <div className="grid gap-x-12 gap-y-14 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="flex flex-col gap-8">
                <SectionHeading heading={sections.form.heading} />
                <Suspense fallback={null}>
                  <ContactForm whatsapp={settings.defaultWhatsapp} />
                </Suspense>
              </div>
            </div>

            <aside className="flex flex-col gap-8 lg:col-span-5">
              <SectionHeading heading={sections.direct.heading} lead={sections.direct.lead} />

              <div className="[&>div]:!grid-cols-1">
                <ContactChannels contacts={settings.contacts} />
              </div>

              <div className="flex flex-col gap-2 border-t border-line pt-6">
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
          </div>
        </div>
      </section>

      {/* 3 — Quiet close */}
      <section
        className="on-dark"
        style={{ paddingBlock: "clamp(2.75rem, 5vw, 4rem)" }}
      >
        <div className="container-site">
          <div className="flex flex-col gap-2">
            <p className="t-h3 text-on-charcoal">{settings.tagline}.</p>
            <p className="t-body text-on-charcoal-soft">
              We respond within two working days.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
