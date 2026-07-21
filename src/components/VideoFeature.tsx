"use client";

import { useRef, useState, type CSSProperties } from "react";
import { cn } from "./cn";

interface VideoFeatureProps {
  /** MP4 source path (required — universal fallback). */
  mp4: string;
  /** Optional WebM source, offered first when present. */
  webm?: string;
  /** Poster image shown before play. */
  poster: string;
  /** Accessible label for the play control. */
  label?: string;
  /** CSS aspect-ratio for the frame. Defaults to 16 / 9. */
  ratio?: string;
  className?: string;
}

/** Click-to-play film frame. The poster is always visible and native controls
 *  appear on play, so nothing is hidden behind an animation and there is no
 *  autoplay (safe for reduced-motion and metered data). */
export function VideoFeature({
  mp4,
  webm,
  poster,
  label = "Play the film",
  ratio = "16 / 9",
  className,
}: VideoFeatureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const start = () => {
    const v = videoRef.current;
    if (!v) return;
    setPlaying(true);
    void v.play();
  };

  // Same var-with-desktop-fallback indirection as ParallaxImage, so the mobile
  // layer can reframe the player without an inline style fighting it.
  const frameStyle: CSSProperties = {
    aspectRatio: `var(--m-frame-ratio, ${ratio})`,
  };

  return (
    <div
      className={cn("video-feature", className)}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "10px",
        border: "1px solid var(--line)",
        background: "var(--charcoal)",
        ...frameStyle,
      }}
    >
      <video
        ref={videoRef}
        poster={poster}
        controls={playing}
        preload="none"
        playsInline
        onPause={() => videoRef.current?.ended && setPlaying(false)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      >
        {webm ? <source src={webm} type="video/webm" /> : null}
        <source src={mp4} type="video/mp4" />
      </video>

      {!playing ? (
        <button
          type="button"
          onClick={start}
          aria-label={label}
          className="group"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            background:
              "linear-gradient(180deg, color-mix(in oklch, var(--charcoal), transparent 78%), color-mix(in oklch, var(--charcoal), transparent 40%))",
          }}
        >
          <span
            aria-hidden="true"
            className="transition-transform group-hover:scale-105"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "clamp(3.5rem, 8vw, 5rem)",
              height: "clamp(3.5rem, 8vw, 5rem)",
              borderRadius: "9999px",
              background: "var(--vermillion-deep)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
            }}
          >
            <svg
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              style={{ marginLeft: "0.18rem" }}
            >
              <path d="M8 5.5v13l11-6.5-11-6.5Z" fill="#fff" />
            </svg>
          </span>
        </button>
      ) : null}
    </div>
  );
}
