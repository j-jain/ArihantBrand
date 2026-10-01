"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { gsap } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { cn } from "./cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** id of the element that titles the dialog (for aria-labelledby). */
  labelledBy?: string;
  /** id of the element that describes the dialog (for aria-describedby).
   *  Used where the panel carries a disclosure a reader must hear on open. */
  describedBy?: string;
  /** Element to focus when the dialog opens, instead of the browser default.
   *  Modal owns this rather than the caller because Modal owns the entrance
   *  tween, and the two have to agree: a caller focusing on its own could not
   *  know that the panel spends its first frame hidden. Applied synchronously
   *  with `showModal()`, so it does not depend on the animation running. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  children: ReactNode;
  className?: string;
}

/** Accessible modal on the native <dialog> element: top-layer rendering, focus
 *  containment and focus-return to the invoker come free from showModal(). We
 *  add body scroll-lock, backdrop-click and Escape handling (routed through
 *  onClose so the exit can animate), and a GSAP entrance that respects reduced
 *  motion. Panel styling lives in globals `.modal`. */
export function Modal({
  open,
  onClose,
  labelledBy,
  describedBy,
  initialFocusRef,
  children,
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();

  // Drive the native dialog imperatively so open/close can animate.
  useEffect(() => {
    const dialog = dialogRef.current;
    const panel = panelRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      const previousOverflow = document.body.style.overflow;
      const previousPad = document.body.style.paddingRight;
      const scrollbar =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
      dialog.dataset.prevOverflow = previousOverflow;
      dialog.dataset.prevPad = previousPad;

      dialog.showModal();
      gsap.killTweensOf([dialog, panel]);
      if (reduce) {
        gsap.set([dialog, panel], { clearProps: "opacity,visibility,transform" });
      } else {
        // Opacity, not autoAlpha, on the way in. autoAlpha's `visibility:
        // hidden` at progress 0 makes the panel unfocusable for the first
        // frame, which silently drops the focus call below and lets the
        // browser fall back to focusing `.modal__panel` (Chrome treats it as
        // focusable because it scrolls). Nothing needs visibility here:
        // `.modal:not([open])` is already `display: none`.
        gsap.fromTo(
          dialog,
          { opacity: 0 },
          { opacity: 1, duration: 0.2, ease: "power2.out" },
        );
        gsap.fromTo(
          panel,
          { opacity: 0, y: 26, scale: 0.985 },
          { opacity: 1, y: 0, scale: 1, duration: 0.42, ease: "power3.out" },
        );
      }
      // Synchronously, and deliberately not from a tween callback: a tab that
      // is not receiving animation frames still has to put focus in the right
      // place. Tying this to onComplete made focus depend on the ticker.
      initialFocusRef?.current?.focus();
    } else if (!open && dialog.open) {
      const finish = () => {
        dialog.close();
        document.body.style.overflow = dialog.dataset.prevOverflow ?? "";
        document.body.style.paddingRight = dialog.dataset.prevPad ?? "";
      };
      gsap.killTweensOf([dialog, panel]);
      if (reduce) {
        finish();
      } else {
        gsap.to(panel, {
          opacity: 0,
          y: 16,
          scale: 0.99,
          duration: 0.2,
          ease: "power2.in",
        });
        gsap.to(dialog, {
          opacity: 0,
          duration: 0.24,
          ease: "power2.in",
          onComplete: finish,
        });
      }
    }
  }, [open, reduce, initialFocusRef]);

  // Escape (native 'cancel') and backdrop clicks route through onClose so the
  // exit animation runs instead of the browser closing the dialog instantly.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };
    const onClick = (event: MouseEvent) => {
      if (event.target === dialog) onClose();
    };
    dialog.addEventListener("cancel", onCancel);
    dialog.addEventListener("click", onClick);
    return () => {
      dialog.removeEventListener("cancel", onCancel);
      dialog.removeEventListener("click", onClick);
    };
  }, [onClose]);

  // Restore scroll if unmounted while open.
  useEffect(
    () => () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    },
    [],
  );

  return (
    <dialog
      ref={dialogRef}
      className={cn("modal", className)}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
    >
      <div ref={panelRef} className="modal__panel">
        <button
          type="button"
          className="modal__close"
          aria-label="Close"
          onClick={onClose}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M5 5l10 10M15 5L5 15"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
        {children}
      </div>
    </dialog>
  );
}
