import { defineCliConfig } from "sanity/cli";

/** CLI config (used by `npx sanity ...` commands run from this repo).
 *  Reads the same env vars as the app; harmless when unset. */
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export default defineCliConfig({
  api: { projectId, dataset },
});
