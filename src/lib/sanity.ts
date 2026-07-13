/**
 * Sanity client + image helper.
 *
 * The whole site must build and render from `src/content` seed data when no
 * Sanity project is configured. Therefore:
 *  - clients are created lazily (only on first `getClient()` / `getWriteClient()`),
 *  - reading env at import time never throws,
 *  - `sanityConfigured` is the single switch the data layer checks.
 *
 * Sanity activates purely via environment variables:
 *  - NEXT_PUBLIC_SANITY_PROJECT_ID  (required to turn Sanity on)
 *  - NEXT_PUBLIC_SANITY_DATASET     (defaults to "production")
 *  - SANITY_API_TOKEN               (server-only; required for writes/seeding)
 */

import { createClient, type SanityClient } from "next-sanity";
import {
  createImageUrlBuilder,
  type ImageUrlBuilder,
  type SanityImageSource,
} from "@sanity/image-url";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = "2025-06-01";

/** True when a Sanity project id is present — the data layer's read switch. */
export const sanityConfigured: boolean = Boolean(projectId);

/** True when Sanity can be written to (project id + server token present). */
export function sanityWriteConfigured(): boolean {
  return Boolean(projectId && process.env.SANITY_API_TOKEN);
}

let readClient: SanityClient | null = null;

/** Read client (CDN-backed). Throws only if called while unconfigured. */
export function getClient(): SanityClient {
  if (!projectId) {
    throw new Error(
      "Sanity is not configured: set NEXT_PUBLIC_SANITY_PROJECT_ID to use getClient().",
    );
  }
  if (!readClient) {
    readClient = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
    });
  }
  return readClient;
}

let writeClient: SanityClient | null = null;

/** Write client (token, no CDN). Throws a descriptive error if unconfigured. */
export function getWriteClient(): SanityClient {
  const token = process.env.SANITY_API_TOKEN;
  if (!projectId) {
    throw new Error(
      "Sanity write client unavailable: NEXT_PUBLIC_SANITY_PROJECT_ID is not set.",
    );
  }
  if (!token) {
    throw new Error(
      "Sanity write client unavailable: SANITY_API_TOKEN is not set.",
    );
  }
  if (!writeClient) {
    writeClient = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      token,
    });
  }
  return writeClient;
}

let imgBuilder: ImageUrlBuilder | null = null;

/**
 * Image URL helper. Returns an `ImageUrlBuilder` when Sanity is configured,
 * or `null` when it is not, so callers can safely do:
 *   `urlFor(doc.logo)?.url() ?? doc.logoPath`
 */
export function urlFor(source: SanityImageSource): ImageUrlBuilder | null {
  if (!projectId) return null;
  if (!imgBuilder) {
    imgBuilder = createImageUrlBuilder({ projectId, dataset });
  }
  return imgBuilder.image(source);
}

export type { SanityImageSource };
