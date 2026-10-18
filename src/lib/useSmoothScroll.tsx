"use client";

import Lenis from "lenis";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "./gsap";

type ScrollTarget = string | number | HTMLElement;

type SmoothScrollValue = {
  scrollTo: (target: ScrollTarget, options?: { offset?: number; immediate?: boolean }) => void;
  stop: () => void;
  start: () => void;
};

const SmoothScrollContext = createContext<SmoothScrollValue>({
  scrollTo: () => {},
  stop: () => {},
  start: () => {},
});

/**
 * One Lenis instance, driven by the single GSAP ticker, feeding ScrollTrigger.
 * No second animation loop anywhere in the app.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Reduced motion: hand scrolling back to the browser entirely.
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      // Lenis handles in-page #links itself, so a stray plain anchor can't
      // native-jump and leave ScrollTrigger reading a stale position.
      anchors: { offset: -8 },
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Touch devices keep their native momentum — smoothing it feels broken.
      syncTouch: false,
      touchMultiplier: 1.6,
      wheelMultiplier: 0.9,
    });
    lenisRef.current = lenis;

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollTo = useCallback<SmoothScrollValue["scrollTo"]>((target, options) => {
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, {
        offset: options?.offset ?? 0,
        duration: options?.immediate ? 0 : 1.4,
        immediate: options?.immediate,
        lock: true,
      });
      return;
    }
    // No Lenis (reduced motion): native scrolling, honouring the same offset.
    if (typeof target === "number") {
      window.scrollTo({ top: target, behavior: "auto" });
      return;
    }
    const el =
      typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY + (options?.offset ?? 0);
    window.scrollTo({ top, behavior: "auto" });
  }, []);

  const stop = useCallback(() => {
    lenisRef.current?.stop();
    document.body.dataset.locked = "true";
  }, []);

  const start = useCallback(() => {
    lenisRef.current?.start();
    document.body.dataset.locked = "false";
  }, []);

  return (
    <SmoothScrollContext.Provider value={{ scrollTo, stop, start }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

export const useSmoothScroll = () => useContext(SmoothScrollContext);
