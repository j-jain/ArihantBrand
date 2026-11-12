/**
 * Tell Bing (and the other IndexNow engines: Yandex, Seznam, Naver) that the
 * site's pages have changed, so they recrawl now instead of in a few weeks.
 * Bing's index feeds ChatGPT search, Microsoft Copilot and DuckDuckGo, so
 * this is the quickest way to get fresh pages into AI answers.
 *
 * Run AFTER a publish is live (code deployed, seed and revalidate done):
 *
 *   node scripts/indexnow.mjs            # every URL in the live sitemap
 *   node scripts/indexnow.mjs --dry-run  # print what would be sent
 *
 * The key is public by design: IndexNow proves ownership by fetching
 * https://www.arihant.marketing/<key>.txt, the file in public/. It is not a
 * secret. Keep the file deployed; delete both to stop using IndexNow.
 */

const SITE = "https://www.arihant.marketing";
const KEY = "0592d1274e303a134da6324769fc93ea";
const dryRun = process.argv.includes("--dry-run");

const sitemap = await fetch(`${SITE}/sitemap.xml`).then((r) => {
  if (!r.ok) throw new Error(`sitemap.xml returned ${r.status}`);
  return r.text();
});
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
urlList.push(`${SITE}/llms.txt`);

const keyCheck = await fetch(`${SITE}/${KEY}.txt`);
if (!keyCheck.ok || (await keyCheck.text()).trim() !== KEY) {
  throw new Error(`${SITE}/${KEY}.txt is not live yet; deploy the key file first.`);
}

const body = {
  host: new URL(SITE).host,
  key: KEY,
  keyLocation: `${SITE}/${KEY}.txt`,
  urlList,
};

// Exit codes are set, never forced with process.exit: on Windows a forced
// exit while fetch's sockets close trips a libuv assertion.
if (dryRun) {
  console.log(JSON.stringify(body, null, 2));
} else {
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });
  // 200 = accepted, 202 = accepted and the key is still being checked.
  console.log(`IndexNow answered ${res.status} for ${urlList.length} URLs`);
  if (res.status >= 300) {
    console.log(await res.text());
    process.exitCode = 1;
  }
}
