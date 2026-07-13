import type { Metadata } from "next";
import type { LeadInput, LeadResult } from "@/content/types";
import {
  businesses,
  faqs,
  groupStats,
  partners,
  partnerSteps,
  siteSettings,
  stores,
  testimonials,
  timeline,
} from "@/content/seed";
import {
  Button,
  ContactChannels,
  FaqAccordion,
  InquiryForm,
  LogoMarquee,
  LogoWall,
  ProcessSteps,
  Reveal,
  SectionHeading,
  SiteFooter,
  SiteHeader,
  StatBand,
  StickyActionBar,
  StoreCard,
  TestimonialRail,
  ThreadLabel,
  Timeline,
} from "@/components";

export const metadata: Metadata = {
  title: "Component Gallery",
  robots: { index: false, follow: false },
};

/** Temporary local demo action so the InquiryForm can be exercised in the
 *  gallery without the real leads pipeline (owned elsewhere). */
async function demoAction(data: LeadInput): Promise<LeadResult> {
  "use server";
  void data;
  return { ok: true };
}

function Band({
  id,
  children,
  tone = "paper",
}: {
  id?: string;
  children: React.ReactNode;
  tone?: "paper" | "shade" | "dark";
}) {
  const toneClass =
    tone === "dark" ? "on-dark" : tone === "shade" ? "bg-paper-shade" : "bg-paper";
  return (
    <section id={id} className={`section-pad ${toneClass}`}>
      <div className="container-site">{children}</div>
    </section>
  );
}

export default function Home() {
  const marqueePartners = partners.slice(0, 12);
  const partnerFaqs = faqs.filter((f) => f.page === "partner").slice(0, 2);

  return (
    <>
      <SiteHeader />

      <main id="main" className="flex-1">
        {/* Hero — the single thread label + button variants */}
        <Band tone="paper">
          <div className="flex flex-col gap-6">
            <ThreadLabel>Guwahati · Since the 1990s</ThreadLabel>
            <h1 className="t-display measure text-ink">
              The house behind the Northeast&apos;s best-stocked stores
            </h1>
            <p className="t-lead measure text-ink-soft">
              A living gallery of the Arihant design-token layer and shared
              component library — every component below is rendered from real
              seed content.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button href="/partner" variant="primary" size="lg">
                Primary action
              </Button>
              <Button href="/brands" variant="secondary" size="lg">
                Secondary action
              </Button>
            </div>
          </div>
        </Band>

        {/* Proof band — charcoal, StatBand onDark, on-dark button */}
        <Band tone="dark">
          <div className="flex flex-col gap-10">
            <SectionHeading
              heading="Why the trade trusts Arihant"
              lead="Named Best Distributor of India by CMAI in 2015. Founder member of NEGTA."
              onDark
            />
            <StatBand stats={groupStats} onDark />
            <div>
              <Button href="/about" variant="onDark">
                Learn the story
              </Button>
            </div>
          </div>
        </Band>

        {/* Brand marquee */}
        <Band tone="paper">
          <div className="flex flex-col gap-8">
            <SectionHeading
              heading="The brands we carry"
              lead="A CSS-only marquee — hover or focus to pause; static under reduced motion."
            />
            <LogoMarquee partners={marqueePartners} />
          </div>
        </Band>

        {/* Filterable logo wall */}
        <Band tone="shade">
          <div className="flex flex-col gap-8">
            <SectionHeading heading="The full portfolio" />
            <LogoWall partners={partners} filterable />
          </div>
        </Band>

        {/* Process steps — true numbered sequence */}
        <Band tone="paper">
          <div className="flex flex-col gap-10">
            <SectionHeading
              heading="How it works"
              lead="Four steps from inquiry to a trading store."
            />
            <ProcessSteps steps={partnerSteps} />
          </div>
        </Band>

        {/* Stores — reveal wrapper + photo/fit-out variants */}
        <Band tone="shade">
          <Reveal className="flex flex-col gap-10">
            <SectionHeading
              heading="On the street today"
              lead="Real photos where we have them; an honest placeholder where a store is still in fit-out."
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {stores.map((store) => (
                <StoreCard key={`${store.name}-${store.city}-${store.status}`} store={store} />
              ))}
            </div>
          </Reveal>
        </Band>

        {/* Timeline */}
        <Band tone="paper">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
            <SectionHeading heading="The years that built the house" />
            <Timeline items={timeline} />
          </div>
        </Band>

        {/* FAQ + testimonials (renders nothing — none published) */}
        <Band tone="shade">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
            <SectionHeading heading="Straight answers" />
            <div className="flex flex-col gap-10">
              <FaqAccordion faqs={partnerFaqs} />
              <TestimonialRail testimonials={testimonials} />
            </div>
          </div>
        </Band>

        {/* Inquiry form */}
        <Band id="inquiry" tone="paper">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
            <SectionHeading
              heading="Request the details"
              lead="Intent-first, labelled fields, blur validation, and a confirmation panel on submit."
            />
            <InquiryForm
              action={demoAction}
              sourcePage="gallery"
              whatsapp={siteSettings.defaultWhatsapp}
            />
          </div>
        </Band>

        {/* Contact channels on paper */}
        <Band tone="shade">
          <div className="flex flex-col gap-10">
            <SectionHeading
              heading="Reach us directly"
              lead={`All three businesses operate from ${siteSettings.addressLine}, ${siteSettings.locality}, ${siteSettings.city}.`}
            />
            <ContactChannels contacts={siteSettings.contacts} />
          </div>
        </Band>

        {/* Unit-accent thread labels quick check */}
        <Band tone="paper">
          <div className="flex flex-col gap-6">
            <SectionHeading heading="Unit-accent thread labels" />
            <div className="flex flex-wrap gap-4">
              {businesses.map((b) => (
                <ThreadLabel
                  key={b.unit}
                  accent={`var(--unit-${b.unit})`}
                >
                  {b.name} · {b.founded}
                </ThreadLabel>
              ))}
            </div>
          </div>
        </Band>
      </main>

      <SiteFooter settings={siteSettings} />
      <StickyActionBar
        tel={`+${siteSettings.defaultWhatsapp}`}
        whatsapp={siteSettings.defaultWhatsapp}
      />
    </>
  );
}
