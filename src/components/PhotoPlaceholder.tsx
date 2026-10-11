import { cn } from "./cn";

/* The drawn stand-in for a photograph the house has not supplied yet
   (change round 10). A slot whose `src` is "" (images.ts, isPendingSlot) or
   an award document without an image draws this instead of handing an empty
   path to next/image. It is obviously not a photograph: ink line work on a
   flat ground (a trophy cup and a framed certificate on a shelf, the objects
   the cabinet's real photographs show), a chip that says "Photo coming soon",
   and the slot's `wanted` line as its caption. No <img>, no role="img": a
   screen reader meets the sentence, not a picture. It carries no motion of
   its own; it joins whatever mask wraps it (a hero's data-hero-clip, a
   section's data-sr="media"), so reduced motion is a no-op for free. Styles
   in src/app/placeholder.css; phone rules in mobile.css section 16. */

interface PhotoPlaceholderProps {
  /** CSS aspect the layout reserves, e.g. "3 / 2". Written as
   *  var(--m-frame-ratio, ratio) like ParallaxImage, so the phone layer's
   *  .m-ar-* hooks can retarget it. */
  ratio: string;
  /** `shelf` is the vignette alone; `corners` adds four mounting corners at
   *  the frame's edges, for a large frame. */
  motif?: "shelf" | "corners";
  /** The chip. Chrome, not copy. */
  label?: string;
  /** The slot's `wanted` line, printed under the frame. */
  wanted?: string;
  /** The sentence a screen reader meets (names the award, say). Defaults to
   *  the label, with the wanted line when no caption prints. */
  srText?: string;
  /** Phones: edge to edge (the generic .m-bleed rule). */
  mBleed?: boolean;
  className?: string;
}

export function PhotoPlaceholder({
  ratio,
  motif = "shelf",
  label = "Photo coming soon",
  wanted,
  srText,
  mBleed,
  className,
}: PhotoPlaceholderProps) {
  const spoken = srText ?? (wanted ? label : label);
  return (
    <figure className={cn("photo-ph", mBleed && "m-bleed", className)} data-placeholder="">
      <div className="photo-ph__frame" style={{ aspectRatio: `var(--m-frame-ratio, ${ratio})` }}>
        <svg
          className="photo-ph__art"
          viewBox="0 0 200 200"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          focusable="false"
        >
          {/* the shelf */}
          <path className="photo-ph__line" d="M24 152h152" />
          <path className="photo-ph__line photo-ph__line--soft" d="M30 158h140" />
          {/* the certificate, framed, standing behind to the right */}
          <rect className="photo-ph__line photo-ph__fill" x="118" y="84" width="52" height="68" />
          <rect className="photo-ph__line photo-ph__line--soft" x="124" y="90" width="40" height="56" />
          <path className="photo-ph__line photo-ph__line--soft" d="M130 104h28M130 112h22M130 120h26" />
          <circle className="photo-ph__seal" cx="156" cy="136" r="5" />
          {/* the cup */}
          <path className="photo-ph__line photo-ph__fill" d="M70 70h40v26c0 14-9 24-20 24S70 110 70 96z" />
          <path className="photo-ph__line photo-ph__line--soft" d="M70 78c-9 0-13 7-11 14s7 10 11 8" />
          <path className="photo-ph__line photo-ph__line--soft" d="M110 78c9 0 13 7 11 14s-7 10-11 8" />
          <path className="photo-ph__line" d="M90 120v14M78 134h24" />
          <rect className="photo-ph__line photo-ph__fill" x="74" y="142" width="32" height="10" />
        </svg>
        {motif === "corners" ? (
          <>
            <span aria-hidden="true" className="photo-ph__corner photo-ph__corner--tl" />
            <span aria-hidden="true" className="photo-ph__corner photo-ph__corner--tr" />
            <span aria-hidden="true" className="photo-ph__corner photo-ph__corner--bl" />
            <span aria-hidden="true" className="photo-ph__corner photo-ph__corner--br" />
          </>
        ) : null}
        <span className="photo-ph__tag" aria-hidden="true">
          {label}
        </span>
        <span className="sr-only">{spoken}</span>
      </div>
      {wanted ? <figcaption className="photo-ph__cap">{wanted}</figcaption> : null}
    </figure>
  );
}
