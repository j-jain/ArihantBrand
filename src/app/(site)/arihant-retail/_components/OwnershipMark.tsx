export type Ownership = "company" | "franchisee";

interface OwnershipMarkProps {
  own: Ownership;
  className?: string;
}

/**
 * The store atlas's ownership mark: solid for company-owned, framed for
 * franchisee-owned. The same encoding runs through the map pins (purple), the
 * swing tags (ink) and the key and list marks (this component, purple via
 * currentColor). It is never the only cue: every mark sits beside a text label,
 * so it is hidden from assistive tech. Size it with CSS.
 */
export function OwnershipMark({ own, className }: OwnershipMarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 12 12"
      width="12"
      height="12"
      aria-hidden="true"
      focusable="false"
    >
      {own === "company" ? (
        <rect x="0" y="0" width="12" height="12" fill="currentColor" />
      ) : (
        <rect
          x="1"
          y="1"
          width="10"
          height="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      )}
    </svg>
  );
}
