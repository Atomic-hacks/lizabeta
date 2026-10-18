"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion, splitLines } from "@/lib/gsap";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** "lines" masks and lifts each line; "block" lifts the whole element. */
  mode?: "lines" | "block";
  delay?: number;
  stagger?: number;
  /** Where the trigger fires, as a ScrollTrigger start string. */
  start?: string;
};

/**
 * The house reveal. One animated element per view, masked and lifted — never
 * per-word jitter. Under reduced motion it renders statically with no trigger.
 */
export default function Reveal({
  children,
  as: Tag = "div",
  className = "",
  mode = "block",
  delay = 0,
  stagger = 0.08,
  start = "top 82%",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let revert = () => {};
    const ctx = gsap.context(() => {
      const targets = mode === "lines" ? (() => {
        const split = splitLines(el);
        revert = split.revert;
        return split.targets;
      })() : [el];

      gsap.set(targets, { yPercent: mode === "lines" ? 110 : 0, y: mode === "lines" ? 0 : 28, opacity: mode === "lines" ? 1 : 0 });
      el.dataset.anim = "ready";

      gsap.to(targets, {
        yPercent: 0,
        y: 0,
        opacity: 1,
        duration: mode === "lines" ? 1.05 : 0.85,
        ease: "power3.out",
        stagger,
        delay,
        scrollTrigger: { trigger: el, start, once: true },
      });
    }, el);

    return () => {
      ctx.revert();
      revert();
      ScrollTrigger.refresh();
    };
  }, [delay, mode, stagger, start]);

  return (
    <Tag ref={ref} className={className} data-anim="pending">
      {children}
    </Tag>
  );
}
