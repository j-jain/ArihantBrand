import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

import { schemaTypes } from "./src/sanity/schemas";
import { structure, singletonTypes } from "./src/sanity/structure";

/** Studio config for the embedded Studio at /studio.
 *  A placeholder projectId keeps `defineConfig` happy when env vars are absent;
 *  the /studio route only mounts the Studio when Sanity is actually configured,
 *  so the placeholder never initialises a real client. */
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "missing-project-id";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const isDev = process.env.NODE_ENV === "development";

export default defineConfig({
  name: "arihant",
  title: "Arihant Group",
  basePath: "/studio",
  projectId,
  dataset,
  schema: {
    types: schemaTypes,
    // No "create new" template for the singleton.
    templates: (prev) => prev.filter((t) => !singletonTypes.has(t.schemaType)),
  },
  document: {
    // The singleton can't be duplicated or deleted.
    actions: (input, context) =>
      singletonTypes.has(context.schemaType)
        ? input.filter(({ action }) => action !== "duplicate" && action !== "delete" && action !== "unpublish")
        : input,
  },
  plugins: [
    structureTool({ structure }),
    ...(isDev ? [visionTool({ defaultApiVersion: "2025-06-01" })] : []),
  ],
});
