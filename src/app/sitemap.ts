import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/content";
import { siteUrl } from "@/lib/seo";

const STATIC_ROUTES = [
  "/",
  "/arihant-marketing",
  "/arihant-apparels",
  "/arihant-retail",
  "/partner",
  "/brands",
  "/about",
  "/blog",
  "/contact",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const posts = await getPosts();

  return [
    ...STATIC_ROUTES.map((path) => ({
      url: `${base}${path === "/" ? "" : path}`,
    })),
    ...posts.map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: post.date,
    })),
  ];
}
