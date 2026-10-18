"use client";

import { useEffect, useRef } from "react";
import { chapters } from "@/content/birthday";
import { eggs } from "@/content/eggs";
import { useExperience } from "@/lib/experience";
import { useSmoothScroll } from "@/lib/useSmoothScroll";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * The index: an editorial contents page over the top of everything. Doubles as
 * the discoveries ledger, so the egg hunt has somewhere to live.
 */
export default function ChapterIndex() {
  const { navOpen, setNavOpen, activeChapter, foundEggs, cue } = useExperience();
  const { scrollTo, stop, start } = useSmoothScroll();
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!navOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    stop();
    closeRef.current?.focus();

    let ctx: gsap.Context | undefined;
    if (!prefersReducedMotion() && ref.current) {
      ctx = gsap.context(() => {
        gsap.from(".chapter-index-row", {
          yPercent: 115,
          duration: 0.7,
          stagger: 0.035,
          ease: "power3.out",
        });
        gsap.from(".chapter-index-aside", { opacity: 0, duration: 0.8, delay: 0.25 });
      }, ref.current);
    }

    const trap = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setNavOpen(false);
        return;
      }
      if (e.key !== "Tab" || !ref.current) return;
      const items = Array.from(
        ref.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trap, true);

    return () => {
      document.removeEventListener("keydown", trap, true);
      ctx?.revert();
      start();
      previousFocus?.focus();
    };
  }, [navOpen, start, stop, setNavOpen]);

  if (!navOpen) return null;

  return (
    <div
      data-lenis-prevent
      id="chapter-index"
      role="dialog"
      aria-modal="true"
      aria-label="Chapter index"
      ref={ref}
      className="fixed inset-0 z-50 overflow-y-auto bg-[var(--stage-bg)] text-[var(--stage-fg)]"
    >
      <div className="gutter flex min-h-[100dvh] flex-col pt-[max(1rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between">
          <p className="label opacity-60">Where shall we go?</p>
          <button
            ref={closeRef}
            type="button"
            onClick={() => {
              cue("click");
              setNavOpen(false);
            }}
            className="label h-11 cursor-pointer px-2"
          >
            Close
          </button>
        </div>

        <div className="mt-[6vh] grid flex-1 gap-[6vh] lg:grid-cols-[1fr_auto]">
          <nav aria-label="Chapters">
            <ol className="universe-destinations">
              {chapters.map((chapter) => {
                const current = chapter.id === activeChapter;
                return (
                  <li key={chapter.id} className="overflow-hidden border-t border-current/15">
                    <a
                      href={`#chapter-${chapter.id}`}
                      aria-current={current ? "true" : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        cue("whoosh");
                        setNavOpen(false);
                        // Let the overlay unmount before scrolling.
                        requestAnimationFrame(() =>
                          scrollTo(`#chapter-${chapter.id}`, { offset: -8 }),
                        );
                      }}
                      className="chapter-index-row group flex cursor-pointer items-baseline gap-[clamp(0.75rem,2vw,2rem)] py-[clamp(0.55rem,1.4vh,1.1rem)]"
                    >
                      <span className="label w-8 shrink-0 opacity-50 tabular-nums">
                        {chapter.index}
                      </span>
                      <span
                        className="display text-[clamp(1.75rem,5.4vw,4.25rem)] leading-[0.95] transition-opacity duration-300 group-hover:opacity-55"
                        style={{ fontStyle: current ? "italic" : "normal" }}
                      >
                        {chapter.title}
                      </span>
                      <span className="label ml-auto hidden max-w-[16ch] text-right opacity-45 md:block">
                        {chapter.kicker}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </nav>

          <aside className="chapter-index-aside lg:w-[18rem] lg:border-l lg:border-current/15 lg:pl-8">
            <p className="label opacity-60">Discoveries</p>
            <p className="display mt-3 text-[clamp(2.5rem,6vw,4rem)] leading-none">
              {String(foundEggs.length).padStart(2, "0")}
              <span className="opacity-40">/0{eggs.length}</span>
            </p>
            <p className="mt-2 text-sm opacity-65">
              Five dragon eggs are hidden across the issue. Find them all and a secret
              chapter appears.
            </p>
            <ul className="mt-6 space-y-3">
              {eggs.map((egg) => {
                const found = foundEggs.includes(egg.id);
                return (
                  <li key={egg.id} className="flex gap-3 border-t border-current/10 pt-3">
                    <span className="label mt-[2px] opacity-50">{egg.number}</span>
                    <span className="text-sm leading-snug">
                      {found ? (
                        <>
                          <span className="text-[var(--stage-accent)]">Found</span> — {egg.found}
                        </>
                      ) : (
                        <span className="opacity-60 italic">{egg.hint}</span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}
