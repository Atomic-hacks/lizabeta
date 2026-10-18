"use client";

import { birthdayConfig, chapters } from "@/content/birthday";
import { letter } from "@/content/letter";
import { eggs } from "@/content/eggs";
import { useExperience } from "@/lib/experience";
import { useSmoothScroll } from "@/lib/useSmoothScroll";
import Chapter from "../ui/Chapter";

/**
 * THE COLOPHON.
 * Where the site admits how it was made, and the only place the egg hunt can
 * be reset.
 */
export default function Colophon() {
  const { foundEggs, resetEggs, allEggsFound, cue } = useExperience();
  const { scrollTo } = useSmoothScroll();

  return (
    <Chapter id="colophon" pad="tight">
      <div className="gutter">
        <div aria-hidden className="hairline-violet" />

        <div className="mt-[8vh] grid gap-[6vh] lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 className="display text-[clamp(1.85rem,5vw,4rem)] leading-[1]">
              {letter.footer.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
            <p className="label mt-8 max-w-[34ch] opacity-50">
              {birthdayConfig.universeName} — {birthdayConfig.birthdayYear}.
              {birthdayConfig.madeBy ? ` Made by ${birthdayConfig.madeBy}.` : ""} Built for one
              person and nobody else.
            </p>
          </div>

          <div className="lg:col-span-3">
            <p className="label text-lavender">everything in here</p>
            <ol className="mt-4">
              {chapters.map((chapter) => (
                <li key={chapter.id} className="border-t border-current/15 py-2">
                  <a
                    href={`#chapter-${chapter.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      cue("click");
                      scrollTo(`#chapter-${chapter.id}`, { offset: -8 });
                    }}
                    className="label flex cursor-pointer items-baseline gap-3 opacity-70 transition-opacity duration-200 hover:opacity-100"
                  >
                    <span className="opacity-50">{chapter.index}</span>
                    {chapter.title}
                  </a>
                </li>
              ))}
            </ol>
          </div>

          <div className="lg:col-span-3">
            <p className="label text-lavender">how it was made</p>
            <dl className="mt-4">
              {[
                ["Written by", birthdayConfig.madeBy || "someone who likes her a lot"],
                ["Set in", "Fredoka, Cormorant & Nunito"],
                ["Motion", "GSAP & Lenis"],
                ["Cake engineering", "Three.js"],
                ["Her room", "drawn by hand, in SVG"],
                ["Soundtrack", "Spotify"],
                ["Interface sound", "Synthesised in the browser"],
                ["The cards", "fan-made, unofficial, affectionate"],
              ].map(([role, who]) => (
                <div key={role} className="border-t border-current/15 py-2">
                  <dt className="label opacity-45">{role}</dt>
                  <dd className="mt-1 text-sm">{who}</dd>
                </div>
              ))}
            </dl>

            <p className="label mt-8 text-lavender">Discoveries</p>
            <p className="display mt-2 text-3xl">
              {String(foundEggs.length).padStart(2, "0")}
              <span className="opacity-40">/0{eggs.length}</span>
            </p>
            {allEggsFound ? (
              <button
                type="button"
                onClick={() => {
                  cue("click");
                  resetEggs();
                }}
                className="label mt-3 h-11 cursor-pointer px-1 opacity-55 underline-offset-4 hover:underline"
              >
                reset the hunt
              </button>
            ) : null}
          </div>
        </div>

        <p className="label mt-[10vh] text-center opacity-35">
          Not for distribution. Circulation: one.
        </p>
      </div>
    </Chapter>
  );
}
