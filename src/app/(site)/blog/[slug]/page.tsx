import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import type { Post } from "@/content/types";
import { stockImages } from "@/content/images";
import { getPost, getPosts } from "@/lib/content";
import { articleJsonLd, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { Button, HeroIntro, JsonLd, ParallaxImage } from "@/components";
import { PostBody } from "./_components/PostBody";
import { ReadingProgress } from "./_components/ReadingProgress";

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** Resolve the manifest alt for a post image by matching its src, so the header
 *  image carries a real descriptive alt (card thumbnails stay decorative). */
function altForImage(src?: string): string {
  if (!src) return "";
  return Object.values(stockImages).find((img) => img.src === src)?.alt ?? "";
}

/** End-matter call to action, keyed on who the note was written for. */
const CTA_BY_AUDIENCE: Record<Post["audience"], { label: string; href: string }> = {
  Retailers: { label: "Become a retail partner", href: "/contact?intent=retailer" },
  Brands: { label: "Distribute your brand", href: "/contact?intent=brand" },
  Investors: { label: "See the partnership model", href: "/partner" },
};

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return pageMetadata({
    title: post.title,
    description: post.metaDescription,
    path: `/blog/${slug}`,
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([getPost(slug), getPosts()]);

  if (!post) notFound();

  const others = allPosts.filter((p) => p.slug !== post.slug);
  const cta = CTA_BY_AUDIENCE[post.audience];

  return (
    <>
      <JsonLd data={articleJsonLd(post)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Trade Notes", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />

      <section className="section-pad bg-paper">
        <div className="container-site">
          <div className="article mx-auto max-w-[46rem]">
            {/* Article header + hero image, entering as one orchestrated load */}
            <HeroIntro>
              <header className="m-flow-tight flex flex-col gap-4">
                <p data-hero-reveal className="t-label text-vermillion-deep">
                  {post.audience}
                </p>
                <h1 data-hero-title className="t-h2 text-ink">
                  {post.title}
                </h1>
                <p data-hero-reveal className="t-small text-ink-soft">
                  {post.author ? (
                    <>
                      By{" "}
                      <span className="font-semibold text-ink">{post.author.name}</span>
                      {post.author.role ? `, ${post.author.role}` : null} ·{" "}
                    </>
                  ) : null}
                  {dateFmt.format(new Date(post.date))} · {post.readMinutes} min read
                  {post.author?.sourceUrl ? (
                    <>
                      {" · "}
                      <a
                        href={post.author.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-4 hover:text-vermillion-deep"
                      >
                        Originally posted on LinkedIn
                      </a>
                    </>
                  ) : null}
                </p>
              </header>

              {post.image ? (
                <div data-hero-reveal className="mt-8">
                  <ParallaxImage
                    src={post.image}
                    alt={post.imageAlt || altForImage(post.image)}
                    ratio="3 / 2"
                    priority
                    sizes="(max-width: 767px) 100vw, 46rem"
                    mBleed
                  />
                </div>
              ) : null}
            </HeroIntro>

            {/* Body */}
            <div id="article-body" className="article__body mt-12">
              <PostBody blocks={post.body} />
            </div>
            <ReadingProgress targetId="article-body" />

            {/* End matter — contextual CTA */}
            <aside
              className="article__cta m-cta mt-14 flex flex-col items-start gap-5 border border-line bg-paper-shade p-7"
              style={{ borderRadius: "8px" }}
            >
              <p className="t-h4 text-ink">Put these notes to work.</p>
              <Button href={cta.href} variant="primary" size="lg" className="press">
                {cta.label}
              </Button>
            </aside>

            {/* More notes */}
            {others.length > 0 ? (
              <div className="article__more mt-14 border-t border-line pt-8">
                <h2 className="t-h3 text-ink">More notes</h2>
                <ul className="mt-5 flex flex-col">
                  {others.map((other) => (
                    <li key={other.slug} className="border-t border-line first:border-t-0">
                      <Link
                        href={`/blog/${other.slug}`}
                        className="press group flex items-center gap-4 py-4"
                      >
                        {other.image ? (
                          <span className="relative aspect-[3/2] w-24 shrink-0 overflow-hidden rounded-[4px] border border-line bg-paper-shade sm:w-28">
                            <Image
                              src={other.image}
                              alt=""
                              fill
                              sizes="112px"
                              className="object-cover transition-transform duration-500 [transition-timing-function:var(--ease)] group-hover:scale-[1.05]"
                            />
                          </span>
                        ) : null}
                        <span className="flex flex-col gap-1">
                          <span className="t-label text-vermillion-deep">
                            {other.audience}
                          </span>
                          <span
                            className="t-body text-ink underline-offset-4 group-hover:underline"
                            style={{ fontWeight: 650 }}
                          >
                            {other.title}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
