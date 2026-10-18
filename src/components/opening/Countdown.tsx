"use client";

import { useEffect, useRef, useState } from "react";
import { birthdayConfig } from "@/content/birthday";
import { useExperience } from "@/lib/experience";
import { gsap, SplitText } from "@/lib/gsap";

/**
 * Three beats, then the shout. The sequence hands off to the cover by fading
 * its own ground away — the hero is already mounted underneath, so nothing
 * snaps. Skippable at any moment; static under reduced motion.
 */
export default function Countdown({ onDone }: { onDone: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLDivElement>(null);
  const finaleRef = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const [beat, setBeat] = useState("01");
  const { cue, reducedMotion } = useExperience();

  useEffect(() => {
    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: onDone });
      timeline.current = tl;

      const beats = ["01", "02", "03"];
      beats.forEach((value, i) => {
        tl.call(() => {
          setBeat(value);
          cue("tick");
        });
        tl.fromTo(
          numberRef.current,
          { scale: 0.82, opacity: 0, filter: "blur(14px)" },
          { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.52, ease: "power4.out" },
        );
        tl.to(
          numberRef.current,
          { scale: 1.08, opacity: 0, filter: "blur(10px)", duration: 0.42, ease: "power2.in" },
          "+=0.26",
        );
        // The ground warms one step per beat: black to ivory.
        tl.to(
          rootRef.current,
          {
            backgroundColor: ["#08060f", "#2a0f47", "#5b1f93"][i],
            color: "#f5f1ff",
            duration: 0.6,
          },
          "<",
        );
      });

      // The shout.
      tl.set(numberRef.current, { display: "none" });
      tl.set(finaleRef.current, { visibility: "visible" });
      tl.call(() => cue("chime"));

      const split = new SplitText(".countdown-finale-line", { type: "chars", mask: "chars" });
      tl.from(split.chars, {
        yPercent: 120,
        rotate: 5,
        duration: 0.72,
        ease: "power4.out",
        stagger: { each: 0.022, from: "start" },
      });
      tl.from(
        ".countdown-finale-rule",
        { scaleX: 0, transformOrigin: "left center", duration: 0.9, ease: "power3.inOut" },
        "<0.2",
      );
      tl.to(".countdown-finale-line", { letterSpacing: "-0.04em", duration: 1.2 }, "<");

      // Hand off: the sheet lifts, the cover is already behind it.
      tl.to(rootRef.current, { opacity: 0, duration: 0.7, ease: "power2.inOut" }, "+=0.85");
    }, rootRef);

    return () => {
      ctx.revert();
      timeline.current = null;
    };
  }, [cue, onDone, reducedMotion]);

  const skip = () => {
    timeline.current?.progress(1).kill();
    onDone();
  };

  if (reducedMotion) {
    return (
      <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-8 bg-night px-[var(--gutter)] text-center text-softwhite">
        <p className="label text-lavender">{birthdayConfig.universeName}</p>
        <h1 className="display-tight text-[clamp(3rem,13vw,10rem)]">
          happy birthday
          <br />
          {birthdayConfig.displayName}.
        </h1>
        <button type="button" onClick={onDone} className="btn">
          <span>come in</span>
        </button>
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-night px-[var(--gutter)] text-softwhite"
    >
      <div ref={numberRef} className="display-tight text-mega tabular-nums" aria-hidden>
        {beat}
      </div>

      <div
        ref={finaleRef}
        className="absolute inset-x-[var(--gutter)] text-center"
        style={{ visibility: "hidden" }}
      >
        <h1 className="display-tight text-[clamp(3.25rem,15vw,13rem)]">
          <span className="countdown-finale-line block">HAPPY</span>
          <span className="countdown-finale-line block">BIRTHDAY</span>
          <span className="countdown-finale-line block text-lavender">
            {birthdayConfig.displayName.toUpperCase()}!
          </span>
        </h1>
        <div className="countdown-finale-rule mx-auto mt-6 h-[1px] w-[min(28rem,70vw)] bg-current opacity-40" />
        {/* The nickname gets exactly one line, in the loudest moment there is. */}
        <p className="countdown-finale-line quiet mt-5 text-[clamp(1.1rem,2.6vw,1.9rem)] opacity-80">
          (and happy birthday, {birthdayConfig.nickname})
        </p>
      </div>

      <p aria-live="polite" className="sr-only-focusable">
        Happy birthday {birthdayConfig.displayName}
      </p>

      <button
        type="button"
        onClick={skip}
        className="label absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-[var(--gutter)] h-11 cursor-pointer px-2 opacity-60 transition-opacity hover:opacity-100"
      >
        Skip
      </button>
    </div>
  );
}
