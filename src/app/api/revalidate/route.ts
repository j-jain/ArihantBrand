import type { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { parseBody } from "next-sanity/webhook";

/**
 * Sanity webhook -> cache tag invalidation.
 *
 * Every query in src/lib/content.ts is tagged with the Sanity document type it
 * reads, plus a "sanity" catch-all. This route verifies the webhook signature
 * and expires the tag for the type that changed, so the next request to any
 * page reading that type re-renders with fresh content. Without it, a Studio
 * edit would not reach the live site until someone redeployed.
 *
 * Two Next 16 details worth stating, because both are easy to get wrong:
 *
 *  - `revalidateTag` takes two arguments here. We pass `{ expire: 0 }` rather
 *    than the `"max"` profile: `"max"` marks the entry stale and serves the OLD
 *    page to the next visitor while refreshing behind them. An editor who
 *    publishes and refreshes has to see their change on THAT refresh.
 *  - `updateTag` has exactly the semantics we want but Next restricts it to
 *    Server Actions, and a webhook lands in a route handler.
 *
 * `parseBody` verifies the HMAC in the `sanity-webhook-signature` header and,
 * by default, waits ~3s for Content Lake's eventual consistency to settle, so
 * we invalidate only once the new document is actually queryable.
 *
 * Route handlers are always dynamic, so this adds nothing to the static build
 * and reads no Sanity env vars at module scope: a build with no Sanity
 * configuration is unaffected.
 */

interface WebhookBody {
  _type?: string;
  _id?: string;
}

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    // Fail closed. An unsigned endpoint that busts caches on demand is a free
    // denial-of-service handle for anyone who finds the URL.
    return Response.json(
      { revalidated: false, message: "SANITY_REVALIDATE_SECRET is not set." },
      { status: 500 },
    );
  }

  let body: WebhookBody | null;
  let isValidSignature: boolean | null;
  try {
    ({ body, isValidSignature } = await parseBody<WebhookBody>(req, secret));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not read the webhook body.";
    return Response.json({ revalidated: false, message }, { status: 400 });
  }

  // Only an explicit `true` is acceptable. `parseBody` returns `null` when the
  // signature header is absent altogether, and `false` when it is present but
  // wrong; both must be refused. Checking `!== false` would let an unsigned
  // request through, which would hand anyone who found this URL a free
  // cache-busting endpoint.
  if (isValidSignature !== true) {
    return Response.json(
      {
        revalidated: false,
        message: isValidSignature === false ? "Invalid signature." : "Missing signature.",
      },
      { status: 401 },
    );
  }

  const type = body?._type;
  if (!type) {
    return Response.json(
      { revalidated: false, message: "Webhook payload carried no _type." },
      { status: 400 },
    );
  }

  // Leads are written by the site itself, many times a day, and no page reads
  // them. Invalidating on a form submission would rebuild the site for nothing.
  if (type === "lead") {
    return Response.json({ revalidated: false, message: "Ignored: lead." });
  }

  revalidateTag(type, { expire: 0 });

  return Response.json({ revalidated: true, type, id: body?._id });
}
