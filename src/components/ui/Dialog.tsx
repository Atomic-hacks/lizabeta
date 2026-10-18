"use client";

import { useEffect, useEffectEvent, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useSmoothScroll } from "@/lib/useSmoothScroll";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Hide the visible title but keep it for screen readers. */
  hideTitle?: boolean;
  children: ReactNode;
  /** "panel" slides from the right on desktop; "sheet" rises from the bottom. */
  variant?: "panel" | "sheet" | "full";
  className?: string;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * One dialog implementation for the whole site: focus trap, Escape, restored
 * focus, locked background scroll, aria-modal. Every studio and memory panel
 * uses it so accessibility isn't re-invented five times.
 */
export default function Dialog({
  open,
  onClose,
  title,
  hideTitle = false,
  children,
  variant = "panel",
  className = "",
}: DialogProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const { stop, start } = useSmoothScroll();
  const close = useEffectEvent(onClose);

  useEffect(() => {
    if (!open) return;

    previousFocus.current = document.activeElement as HTMLElement;
    stop();

    const surface = surfaceRef.current;
    const first = surface?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? surface)?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !surface) return;

      const items = Array.from(surface.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (items.length === 0) return;
      const firstItem = items[0];
      const lastItem = items[items.length - 1];

      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault();
        firstItem.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);

    let ctx: gsap.Context | undefined;
    if (!prefersReducedMotion() && surface) {
      ctx = gsap.context(() => {
        gsap.fromTo(
          surface,
          {
            opacity: 0,
            y: variant === "sheet" ? 48 : 0,
            x: variant === "panel" ? 48 : 0,
            scale: variant === "full" ? 0.985 : 1,
          },
          { opacity: 1, y: 0, x: 0, scale: 1, duration: 0.5, ease: "power3.out" },
        );
      }, surface);
    }

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      ctx?.revert();
      start();
      previousFocus.current?.focus?.();
    };
  }, [open, start, stop, variant]);

  if (!open) return null;

  const surfaceClass =
    variant === "sheet"
      ? "mt-auto w-full max-h-[92dvh] md:mt-0 md:max-w-xl md:self-center"
      : variant === "full"
        ? "h-[100dvh] w-full"
        : "ml-auto h-[100dvh] w-full md:max-w-xl";

  return (
    <div
      className="fixed inset-0 z-50 flex"
      role="presentation"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-black/55" />
      <div
        ref={surfaceRef}
        data-lenis-prevent
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative z-10 overflow-y-auto overscroll-contain bg-[var(--stage-bg)] text-[var(--stage-fg)] ${surfaceClass} ${className}`}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div
          className={`sticky top-0 z-20 flex items-start gap-4 bg-[var(--stage-bg)] px-[clamp(1.25rem,3vw,2.5rem)] py-5 ${
            hideTitle ? "justify-end" : "justify-between"
          }`}
        >
          <h2
            id={titleId}
            className={hideTitle ? "sr-only-focusable" : "label pt-2 opacity-70"}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center border border-current/25 transition-colors duration-200 hover:bg-current/10"
          >
            <X size={16} strokeWidth={1.5} aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
