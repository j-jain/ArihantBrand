import { StaggerGroup } from "@/components";

/** The objection-handling core of /partner. Each promise from the content
 *  layer uses the colon shape and is rendered as a two-part entry: a term
 *  lead-in and its owner clause. When the term itself is the owner word
 *  ("Yours" / "Ours") it is set in Besley italic vermillion. No copy is
 *  hardcoded here. The rows rise in on scroll via StaggerGroup. */

function PromiseEntry({ text }: { text: string }) {
  const colon = text.match(/^([^:]+):\s+(.+)$/);
  if (colon) {
    const [, term, rest] = colon;
    const isOwner = /^(ours|yours)$/i.test(term.trim());
    return (
      <div className="promise m-ledger-row flex flex-col gap-1 border-t border-line pt-4">
        <p
          className={
            isOwner ? "font-display italic text-vermillion-deep" : "t-body text-ink"
          }
          style={
            isOwner
              ? { fontStyle: "italic", fontSize: "1.3rem", lineHeight: 1.2 }
              : { fontWeight: 650 }
          }
        >
          {term}
        </p>
        <p className="t-body text-ink-soft">{rest}</p>
      </div>
    );
  }

  return (
    <div className="promise m-ledger-row flex flex-col gap-1 border-t border-line pt-4">
      <p className="t-body text-ink-soft">{text}</p>
    </div>
  );
}

export function PromiseList({ items }: { items: string[] }) {
  return (
    <StaggerGroup
      as="div"
      from="up"
      className="promise-list grid gap-x-10 gap-y-6 sm:grid-cols-2"
      stagger={0.08}
      mLedger
    >
      {items.map((text) => (
        <PromiseEntry key={text} text={text} />
      ))}
    </StaggerGroup>
  );
}
