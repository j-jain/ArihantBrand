/** Minimal class-name joiner (no clsx dependency). */
export function cn(
  ...parts: Array<string | false | null | undefined>
): string {
  return parts.filter(Boolean).join(" ");
}

/** Monogram initials from the first two words of a name. Used by the quote
 *  avatars and by the leadership portrait placeholders. */
export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}
