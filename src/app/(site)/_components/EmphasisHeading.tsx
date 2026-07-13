import type { ElementType } from "react";

interface EmphasisHeadingProps {
  /** Full heading text. */
  text: string;
  /** Substring to set in Besley italic + accent colour. If absent or not
   *  found in `text`, the heading renders plain. */
  emphasis?: string;
  as?: ElementType;
  className?: string;
  /** Colour of the emphasised word. Defaults to the paper-safe deep vermillion
   *  (large display text clears contrast against paper). */
  emphasisColor?: string;
}

/** Splits a heading on its emphasis substring and wraps that word in an
 *  italic Besley `<em>` tinted with the brand accent — the one-word display
 *  emphasis the type system calls for, without italicising the whole line. */
export function EmphasisHeading({
  text,
  emphasis,
  as: Tag = "h1",
  className,
  emphasisColor = "var(--vermillion-deep)",
}: EmphasisHeadingProps) {
  const index = emphasis ? text.indexOf(emphasis) : -1;

  if (!emphasis || index === -1) {
    return <Tag className={className}>{text}</Tag>;
  }

  const before = text.slice(0, index);
  const after = text.slice(index + emphasis.length);

  return (
    <Tag className={className}>
      {before}
      <em style={{ fontStyle: "italic", color: emphasisColor }}>{emphasis}</em>
      {after}
    </Tag>
  );
}
