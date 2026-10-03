import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

/** Hyphenated words ("zero-deadstock") set as one unbreakable unit (change
 *  round 5). A browser may break plain text after a hyphen, but SplitHeading's
 *  word split cannot, so the same heading wrapped one way before the split,
 *  another while it ran and the first way again once it reverted: the line
 *  visibly jumped. With the nowrap span both states wrap identically. */
const HYPHENATED = /(\S+-\S+)/;

function keepHyphens(text: string): ReactNode {
  if (!HYPHENATED.test(text)) return text;
  return text.split(HYPHENATED).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="nobr">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

interface EmphasisHeadingProps {
  /** Full heading text. */
  text: string;
  /** Substring to set in the accent colour (upright). If absent or not found
   *  in `text`, the heading renders plain. */
  emphasis?: string;
  as?: ElementType;
  className?: string;
  /** Colour of the emphasised word. Defaults to the paper-safe deep vermillion
   *  (large display text clears contrast against paper). */
  emphasisColor?: string;
  /** Forwarded to the heading element (e.g. data-hero-title, style). */
  rest?: ComponentPropsWithoutRef<"h1"> & Record<`data-${string}`, string>;
}

/** Splits a heading on its emphasis substring and wraps it in an `<em>` tinted
 *  with the brand accent. Upright, not italic (change round 3, sitewide): the
 *  colour carries the emphasis. `fontStyle: "normal"` is explicit because a
 *  browser sets `em` in italics by default and the reset does not undo it. */
export function EmphasisHeading({
  text,
  emphasis,
  as: Tag = "h1",
  className,
  emphasisColor = "var(--vermillion-deep)",
  rest,
}: EmphasisHeadingProps) {
  const index = emphasis ? text.indexOf(emphasis) : -1;
  // A display headline written as a full sentence (the Apparels tagline runs
  // about a hundred characters) steps down a size, so it sets in three or four
  // lines instead of five or six. The words are untouched; only the scale moves.
  const cls =
    className?.includes("t-display") && text.length > 80
      ? `${className} t-display--long`
      : className;

  if (!emphasis || index === -1) {
    return (
      <Tag className={cls} {...rest}>
        {keepHyphens(text)}
      </Tag>
    );
  }

  const before = text.slice(0, index);
  const after = text.slice(index + emphasis.length);

  return (
    <Tag className={cls} {...rest}>
      {keepHyphens(before)}
      <em style={{ fontStyle: "normal", color: emphasisColor }}>{keepHyphens(emphasis)}</em>
      {keepHyphens(after)}
    </Tag>
  );
}
