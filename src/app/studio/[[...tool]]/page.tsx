import type { Metadata, Viewport } from "next";
import { sanityConfigured } from "@/lib/sanity";

/**
 * Embedded Sanity Studio at /studio.
 *
 * Guard: when NEXT_PUBLIC_SANITY_PROJECT_ID is absent the Studio (and its
 * config, which pulls in the whole `sanity` client bundle) is never imported —
 * a small explainer renders instead, so `npm run build` succeeds with no env.
 *
 * The catch-all `[[...tool]]` segment is handled by the Studio's own client
 * router, so the route is rendered dynamically rather than statically
 * pre-rendered per sub-path.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Arihant Group Studio",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function StudioPage() {
  if (!sanityConfigured) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          background: "#1c1a19",
          color: "#f4f1ef",
        }}
      >
        <div style={{ maxWidth: "34rem", lineHeight: 1.6 }}>
          <h1 style={{ fontSize: "1.5rem", margin: "0 0 0.75rem" }}>
            Studio not configured
          </h1>
          <p style={{ margin: "0 0 0.75rem", color: "#cfc9c5" }}>
            The Sanity Studio needs a project to connect to. Set{" "}
            <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> (and{" "}
            <code>SANITY_API_TOKEN</code> for seeding and lead capture), then
            restart the app.
          </p>
          <p style={{ margin: 0, color: "#8f8a86" }}>
            See <strong>SETUP.md</strong> for the full walkthrough. The public
            site runs fully without any of this — it falls back to the seed
            content in <code>src/content</code>.
          </p>
        </div>
      </main>
    );
  }

  const [{ NextStudio }, { default: config }] = await Promise.all([
    import("next-sanity/studio"),
    import("../../../../sanity.config"),
  ]);

  return <NextStudio config={config} />;
}
