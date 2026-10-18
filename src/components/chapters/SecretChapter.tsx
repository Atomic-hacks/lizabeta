"use client";

import { useEffect, useRef } from "react";
import { secretChapter } from "@/content/eggs";
import { useExperience } from "@/lib/experience";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import Reveal from "../ui/Reveal";

/**
 * THE HIDDEN CHAPTER.
 * Only mounted once all five eggs are found, and deliberately not required to
 * finish the issue. It appears between the last page and the colophon.
 */
export default function SecretChapter() {
  const ref = useRef<HTMLElement>(null);
  const { cue } = useExperience();

  useEffect(() => {
    cue("chime");
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(el, { opacity: 0, duration: 1.2, ease: "power2.out" });
      gsap.from(".secret-rule", {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1.4,
        ease: "power3.inOut",
      });
    }, el);
    return () => ctx.revert();
  }, [cue]);

  return (
    <section
      ref={ref}
      id="chapter-secret"
      aria-label="The hidden chapter"
      className="relative overflow-hidden bg-night py-[18vh] text-softwhite"
    >
      {/* A faint field of the eggs she found. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07]">
        {Array.from({ length: 26 }).map((_, i) => (
          <svg
            key={i}
            viewBox="0 0 24 30"
            className="absolute h-6 w-5"
            style={{
              left: `${(i * 37) % 97}%`,
              top: `${(i * 53) % 92}%`,
              transform: `rotate(${(i * 23) % 40 - 20}deg)`,
            }}
          >
            <path
              d="M12 1C7 7 2 14.5 2 19.5A10 10 0 0 0 22 19.5C22 14.5 17 7 12 1Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
        ))}
      </div>

      <div className="relative gutter">
        <p className="label opacity-55">{secretChapter.label}</p>
        <div className="secret-rule hairline-violet mt-6 w-full" />
        <Reveal
          as="h2"
          mode="lines"
          className="display mt-8 text-[clamp(2.25rem,7vw,5.5rem)] leading-[0.94]"
        >
          {secretChapter.title}
        </Reveal>
        <p className="display mt-4 text-[clamp(1.25rem,3vw,2.25rem)] italic opacity-70">
          {secretChapter.subtitle}
        </p>

        <div className="mt-[8vh] max-w-2xl space-y-5">
          {secretChapter.paragraphs.map((paragraph, i) => (
            <Reveal key={i} delay={i * 0.05} className="body-copy">
              <p style={{ color: "inherit", opacity: 0.85 }}>{paragraph}</p>
            </Reveal>
          ))}
          <p className="display pt-4 text-[clamp(1.25rem,2.4vw,1.75rem)]">
            {secretChapter.signoff}
          </p>
        </div>
      </div>
    </section>
  );
}
