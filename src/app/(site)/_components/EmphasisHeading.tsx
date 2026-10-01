import type { ComponentPropsWithoutRef, ElementType } from "react";

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
  /** Forwarded to the heading element (e.g. data-hero-title, style). */
  rest?: ComponentPropsWithoutRef<"h1"> & Record<`data-${string}`, string>;
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
        {text}
      </Tag>
    );
  }

  const before = text.slice(0, index);
  const after = text.slice(index + emphasis.length);

  return (
    <Tag className={cls} {...rest}>
      {before}
      <em style={{ fontStyle: "italic", color: emphasisColor }}>{emphasis}</em>
      {after}
    </Tag>
  );
}
