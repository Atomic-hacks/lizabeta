"use client";

import { useEffect, useRef } from "react";
import type { CharacterCard as CardData } from "@/content/room";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * A fan-made birthday card, built around one abstract motif: an infinity
 * figure that draws itself, or a lightning arc that strikes.
 *
 * These are affectionate fan-made cards and say so on the card itself. They
 * are not written as messages from any character, no artwork is reproduced,
 * and the motifs are drawn from scratch here.
 */
export default function CharacterCard({ card }: { card: CardData }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /* Reduced motion: the finished card, immediately. */
    if (prefersReducedMotion()) {
      gsap.set(el.querySelectorAll(".card-line, .card-title"), { opacity: 1, y: 0 });
      const stroke = el.querySelector<SVGPathElement>(".motif-stroke");
      if (stroke) gsap.set(stroke, { strokeDashoffset: 0, opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      if (card.motif === "infinity") {
        const stroke = el.querySelector<SVGPathElement>(".motif-stroke");
        if (stroke) {
          const length = stroke.getTotalLength();
          gsap.set(stroke, { strokeDasharray: length, strokeDashoffset: length, opacity: 1 });
          // One continuous line, drawn once — the whole gag of the motif.
          tl.to(stroke, { strokeDashoffset: 0, duration: 2.1, ease: "power2.inOut" }, 0);
        }
        tl.from(".card-title", { y: 28, opacity: 0, duration: 0.9, ease: "power3.out" }, 0.35);
      } else {
        const bolt = el.querySelector(".motif-bolt");
        const flash = el.querySelector(".motif-flash");
        gsap.set(bolt, { opacity: 0 });
        // Strike: two stutters, then it holds.
        tl.to(flash, { opacity: 0.5, duration: 0.07 }, 0)
          .to(flash, { opacity: 0, duration: 0.12 }, 0.07)
          .to(bolt, { opacity: 1, scaleY: 1, duration: 0.09, ease: "none" }, 0.05)
          .to(bolt, { opacity: 0.15, duration: 0.07 }, 0.2)
          .to(bolt, { opacity: 1, duration: 0.1 }, 0.3)
          .to(flash, { opacity: 0.28, duration: 0.06 }, 0.3)
          .to(flash, { opacity: 0, duration: 0.3 }, 0.38)
          .from(".card-title", { y: 24, opacity: 0, duration: 0.7, ease: "power3.out" }, 0.42);
      }

      tl.from(
        ".card-line",
        { y: 18, opacity: 0, duration: 0.7, stagger: 0.12, ease: "power2.out" },
        card.motif === "infinity" ? 1.1 : 0.6,
      );
    }, el);

    return () => ctx.revert();
  }, [card]);

  return (
    <div
      ref={ref}
      className="min-h-[calc(100dvh-5rem)] px-[clamp(1.25rem,4vw,4rem)] pb-[12vh] pt-2"
      style={{ backgroundColor: card.palette.bg, color: card.palette.fg }}
    >
      <p className="label opacity-60">{card.inspiredBy}</p>

      <div className="mt-6 grid gap-[clamp(1.5rem,4vw,3.5rem)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
        {/* The art she actually likes, with the motif drawn over it. */}
        <div className="relative overflow-hidden rounded-2xl border" style={{ borderColor: card.palette.accent }}>
          {/* Her own poster image — not re-hosted, not optimised away. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.image}
            alt={card.imageAlt}
            className="h-full max-h-[52svh] w-full object-cover"
            loading="lazy"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: `linear-gradient(to top, ${card.palette.bg}, transparent 55%)` }}
          />
        </div>

        <div>

      {/* The motif */}
      <div className="relative w-full max-w-xl">
        {card.motif === "infinity" ? (
          <svg viewBox="0 0 400 200" className="h-auto w-full" aria-hidden>
            <path
              className="motif-stroke"
              d="M80 100c0-30 22-54 50-54s46 24 52 54c6 30 24 54 52 54s50-24 50-54-22-54-50-54-46 24-52 54c-6 30-24 54-52 54s-50-24-50-54Z"
              fill="none"
              stroke={card.palette.accent}
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 400 200" className="h-auto w-full" aria-hidden>
            <rect className="motif-flash" x="0" y="0" width="400" height="200" fill={card.palette.accent} opacity="0" />
            <path
              className="motif-bolt"
              d="M214 24 L128 118 H186 L142 184 L268 92 H204 Z"
              fill={card.palette.accent}
              style={{ transformOrigin: "50% 0%" }}
            />
          </svg>
        )}
      </div>

      <h3
        className="card-title display mt-6 leading-[0.94]"
        style={{ color: card.palette.accent, fontSize: "clamp(2rem, min(6vw, 8vh), 4.5rem)" }}
      >
        {card.title}
      </h3>
      <p className="card-title label mt-2 opacity-70">{card.kicker}</p>

      <div className="mt-6 max-w-2xl space-y-4">
        {card.lines.map((line, i) => (
          <p key={i} className="card-line body-copy" style={{ color: "inherit", opacity: 0.86 }}>
            {line}
          </p>
        ))}
        <p className="card-line quiet pt-2 text-[clamp(1.25rem,2.6vw,1.75rem)]">{card.signoff}</p>
      </div>

        </div>
      </div>

      <p className="card-line label mt-[6vh] max-w-[62ch] opacity-45">
        A fan-made birthday card. Unofficial, made for this site, and not affiliated with or
        endorsed by any studio, publisher or creator.
      </p>
    </div>
  );
}
