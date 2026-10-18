"use client";

import { useEffect, useRef, useState } from "react";
import { birthdayConfig } from "@/content/birthday";
import { letter } from "@/content/letter";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/* Critical assets only: the fonts and the two photographs that appear in the
 * first and last frames. Everything heavier loads later, on demand. */
const CRITICAL_IMAGES = [birthdayConfig.heroImage, letter.image];

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new window.Image();
    // A missing photograph resolves too — Plate renders a designed placeholder,
    // so a 404 must not hold the door shut.
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

/**
 * The loader reports real progress: one unit per settled critical asset plus
 * one for webfont readiness. The number is eased toward the true ratio, never
 * past it, and never driven by a timer.
 */
export default function Loader({ onDone }: { onDone: () => void }) {
  const [shown, setShown] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef(0);
  const doneRef = useRef(false);

  useEffect(() => {
    const total = CRITICAL_IMAGES.length + 1;
    let settled = 0;

    const bump = () => {
      settled += 1;
      targetRef.current = settled / total;
    };

    const fonts =
      typeof document !== "undefined" && "fonts" in document
        ? document.fonts.ready.then(() => undefined)
        : Promise.resolve();

    const work = [fonts.then(bump), ...CRITICAL_IMAGES.map((src) => preloadImage(src).then(bump))];

    /* The eased value lives in the loop, not in a ref written during render. */
    let eased = 0;
    let raf = 0;
    const tick = () => {
      eased += (targetRef.current - eased) * 0.12;
      if (eased > 0.999) eased = 1;
      setShown(eased);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    Promise.all(work).then(() => {
      // Hold only until the counter has visibly caught up with the truth.
      const finish = () => {
        if (doneRef.current) return;
        doneRef.current = true;
        cancelAnimationFrame(raf);
        setShown(1);
        if (prefersReducedMotion() || !rootRef.current) {
          onDone();
          return;
        }
        gsap.to(rootRef.current, {
          opacity: 0,
          duration: 0.5,
          ease: "power2.inOut",
          onComplete: onDone,
        });
      };
      const wait = () => {
        if (targetRef.current >= 1 && eased > 0.985) finish();
        else requestAnimationFrame(wait);
      };
      requestAnimationFrame(wait);
    });

    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const percent = Math.round(shown * 100);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[80] flex flex-col justify-between bg-night px-[var(--gutter)] py-[max(1.5rem,env(safe-area-inset-top))] text-softwhite"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start justify-between">
        <p className="label opacity-70">
          {birthdayConfig.displayName}
          <br />
          <span className="opacity-60">{birthdayConfig.universeName}</span>
        </p>
        <p className="label opacity-50">{birthdayConfig.volume}</p>
      </div>

      <div className="mx-auto max-w-3xl text-center">
        <h1
          className="display leading-[1.04]"
          style={{ fontSize: "clamp(1.75rem, min(6vw, 8vh), 4.5rem)" }}
        >
          building something
          <br />
          <em className="quiet text-lavender">slightly over the top.</em>
        </h1>
        <p className="label mt-8 text-lavender">for {birthdayConfig.displayName}.</p>
      </div>

      <div>
        <div className="flex items-end justify-between gap-6">
          <p className="label opacity-60">loading her universe…</p>
          <p className="display text-[clamp(2.5rem,7vw,5.5rem)] leading-none tabular-nums">
            {String(percent).padStart(3, "0")}
            <span className="label ml-1 align-super opacity-50">%</span>
          </p>
        </div>
        <div className="mt-4 h-[2px] w-full bg-current/15" aria-hidden>
          <div
            className="h-full bg-violet"
            style={{ width: `${percent}%`, transition: "width 120ms linear" }}
          />
        </div>
      </div>
    </div>
  );
}
