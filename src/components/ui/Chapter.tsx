"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { chapterById, type ChapterId } from "@/content/birthday";
import { useExperience } from "@/lib/experience";

type ChapterProps = {
  id: ChapterId;
  children: ReactNode;
  className?: string;
  pad?: "default" | "tight" | "none";
  label?: string;
};

/**
 * Wraps a chapter: owns the scroll-triggered colour atmosphere and tells the
 * chrome which chapter is on screen.
 *
 * This deliberately uses an IntersectionObserver rather than a ScrollTrigger.
 * Enter/leave callbacks can be skipped when someone flings the page, which
 * left the ground colour of one chapter under the content of another. An
 * observer watching a thin band across the middle of the viewport always
 * reports the true current state and costs nothing while idle.
 *
 * Colour is applied by writing the stage variables; body transitions them in
 * CSS, so there is no JS colour tween either.
 */
export default function Chapter({ id, children, className = "", pad = "default", label }: ChapterProps) {
  const ref = useRef<HTMLElement>(null);
  const { setActiveChapter } = useExperience();
  const chapter = chapterById(id);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const apply = () => {
      const root = document.documentElement;
      root.style.setProperty("--stage-bg", chapter.theme.bg);
      root.style.setProperty("--stage-fg", chapter.theme.fg);
      root.style.setProperty("--stage-accent", chapter.theme.accent);
      root.style.setProperty("--grain-opacity", String(chapter.theme.grain ?? 0.025));
      setActiveChapter(id);
    };

    // A 10%-tall band across the centre of the viewport: whichever chapter
    // crosses it owns the colour.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) apply();
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, [chapter, id, setActiveChapter]);

  const padding =
    pad === "none" ? "" : pad === "tight" ? "py-[10vh]" : "py-[12vh] md:py-[15vh]";

  return (
    <section
      ref={ref}
      id={`chapter-${id}`}
      aria-label={`Chapter ${chapter.index}: ${chapter.title}`}
      data-chapter={id}
      style={{
        backgroundColor: chapter.theme.bg,
        color: chapter.theme.fg,
        "--stage-bg": chapter.theme.bg,
        "--stage-fg": chapter.theme.fg,
        "--stage-accent": chapter.theme.accent,
      } as CSSProperties}
      className={`relative ${padding} ${className}`}
    >
      {label !== undefined ? (
        <p className="label gutter mb-[6vh] opacity-55">
          {chapter.index} / {label}
        </p>
      ) : null}
      {children}
    </section>
  );
}
