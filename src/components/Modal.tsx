"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { cn } from "./cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** id of the element that titles the dialog (for aria-labelledby). */
  labelledBy?: string;
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
        gsap.fromTo(
          dialog,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.2, ease: "power2.out" },
        );
        gsap.fromTo(
          panel,
          { autoAlpha: 0, y: 26, scale: 0.985 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.42, ease: "power3.out" },
        );
      }
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
          autoAlpha: 0,
          y: 16,
          scale: 0.99,
          duration: 0.2,
          ease: "power2.in",
        });
        gsap.to(dialog, {
          autoAlpha: 0,
          duration: 0.24,
          ease: "power2.in",
          onComplete: finish,
        });
      }
    }
  }, [open, reduce]);

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
