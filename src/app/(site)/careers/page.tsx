import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  ContactChannels,
  HeroIntro,
  InquiryForm,
  JsonLd,
  Reveal,
  SectionHeading,
  StaggerGroup,
} from "@/components";
import { getPageCopy, getSiteSettings } from "@/lib/content";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { submitLeadAction } from "@/app/actions/lead";

const PATH = "/careers";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPageCopy("careers");
  if (!copy) return {};
  return pageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: PATH,
  });
}

/**
 * Careers (change brief, X6).
 *
 * A distribution house's field staff, warehouse team and store staff are the
 * product, and the site said nothing about working here. This is deliberately
 * one page and one form rather than a job board: openings in this trade are
 * filled by conversation, and the honest thing is to take applications the
 * same way. It reuses InquiryForm on a `careers` intent, so an application
 * lands in the same place as every other lead, tagged.
 */
export default async function CareersPage() {
  const [copy, settings] = await Promise.all([
    getPageCopy("careers"),
    getSiteSettings(),
  ]);

  if (!copy) notFound();

  const { hero, sections } = copy;
  const marketingContact = settings.contacts.find((c) => c.unit === "marketing");

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Careers", path: PATH },
        ])}
      />

      {/* 1 — Hero (paper) */}
      <section className="bg-paper">
        <HeroIntro className="container-site hero-pad">
          <div className="m-flow flex max-w-3xl flex-col items-start gap-6">
            <h1 data-hero-title className="t-display text-ink">
              {hero.heading}
            </h1>
            <p data-hero-reveal className="t-lead measure text-ink-soft">
              {hero.lead}
            </p>
          </div>
        </HeroIntro>
      </section>

      {/* 2 — What we hire for (paper-shade) */}
      {sections.roles ? (
        <section className="section-pad bg-paper-shade">
          <div className="container-site m-flow flex flex-col gap-10">
            <Reveal variant="fade">
              <SectionHeading
                heading={sections.roles.heading}
                lead={sections.roles.lead}
              />
            </Reveal>
            <StaggerGroup
              as="ul"
              from="up"
              className="flex flex-col border-t border-line"
              stagger={0.08}
              mLedger
            >
              {(sections.roles.body ?? []).map((role) => (
                <li
                  key={role}
                  className="m-ledger-row t-body border-b border-line py-5 text-ink-soft"
                >
                  {role}
                </li>
              ))}
            </StaggerGroup>
          </div>
        </section>
      ) : null}

      {/* 3 — What it is like (paper) */}
      {sections.working ? (
        <section className="section-pad bg-paper">
          <div className="container-site m-flow flex flex-col gap-8">
            <Reveal variant="fade">
              <SectionHeading
                heading={sections.working.heading}
                lead={sections.working.lead}
              />
            </Reveal>
            {(sections.working.body ?? []).map((paragraph) => (
              <p key={paragraph} className="t-body measure text-ink-soft">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      {/* 4 — Apply */}
      <section id="inquiry" className="section-pad bg-paper-shade">
        <div className="container-site">
          <div className="m-flow flex flex-col gap-10">
            <SectionHeading
              heading={sections.apply.heading}
              lead={sections.apply.lead}
            />
            <div className="m-flow grid gap-x-12 gap-y-12 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <InquiryForm
                  action={submitLeadAction}
                  defaultIntent="careers"
                  sourcePage={PATH}
                  whatsapp={settings.defaultWhatsapp}
                />
              </div>
              {marketingContact ? (
                <aside className="m-flow-tight flex flex-col gap-5 lg:col-span-5">
                  <p className="t-h4 text-ink">Rather talk?</p>
                  <p className="t-body measure text-ink-soft">
                    Call the office. Ask for whoever handles hiring for the role
                    you are after.
                  </p>
                  <ContactChannels contacts={[marketingContact]} compact />
                </aside>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
