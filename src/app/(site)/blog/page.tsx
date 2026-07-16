import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getPageCopy, getPosts } from "@/lib/content";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import {
  Button,
  DrenchBand,
  HeroIntro,
  JsonLd,
  StaggerGroup,
} from "@/components";

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPageCopy("blog");
  if (!copy) return {};
  return pageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/blog",
  });
}

export default async function BlogPage() {
  const [copy, posts] = await Promise.all([getPageCopy("blog"), getPosts()]);
  if (!copy) notFound();

  const { hero } = copy;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Trade Notes", path: "/blog" },
        ])}
      />

      {/* 1 — Hero (compact) */}
      <section className="bg-paper">
        <HeroIntro
          className="container-site"
          // Compact editorial hero — lighter than the full page heroes.
        >
          <div
            className="flex flex-col gap-6"
            style={{ paddingBlock: "clamp(3rem, 6vw, 5.5rem)" }}
          >
            <h1 data-hero-title className="t-display measure text-ink">
              {hero.heading}
            </h1>
            <p data-hero-reveal className="t-lead measure text-ink-soft">
              {hero.lead}
            </p>
          </div>
        </HeroIntro>
      </section>

      {/* 2 — Posts index: the full card grid, scannable and crawlable on
          every device */}
      <section className="section-pad bg-paper" style={{ paddingTop: 0 }}>
        <div className="container-site">
          <StaggerGroup
            as="ul"
            from="up"
            stagger={0.09}
            className="mt-12 grid gap-x-6 gap-y-11 sm:grid-cols-2 lg:grid-cols-3"
          >
            {posts.map((post, i) => (
              <li key={post.slug} className="flex">
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex h-full w-full flex-col"
                >
                  {/* Thumbnail — decorative (title is adjacent), so alt="" */}
                  <div className="relative aspect-[3/2] overflow-hidden rounded-[6px] border border-line bg-paper-shade">
                    {post.image ? (
                      <Image
                        src={post.image}
                        alt=""
                        fill
                        priority={i === 0}
                        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 [transition-timing-function:var(--ease)] will-change-transform group-hover:scale-[1.045]"
                      />
                    ) : null}
                  </div>

                  <p className="t-label mt-5 text-vermillion-deep">
                    {post.audience}
                  </p>
                  <h2
                    className="mt-2.5 font-display text-ink"
                    style={{ fontWeight: 700, fontSize: "1.28rem", lineHeight: 1.24 }}
                  >
                    <span className="underline-offset-4 group-hover:underline">
                      {post.title}
                    </span>
                  </h2>
                  <p
                    className="t-small mt-2.5 text-ink-soft"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {post.excerpt}
                  </p>
                  <p className="t-small mt-4 pt-4 border-t border-line text-ink-soft">
                    {dateFmt.format(new Date(post.date))} · {post.readMinutes} min read
                  </p>
                </Link>
              </li>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* 3 — CTA band (single vermillion drench) */}
      <DrenchBand className="section-pad">
        <div className="container-site flex flex-col items-start gap-7">
          <h2 data-drench-reveal className="t-h2 measure text-white">
            Some answers only come from a conversation.
          </h2>
          <div data-drench-reveal>
            <Button href={hero.primaryCta.href} variant="onDark" size="lg">
              {hero.primaryCta.label}
            </Button>
          </div>
        </div>
      </DrenchBand>
    </>
  );
}
