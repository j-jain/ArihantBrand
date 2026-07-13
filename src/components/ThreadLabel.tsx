import type { CSSProperties, ReactNode } from "react";

interface ThreadLabelProps {
  children: ReactNode;
  /** Chevron mark colour; defaults to vermillion. Pass a unit-accent var
   *  on a unit page, e.g. "var(--unit-retail)". */
  accent?: string;
}

/** The single stitched fabric-label kicker. Used exactly once per page, in
 *  the hero — never as a per-section eyebrow. */
export function ThreadLabel({ children, accent }: ThreadLabelProps) {
  const style = accent
    ? ({ "--_thread-accent": accent } as CSSProperties)
    : undefined;

  return (
    <span className="thread-label" style={style}>
      <span className="thread-label__mark" aria-hidden="true">
        ▸
      </span>
      {children}
    </span>
  );
}
