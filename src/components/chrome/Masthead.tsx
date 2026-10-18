"use client";

import { Volume2, VolumeX } from "lucide-react";
import { PaperStar } from "../art/BirthdayArt";
import { birthdayConfig, chapterById } from "@/content/birthday";
import { useExperience } from "@/lib/experience";
import { useSmoothScroll } from "@/lib/useSmoothScroll";

/**
 * The running head. Minimal by design: wordmark, chapter counter, sound.
 * No navbar — the chapter counter is the navigation.
 */
export default function Masthead() {
  const { activeChapter, setNavOpen, navOpen, sfxOn, toggleSfx, cue } = useExperience();
  const { scrollTo } = useSmoothScroll();
  const chapter = chapterById(activeChapter);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30 gutter pt-[max(1rem,env(safe-area-inset-top))]">
      {/* Content scrolls underneath a fixed header; this keeps both legible
          without a backdrop-filter. It follows the chapter's own ground. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[7.5rem]"
        style={{
          background:
            "linear-gradient(to bottom, var(--stage-bg) 38%, color-mix(in srgb, var(--stage-bg) 55%, transparent) 72%, transparent)",
        }}
      />
      <div className="pointer-events-auto flex items-center justify-between gap-4">
        <a
          href="#chapter-cover"
          onClick={(e) => {
            e.preventDefault();
            cue("click");
            scrollTo("#chapter-cover", { offset: -8 });
          }}
          className="display cursor-pointer text-[clamp(1.05rem,1.5vw,1.4rem)] leading-none tracking-[-0.01em]"
        >
          <span className="universe-wordmark"><PaperStar size={28} /><span>{birthdayConfig.displayName}’s<span className="block text-[.8em]">universe</span></span></span>
        </a>

        <button
          type="button"
          onClick={() => {
            cue("click");
            setNavOpen(!navOpen);
          }}
          aria-expanded={navOpen}
          aria-controls="chapter-index"
          aria-label={"Explore Elizabeth’s universe. You are at " + chapter.title}
          className="universe-explore"
        >
          <span>Explore</span>
        </button>

        <button
          type="button"
          onClick={toggleSfx}
          aria-pressed={sfxOn}
          className="flex h-11 cursor-pointer items-center gap-2 px-1"
        >
          {sfxOn ? (
            <Volume2 size={14} strokeWidth={1.5} aria-hidden />
          ) : (
            <VolumeX size={14} strokeWidth={1.5} aria-hidden />
          )}
          <span className="label hidden md:inline">Sound {sfxOn ? "on" : "off"}</span>
          <span className="sr-only-focusable">Interface sounds</span>
        </button>
      </div>

    </header>
  );
}
