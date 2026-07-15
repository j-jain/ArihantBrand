import type { CSSProperties } from "react";
import type { UnitKey } from "@/content/types";

/** Per-business accent identity (D6). Decorative only: CTAs stay
 *  --vermillion-deep sitewide. Tokens are defined in globals.css. */
export const UNIT_ACCENT: Record<
  UnitKey,
  { token: string; name: string; short: string }
> = {
  marketing: { token: "var(--unit-marketing)", name: "Arihant Marketing", short: "Marketing" },
  apparels: { token: "var(--unit-apparels)", name: "Arihant Apparels", short: "Apparels" },
  retail: { token: "var(--unit-retail)", name: "Arihant Retail", short: "Retail" },
};

/** Inline style that scopes a unit's accent onto an element. Descendants read
 *  var(--unit-accent) for lines/figures, var(--unit-accent-wash) for a 6%-alpha
 *  ground, and var(--unit-accent-line) for a hairline tint. */
export function unitScope(unit: UnitKey): CSSProperties {
  const accent = UNIT_ACCENT[unit].token;
  return {
    "--unit-accent": accent,
    "--unit-accent-wash": `color-mix(in oklch, ${accent}, transparent 94%)`,
    "--unit-accent-line": `color-mix(in oklch, ${accent}, transparent 80%)`,
  } as CSSProperties;
}
