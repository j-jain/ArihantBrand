"use client";

import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";

/** Client boundary for the Studio. The `sanity` package must never enter the
 *  React Server Components graph — its dependency `swr` has no default export
 *  under the `react-server` condition and breaks the build. */
export default function StudioClient() {
  return <NextStudio config={config} />;
}
