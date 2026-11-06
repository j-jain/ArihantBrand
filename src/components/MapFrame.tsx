"use client";

import { useEffect, useRef, useState } from "react";
import { whenIdle, whenNear } from "@/lib/offscreen";

interface MapFrameProps {
  src: string;
  title: string;
  /** The box: it keeps its size from CSS, frame or no frame. */
  className?: string;
  frameClassName?: string;
}

/** The footer's live Google Map (change round 7), mounted only once the
 *  footer is about to come on screen and the browser is idle (performance
 *  pass, the user's call). The frame's own `loading="lazy"` started it
 *  1,250-2,500px early, so Google's map app loaded while the reader was still
 *  mid-page. The box is sized in CSS (.footer-office__map), so nothing moves
 *  when the frame arrives; without JavaScript the noscript copy loads as
 *  before. */
export function MapFrame({ src, title, className, frameClassName }: MapFrameProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelIdle = () => {};
    const cancelNear = whenNear(
      el,
      () => {
        cancelIdle = whenIdle(() => setMounted(true), { timeout: 1500 });
      },
      { margin: "0px 0px 600px 0px" },
    );
    return () => {
      cancelNear();
      cancelIdle();
    };
  }, []);

  const frame = (
    <iframe
      className={frameClassName}
      src={src}
      title={title}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  );

  return (
    <div ref={ref} className={className}>
      {mounted ? frame : <noscript>{frame}</noscript>}
    </div>
  );
}
