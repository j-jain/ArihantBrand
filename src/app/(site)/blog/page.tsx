import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getPageCopy, getPosts } from "@/lib/content";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { Button, JsonLd, ThreadLabel } from "@/components";

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

      {/* 2 — Editorial post list */}
      <section className="section-pad bg-paper" style={{ paddingTop: 0 }}>
        <div className="container-site">
          <div className="border-b border-line">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="flex flex-col gap-2.5 border-t border-line py-8 sm:py-10"
              >
                <p className="t-label text-vermillion-deep">{post.audience}</p>
                <h2 className="t-h3 text-ink">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p
                  className="t-body measure text-ink-soft"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {post.excerpt}
                </p>
                <p className="t-small text-ink-soft">
                  {dateFmt.format(new Date(post.date))} · {post.readMinutes} min read
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 3 — CTA band (vermillion drench) */}
      <section
        className="on-dark section-pad"
        style={{ background: "var(--vermillion-drench)" }}
      >
        <div className="container-site">
          <div className="flex flex-col items-start gap-7">
            <h2 className="t-h2 measure text-white">
              {"Have a question the notes don't answer?"}
            </h2>
            <Button href={hero.primaryCta.href} variant="onDark" size="lg">
              {hero.primaryCta.label}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
