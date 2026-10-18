"use client";

import { useEffect, useRef, useState } from "react";
import { BirthdaySeal } from "../art/BirthdayArt";
import { awards, type Award } from "@/content/awards";
import { useExperience } from "@/lib/experience";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import Chapter from "../ui/Chapter";
import Reveal from "../ui/Reveal";
import Confetti from "../ui/Confetti";
import Egg from "../ui/Egg";

/**
 * THE DRAGON AWARDS.
 * Black room, metal type, one spotlight. Each form reveals differently — a
 * plaque hinges, a certificate unrolls, a statuette rises into light — and the
 * final award is staged alone, at full width.
 *
 * Both faces of a card stay mounted and stacked. Opacity is driven by CSS off
 * `data-open`, GSAP only animates transforms: that way the reveal can't
 * animate an element React has already swapped out, and it still works with
 * reduced motion (or if GSAP never runs at all).
 */
export default function Awards() {
  const [revealed, setRevealed] = useState<string[]>([]);
  const [bursts, setBursts] = useState(0);
  const { cue } = useExperience();

  const finale = awards[awards.length - 1];
  const rest = awards.slice(0, -1);

  const reveal = (award: Award) => {
    if (revealed.includes(award.id)) return;
    setRevealed((prev) => [...prev, award.id]);
    cue("reveal");
    if (award.confetti) setBursts((b) => b + 1);
  };

  return (
    <Chapter id="awards">
      <div className="gutter">
        <Reveal
          as="h2"
          mode="lines"
          className="display mt-5 text-[clamp(2.25rem,6.4vw,5.5rem)] leading-[0.96]"
        >
          The annual
          <br />
          Elizabeth Awards.
        </Reveal>
        <p className="label mt-6 max-w-[42ch] opacity-55">
          Excellence in being absolutely ridiculous. Envelopes are sealed — open them yourself.
        </p>

        <div aria-hidden className="hairline-gold mt-[8vh]" />

        <ul className="mt-[6vh] grid gap-[clamp(1.5rem,3vw,2.5rem)] md:grid-cols-2">
          {rest.map((award, i) => (
            <AwardCard
              key={award.id}
              award={award}
              index={i + 1}
              open={revealed.includes(award.id)}
              onReveal={reveal}
            />
          ))}
        </ul>

        {/* The last one gets the room to itself. */}
        <div className="relative mt-[14vh]">
          <p className="label mb-6 text-center opacity-50">And finally</p>
          <AwardCard
            award={finale}
            index={awards.length}
            open={revealed.includes(finale.id)}
            onReveal={reveal}
            grand
          />
          <Confetti fire={bursts} className="z-10" />
        </div>

        <div className="mt-10 flex items-center justify-between">
          <p className="label opacity-40" aria-live="polite">
            {revealed.length} / {awards.length} opened
          </p>
          {/* Egg 04: under the podium. */}
          <Egg id="egg-4" />
        </div>
      </div>
    </Chapter>
  );
}

function AwardCard({
  award,
  index,
  open,
  onReveal,
  grand = false,
}: {
  award: Award;
  index: number;
  open: boolean;
  onReveal: (award: Award) => void;
  grand?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const Tag = (grand ? "div" : "li") as "div";

  /* Runs after React has committed both faces, so nothing is ever null. */
  useEffect(() => {
    if (!open || prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;

    const face = el.querySelector(".award-face");
    const body = el.querySelector(".award-body");
    const spot = el.querySelector(".award-spot");
    if (!face || !body) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      if (award.form === "plaque") {
        // Hinged: the face falls forward from its top edge.
        tl.to(face, { rotateX: -92, duration: 0.55, ease: "power3.in", transformOrigin: "top center" })
          .fromTo(body, { rotateX: 80 }, { rotateX: 0, duration: 0.75, ease: "power3.out" }, "-=0.2");
      } else if (award.form === "certificate") {
        // Unrolled from the top.
        tl.to(face, { yPercent: -6, duration: 0.3, ease: "power2.in" }).fromTo(
          body,
          { scaleY: 0.06, transformOrigin: "center top" },
          { scaleY: 1, duration: 0.9, ease: "power4.out" },
          "-=0.05",
        );
      } else {
        // Raised into a spotlight.
        tl.to(face, { scale: 1.08, duration: 0.4, ease: "power2.in" })
          .fromTo(body, { y: 40, scale: 0.96 }, { y: 0, scale: 1, duration: 1.1, ease: "power4.out" }, "-=0.15");
        if (spot) {
          tl.fromTo(spot, { scaleX: 0.3, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 1.3, ease: "power2.out" }, "<");
        }
      }
    }, el);

    return () => ctx.revert();
  }, [open, award.form]);

  return (
    <Tag ref={ref} className={grand ? "relative" : ""}>
      <button
        type="button"
        onClick={() => onReveal(award)}
        disabled={open}
        aria-expanded={open}
        className={`relative grid w-full overflow-hidden border border-current/25 text-left ${
          open ? "cursor-default" : "cursor-pointer"
        } ${
          grand
            ? "px-[clamp(1.5rem,4vw,4rem)] py-[clamp(2.5rem,7vh,5rem)]"
            : "px-[clamp(1.25rem,2vw,2rem)] py-[clamp(1.75rem,4vh,2.75rem)]"
        }`}
        style={{ perspective: 900 }}
      >
        {/* Sealed face */}
        <span
          className="award-face block [grid-area:1/1]"
          data-open={open}
          aria-hidden={open}
        >
          <BirthdaySeal className="award-seal" />
          <span className="label block opacity-50">
            Category {String(index).padStart(2, "0")}
          </span>
          <span
            className={`metal-type display mt-4 block ${
              grand ? "text-[clamp(1.75rem,5vw,4rem)]" : "text-[clamp(1.35rem,2.4vw,2.25rem)]"
            } leading-[1.02]`}
          >
            {award.category}
          </span>
          <span className="label mt-6 inline-flex items-center gap-2 opacity-60">
            <span className="h-[1px] w-8 bg-current" aria-hidden />
            Open the envelope
          </span>
        </span>

        {/* Winner */}
        <span className="award-body block [grid-area:1/1]" data-open={open} aria-hidden={!open}>
          <span className="label block opacity-50">
            Category {String(index).padStart(2, "0")} — winner
          </span>
          <span className="label mt-3 block text-[var(--stage-accent)]">{award.category}</span>
          <span
            className={`metal-type display mt-3 block ${
              grand ? "text-[clamp(2.25rem,7vw,6rem)]" : "text-[clamp(1.75rem,3.2vw,3rem)]"
            } leading-[0.98]`}
          >
            {award.winner}
          </span>
          <span className="body-copy mt-5 block text-sm">{award.citation}</span>
          {award.form === "statuette" ? (
            <span
              aria-hidden
              className="award-spot pointer-events-none absolute inset-x-0 -top-10 mx-auto block h-[120%] w-[70%]"
              style={{
                background:
                  "radial-gradient(ellipse at top, color-mix(in srgb, var(--stage-accent) 26%, transparent), transparent 62%)",
              }}
            />
          ) : null}
        </span>
      </button>
    </Tag>
  );
}
