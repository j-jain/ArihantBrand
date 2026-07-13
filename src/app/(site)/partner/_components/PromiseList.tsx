import type { ReactNode } from "react";

/** The objection-handling core of /partner. Each promise from the content
 *  layer is rendered as a definition entry: a bolded responsibility lead-in
 *  and the owner clause, with the "ours" / "yours" word set in Besley italic
 *  vermillion. Two shapes appear in the data and both are parsed generically
 *  (no copy is hardcoded here):
 *    A) "<lead-in> — ours."          → assignment shape
 *    B) "<Term>: <description>."      → colon shape (incl. the final "Yours:")
 */

const OWNER_RE = /\b(ours|yours)\b/i;

/** Wrap the first standalone "ours"/"yours" in Besley italic vermillion. */
function withOwnerEmphasis(text: string): ReactNode {
  const match = text.match(OWNER_RE);
  if (!match || match.index === undefined) return text;
  const before = text.slice(0, match.index);
  const word = match[0];
  const after = text.slice(match.index + word.length);
  return (
    <>
      {before}
      <em className="font-display italic text-vermillion-deep" style={{ fontStyle: "italic" }}>
        {word}
      </em>
      {after}
    </>
  );
}

function PromiseEntry({ text }: { text: string }) {
  const dash = text.match(/^(.+?)\s+—\s+(.+)$/);
  if (dash) {
    const [, lead, owner] = dash;
    return (
      <div className="flex flex-col gap-1 border-t border-line pt-4">
        <dt className="t-body text-ink" style={{ fontWeight: 650 }}>
          {lead}
        </dt>
        <dd className="t-body text-ink-soft">— {withOwnerEmphasis(owner)}</dd>
      </div>
    );
  }

  const colon = text.match(/^([^:]+):\s+(.+)$/);
  if (colon) {
    const [, term, rest] = colon;
    const isOwner = /^(ours|yours)$/i.test(term.trim());
    return (
      <div className="flex flex-col gap-1 border-t border-line pt-4">
        <dt
          className={
            isOwner
              ? "font-display italic text-vermillion-deep"
              : "t-body text-ink"
          }
          style={isOwner ? { fontStyle: "italic", fontSize: "1.3rem", lineHeight: 1.2 } : { fontWeight: 650 }}
        >
          {term}
        </dt>
        <dd className="t-body text-ink-soft">{rest}</dd>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 border-t border-line pt-4">
      <dd className="t-body text-ink-soft">{withOwnerEmphasis(text)}</dd>
    </div>
  );
}

export function PromiseList({ items }: { items: string[] }) {
  return (
    <dl className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
      {items.map((text) => (
        <PromiseEntry key={text} text={text} />
      ))}
    </dl>
  );
}
