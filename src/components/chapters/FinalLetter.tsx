"use client";

import { letter } from "@/content/letter";
import { useExperience } from "@/lib/experience";
import { useRadio } from "@/lib/radio";
import { useSmoothScroll } from "@/lib/useSmoothScroll";
import Chapter from "../ui/Chapter";
import Plate from "../ui/Plate";
import Reel from "../ui/Reel";
import Reveal from "../ui/Reveal";

/**
 * THE LAST PAGE.
 * The intensity comes down on purpose: one photograph, one column of text,
 * gentle fades only. Nothing here competes with the words.
 */
export default function FinalLetter() {
  const { replay, cue } = useExperience();
  const { scrollTo } = useSmoothScroll();
  const { setPanelOpen, activate, activated } = useRadio();

  return (
    <Chapter id="letter">
      <div className="gutter">
        <div className="grid gap-[8vh] lg:grid-cols-12 lg:gap-[4vw]">
          <div className="lg:col-span-5">
            <Plate
              src={letter.image}
              alt={letter.imageAlt}
              caption="A closing photograph"
              className="aspect-[4/5] w-full"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
            {letter.video ? (
              <Reel
                src={letter.video}
                poster={letter.image}
                label="A clip of Elizabeth"
                className="mt-4 w-full rounded-xl border border-current/15 bg-black"
              />
            ) : null}
          </div>

          <div className="lg:col-span-7">
            <Reveal
              as="h2"
              mode="lines"
              className="display mt-5 text-[clamp(2.25rem,6vw,5rem)] leading-[0.96]"
            >
              {letter.headline.map((line, i) => (
                <span key={line} className="block">
                  {i === letter.headline.length - 1 ? <em>{line}</em> : line}
                </span>
              ))}
            </Reveal>

            <div aria-hidden className="rule mt-[6vh]" />

            <div className="mt-[6vh]">
              <p className="quiet text-[clamp(1.5rem,3vw,2.25rem)] text-lavender">
                {letter.salutation}
              </p>
              <div className="mt-6 space-y-5">
                {letter.paragraphs.map((paragraph, i) => (
                  <Reveal key={i} delay={i * 0.04} className="body-copy">
                    <p>{paragraph}</p>
                  </Reveal>
                ))}
              </div>
              <p className="display mt-8 text-[clamp(1.5rem,min(2.8vw,4vh),2.25rem)] text-violet">
                {letter.signoff}
              </p>
              {letter.postscript ? (
                <p className="mt-6 max-w-[48ch] text-sm italic opacity-70">{letter.postscript}</p>
              ) : null}
              {letter.signature ? (
                <p className="label mt-4 opacity-60">{letter.signature}</p>
              ) : null}
            </div>

            {/* What to do next */}
            <div className="mt-[10vh] flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  cue("whoosh");
                  replay();
                }}
                className="btn"
              >
                <span>watch it all again</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  cue("click");
                  scrollTo("#chapter-archives", { offset: -8 });
                }}
                className="btn"
              >
                <span>back to the map</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  cue("click");
                  if (!activated) activate();
                  setPanelOpen(true);
                }}
                className="btn"
              >
                <span>play the playlist</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Chapter>
  );
}
