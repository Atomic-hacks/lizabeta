"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";

/* Registered once, at module scope, so no component has to think about it. */
let registered = false;

if (typeof window !== "undefined" && !registered) {
  gsap.registerPlugin(ScrollTrigger, SplitText, Flip);
  gsap.defaults({ ease: "power3.out", duration: 0.9 });
  /* No limitCallbacks: it lets a fast fling skip onEnter, which would leave
     a Reveal stuck at opacity 0 — content silently missing is far worse than
     a few extra callbacks. ignoreMobileResize stops the mobile address bar
     showing/hiding from forcing a full refresh mid-scroll. */
  ScrollTrigger.config({ ignoreMobileResize: true });
  registered = true;
}

export { gsap, ScrollTrigger, SplitText, Flip };

/** True when the visitor has asked for less motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Splits a heading into masked lines and returns a timeline-ready target.
 * Falls back to the element itself if SplitText can't run.
 */
export function splitLines(el: HTMLElement): { targets: Element[]; revert: () => void } {
  try {
    const split = new SplitText(el, {
      type: "lines",
      linesClass: "split-line",
      mask: "lines",
    });
    return { targets: split.lines, revert: () => split.revert() };
  } catch {
    return { targets: [el], revert: () => {} };
  }
}
