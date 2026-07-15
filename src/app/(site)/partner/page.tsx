import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getBusinesses,
  getFaqs,
  getPageCopy,
  getPartnerSteps,
  getSiteSettings,
  getStores,
} from "@/lib/content";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata } from "@/lib/seo";
import {
  Button,
  ContactChannels,
  FaqAccordion,
  HeroIntro,
  InquiryForm,
  JsonLd,
  ParallaxImage,
  Reveal,
  SectionHeading,
  StaggerGroup,
  cn,
} from "@/components";
import { stockImages } from "@/content/images";
import { submitLeadAction } from "@/app/actions/lead";
import { PromiseList } from "./_components/PromiseList";
import { ProofStrip } from "./_components/ProofStrip";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPageCopy("partner");
  if (!copy) return {};
  return pageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/partner",
  });
}

export default async function PartnerPage() {
  const [copy, faqs, steps, businesses, settings, stores] = await Promise.all([
    getPageCopy("partner"),
    getFaqs("partner"),
    getPartnerSteps(),
    getBusinesses(),
    getSiteSettings(),
    getStores(),
  ]);

  if (!copy) notFound();

  const { hero, sections } = copy;
  const retail = businesses.find((b) => b.unit === "retail");
  const retailContact = settings.contacts.find((c) => c.unit === "retail");
  const heroStats = retail?.stats ?? [];

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Partner with Arihant Retail", path: "/partner" },
  ]);

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={faqJsonLd(faqs)} />

      {/* 1 — Hero: this page opens dark, for gravitas */}
      <section className="section-pad on-dark">
        <HeroIntro className="container-site">
          <div className="grid items-start gap-12 lg:grid-cols-[1.5fr_1fr]">
            <div className="flex flex-col gap-6">
              <h1
                data-hero-title
                className="t-display measure text-on-charcoal"
                style={{ textWrap: "normal" }}
              >
                {hero.heading}
              </h1>
              <p data-hero-reveal className="t-lead measure text-on-charcoal-soft">
                {hero.lead}
              </p>
              <div data-hero-reveal className="mt-1 flex flex-wrap items-center gap-x-7 gap-y-4">
                <Button href={hero.primaryCta.href} variant="primary" size="lg">
                  {hero.primaryCta.label}
                </Button>
                {hero.secondaryCta ? (
                  <Link
                    href={hero.secondaryCta.href}
                    className="group inline-flex min-h-11 items-center gap-1.5 text-on-charcoal-soft transition-colors hover:text-on-charcoal"
                    style={{ fontWeight: 600 }}
                  >
                    <span className="underline-offset-4 group-hover:underline">
                      {hero.secondaryCta.label}
                    </span>
                    <span aria-hidden="true" className="text-vermillion">
                      ▸
                    </span>
                  </Link>
                ) : null}
              </div>
            </div>

            {heroStats.length > 0 ? (
              <ul data-hero-reveal className="flex flex-col" aria-label="Arihant Retail at a glance">
                {heroStats.map((stat, i) => (
                  <li
                    key={stat.label}
                    className={cn(
                      "flex items-baseline gap-5 py-4",
                      i > 0 && "border-t border-line-dark",
                    )}
                  >
                    <span
                      className="text-on-charcoal"
                      style={{
                        fontFamily: "var(--font-archivo), system-ui, sans-serif",
                        fontWeight: 800,
                        fontStretch: "85%",
                        fontVariantNumeric: "tabular-nums",
                        fontSize: "clamp(2.2rem, 1.7rem + 1.6vw, 3rem)",
                        lineHeight: 1,
                        minWidth: "2.5ch",
                      }}
                    >
                      {stat.value}
                      {stat.suffix ?? ""}
                    </span>
                    <span className="t-small text-on-charcoal-soft">{stat.label}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </HeroIntro>
      </section>

      {/* 2 — Promise: the objection-handling core, beside the storefront image */}
      <section className="section-pad bg-paper">
        <div className="container-site flex flex-col gap-10">
          <Reveal variant="fade">
            <SectionHeading heading={sections.promise.heading} lead={sections.promise.lead} />
          </Reveal>
          <div className="grid gap-x-12 gap-y-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <ParallaxImage
              src={stockImages.partnerStorefront.src}
              alt={stockImages.partnerStorefront.alt}
              ratio="4 / 5"
              sizes="(max-width: 1023px) 100vw, 34vw"
              className="border border-line"
            />
            <PromiseList items={sections.promise.body ?? []} />
          </div>
        </div>
      </section>

      {/* 3 — Proof: real stores, already trading */}
      <section className="section-pad bg-paper-shade">
        <div className="container-site">
          <div className="flex flex-col gap-10">
            <Reveal variant="fade">
              <SectionHeading heading={sections.proof.heading} lead={sections.proof.lead} />
            </Reveal>
            <ProofStrip stores={stores} />
          </div>
        </div>
      </section>

      {/* 4 — How it works: the four franchise steps, sequenced in */}
      <section id="how-it-works" className="section-pad bg-paper">
        <div className="container-site">
          <div className="flex flex-col gap-12">
            <Reveal variant="fade">
              <SectionHeading heading={sections.how.heading} lead={sections.how.lead} />
            </Reveal>
            <StaggerGroup
              as="ol"
              from="up"
              className="grid gap-x-6 gap-y-10 md:grid-cols-4"
              stagger={0.12}
            >
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  className="flex flex-col gap-3 border-t border-line pt-5"
                >
                  <span
                    className="t-h3 font-display text-vermillion-deep"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="t-h4 text-ink">{step.title}</h3>
                  <p className="t-body text-ink-soft">{step.text}</p>
                </li>
              ))}
            </StaggerGroup>
          </div>
        </div>
      </section>

      {/* 5 — FAQ: on charcoal, the questions serious investors ask */}
      <section className="section-pad on-dark">
        <div className="container-site">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
            <SectionHeading heading={sections.faq.heading} onDark />
            <FaqAccordion faqs={faqs} />
          </div>
        </div>
      </section>

      {/* 6 — Inquiry */}
      <section id="inquiry" className="section-pad bg-paper">
        <div className="container-site">
          <div className="flex flex-col gap-10">
            <SectionHeading heading={sections.inquiry.heading} lead={sections.inquiry.lead} />
            <div className="grid gap-x-12 gap-y-12 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <InquiryForm
                  action={submitLeadAction}
                  defaultIntent="franchise"
                  sourcePage="/partner"
                  whatsapp={retailContact?.whatsapp}
                />
              </div>
              {retailContact ? (
                <aside className="flex flex-col gap-5 lg:col-span-5">
                  <p className="t-h4 text-ink">Prefer to talk first?</p>
                  <p className="t-body text-ink-soft measure">
                    Skip the form. Call or WhatsApp the Arihant Retail desk directly.
                  </p>
                  <ContactChannels contacts={[retailContact]} compact />
                </aside>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
