"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { birthdayConfig } from "@/content/birthday";
import { useExperience } from "@/lib/experience";
import { useRadio } from "@/lib/radio";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { readJSONExact, writeJSON } from "@/lib/storage";
import Chapter from "../ui/Chapter";
import WishCanvas from "../wish/WishCanvas";

const HOLD_MS = 1500;
const WISH_KEY = "elizabeth.wish.v1";

type Phase = "arrive" | "choose" | "writing" | "candle" | "done";

/**
 * MAKE A WISH.
 * The one chapter that asks for quiet. Nothing here is sent anywhere: a
 * written wish stays in the textarea unless she explicitly saves it to her own
 * device, and even then it never leaves the browser.
 */
export default function MakeAWish() {
  const [phase, setPhase] = useState<Phase>("arrive");
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [wish, setWish] = useState("");
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const [showAlternative, setShowAlternative] = useState(false);

  const holdStart = useRef(0);
  const rafRef = useRef(0);
  const flameRef = useRef<SVGGElement>(null);
  const finaleRef = useRef<HTMLDivElement>(null);
  const { cue } = useExperience();
  const { isPlaying, toggle } = useRadio();

  useEffect(() => {
    /* Hydrating from localStorage: the value cannot be read during render
       without breaking SSR, so this is the one sanctioned place for it. */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWish(readJSONExact<string>(WISH_KEY, ""));
  }, []);

  /* The flame breathes until it is blown out. */
  useEffect(() => {
    if (prefersReducedMotion() || !flameRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(flameRef.current, {
        scaleY: 1.14,
        scaleX: 0.94,
        transformOrigin: "bottom center",
        duration: 1.1,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });
    return () => ctx.revert();
  }, []);

  /* Someone who can't press and hold gets a plain button after a moment. */
  useEffect(() => {
    if (phase !== "candle") return;
    const t = window.setTimeout(() => setShowAlternative(true), 4000);
    return () => window.clearTimeout(t);
  }, [phase]);

  const finish = useCallback(() => {
    setHolding(false);
    setProgress(0);
    cancelAnimationFrame(rafRef.current);
    cue("blow");
    setPhase("done");

    if (prefersReducedMotion() || !finaleRef.current) return;
    gsap.fromTo(
      finaleRef.current.querySelectorAll(".wish-line"),
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.1, stagger: 0.14, delay: 0.6, ease: "power3.out" },
    );
  }, [cue]);

  const startHold = () => {
    if (phase !== "candle") return;
    setHolding(true);
    holdStart.current = performance.now();
    const tick = () => {
      const elapsed = performance.now() - holdStart.current;
      const p = Math.min(1, elapsed / HOLD_MS);
      setProgress(p);
      if (p >= 1) {
        finish();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const endHold = () => {
    if (!holding) return;
    cancelAnimationFrame(rafRef.current);
    if (progress >= 0.6) {
      finish();
    } else {
      setHolding(false);
      setProgress(0);
    }
  };

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const saveWish = () => {
    writeJSON(WISH_KEY, wish);
    setSavedNote("Kept on this device only. Nobody else can read it — not even me.");
    cue("click");
  };

  return (
    <Chapter id="wish" pad="none">
      <div className="relative flex min-h-[108svh] flex-col items-center justify-center overflow-hidden px-[var(--gutter)] py-[16vh] text-center">
        <WishCanvas holding={holding} released={phase === "done"} />

        <div className="relative w-full max-w-2xl">
          {/* --- arrival ------------------------------------------------- */}
          {phase === "arrive" ? (
            <div>
              <p className="quiet mt-10 text-[clamp(1.5rem,min(3.4vw,5vh),2.5rem)] leading-snug opacity-85">
                right, one more thing.
              </p>
              <button
                type="button"
                onClick={() => {
                  cue("click");
                  setPhase("choose");
                }}
                className="btn mt-12"
              >
                <span>go on then</span>
              </button>
            </div>
          ) : null}

          {/* --- the choice --------------------------------------------- */}
          {phase === "choose" ? (
            <div>
              <h2 className="display text-[clamp(2.25rem,7vw,5rem)] leading-[0.95]">
                Make a wish,
                <br />
                {birthdayConfig.displayName}.
              </h2>
              <p className="label mt-8 opacity-50">However you like</p>
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => {
                    cue("click");
                    setPhase("candle");
                  }}
                  className="btn"
                >
                  <span>Keep it secret</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    cue("click");
                    setPhase("writing");
                  }}
                  className="btn"
                >
                  <span>Write it down</span>
                </button>
              </div>

              {isPlaying ? (
                <button
                  type="button"
                  onClick={toggle}
                  className="label mt-10 h-11 cursor-pointer px-2 opacity-45 underline-offset-4 hover:underline hover:opacity-80"
                >
                  Pause the music for this bit
                </button>
              ) : null}
            </div>
          ) : null}

          {/* --- writing ------------------------------------------------- */}
          {phase === "writing" ? (
            <div className="text-left">
              <p className="label opacity-50">Nobody sees this but you</p>
              <label className="mt-6 block">
                <span className="sr-only-focusable">Your wish</span>
                <textarea
                  value={wish}
                  onChange={(e) => setWish(e.target.value)}
                  rows={6}
                  placeholder="This year, I want…"
                  className="field display w-full resize-none text-[clamp(1.25rem,2.4vw,1.75rem)] leading-relaxed"
                />
              </label>
              <p className="mt-4 text-sm opacity-55">
                Not sent anywhere. If you keep it, it is saved to this browser only.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" onClick={saveWish} className="btn">
                  <span>Keep it on this device</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    cue("click");
                    setPhase("candle");
                  }}
                  className="btn btn-solid"
                >
                  <span>To the candle</span>
                </button>
              </div>
              {savedNote ? (
                <p role="status" className="label mt-4 text-[var(--stage-accent)]">
                  {savedNote}
                </p>
              ) : null}
            </div>
          ) : null}

          {/* --- the candle --------------------------------------------- */}
          {phase === "candle" ? (
            <div>
              <svg
                viewBox="0 0 80 190"
                className="mx-auto h-[34vh] w-auto"
                aria-hidden
                style={{ filter: holding ? "brightness(1.18)" : undefined, transition: "filter 400ms" }}
              >
                <rect x="33" y="70" width="14" height="108" fill="#efe4cd" opacity="0.92" />
                <ellipse cx="40" cy="70" rx="7" ry="2.6" fill="#fff8e8" opacity="0.9" />
                <rect x="39.2" y="58" width="1.6" height="13" fill="#2a2a2a" />
                <g ref={flameRef}>
                  <ellipse cx="40" cy="44" rx="9" ry="17" fill="#ffb45e" opacity="0.5" />
                  <ellipse cx="40" cy="47" rx="5" ry="11" fill="#ffe3a8" />
                  <ellipse cx="40" cy="51" rx="2.4" ry="5" fill="#fffdf4" />
                </g>
              </svg>

              <button
                type="button"
                onPointerDown={startHold}
                onPointerUp={endHold}
                onPointerLeave={endHold}
                onPointerCancel={endHold}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    if (!holding) startHold();
                  }
                }}
                onKeyUp={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    endHold();
                  }
                }}
                className="btn relative mt-10 overflow-hidden touch-none"
              >
                <span>{holding ? "Keep holding…" : "Hold to make your wish"}</span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-[var(--stage-accent)]"
                  style={{ transform: `scaleX(${progress})` }}
                />
              </button>

              <p className="label mt-5 opacity-40">
                Press and hold — or hold the space bar
              </p>

              {showAlternative ? (
                <button
                  type="button"
                  onClick={finish}
                  className="label mt-6 h-11 cursor-pointer px-2 opacity-55 underline-offset-4 hover:underline"
                >
                  Or just make the wish
                </button>
              ) : null}
            </div>
          ) : null}

          {/* --- after -------------------------------------------------- */}
          {phase === "done" ? (
            <div ref={finaleRef}>
              <p className="wish-line label opacity-45">The wish is out</p>
              <h2 className="wish-line display mt-8 text-[clamp(1.75rem,min(5vw,7vh),3.5rem)] leading-[1.02]">
                that one&rsquo;s yours.
                <br />
                don&rsquo;t tell me.
              </h2>
              <p className="wish-line label mt-10 opacity-40">keep scrolling</p>
            </div>
          ) : null}
        </div>
      </div>
    </Chapter>
  );
}
