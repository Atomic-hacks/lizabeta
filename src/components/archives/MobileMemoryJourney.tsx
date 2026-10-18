"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Film } from "lucide-react";
import { memories, type Memory } from "@/content/memories";
import { gsap } from "@/lib/gsap";
import { useSmoothScroll } from "@/lib/useSmoothScroll";
import Plate from "../ui/Plate";
import Egg from "../ui/Egg";

export default function MobileMemoryJourney({ onOpen, reducedMotion }: {
  onOpen: (memory: Memory) => void;
  reducedMotion: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollTo } = useSmoothScroll();

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const scenes = Array.from(el.querySelectorAll<HTMLElement>(".memory-scene"));
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) setActive(scenes.indexOf(entry.target as HTMLElement));
      }
    }, { rootMargin: "-40% 0px -40% 0px", threshold: 0 });
    scenes.forEach((scene) => observer.observe(scene));

    const mm = gsap.matchMedia();
    if (!reducedMotion) {
      mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
        scenes.forEach((scene) => {
          gsap.fromTo(scene.querySelector(".memory-photo"), { yPercent: -5, scale: 1.08 }, {
            yPercent: 5, scale: 1,
            ease: "none",
            scrollTrigger: { trigger: scene, start: "top bottom", end: "bottom top", scrub: 0.6 },
          });
          gsap.fromTo(scene.querySelector(".memory-story"), { y: 36 }, {
            y: 0, ease: "none",
            scrollTrigger: { trigger: scene, start: "top 65%", end: "top 15%", scrub: 0.5 },
          });
        });
      });
    }
    return () => { observer.disconnect(); mm.revert(); };
  }, [reducedMotion]);

  return (
    <div ref={root} className="memory-journey lg:hidden" data-reduced-motion={reducedMotion}>
      <nav className="memory-wayfinder" aria-label="Memory timeline">
        <span className="memory-position" aria-live="off">{String(active + 1).padStart(2, "0")} / {String(memories.length).padStart(2, "0")}</span>
        <div className="memory-stops">
          {memories.map((memory, i) => (
            <button key={memory.id} type="button" aria-label={`Go to ${memory.title}, ${memory.date}`}
              aria-current={active === i ? "step" : undefined}
              onClick={() => scrollTo(`#memory-${memory.id}`, { offset: -110, immediate: reducedMotion })}>
              <span data-passed={i <= active} />
            </button>
          ))}
        </div>
      </nav>
      <ol className="memory-scenes">
        {memories.map((memory, i) => (
          <li key={memory.id} id={`memory-${memory.id}`} className="memory-scene"
            data-quiet={memory.id === "breakup"} data-interlude={memory.interlude || undefined}>
            <div className="memory-stage">
              <div className="memory-photo">
                <Plate src={memory.images[0]} alt={`Elizabeth — ${memory.title}`} sizes="(max-width: 1023px) 100vw, 1px" className="h-full w-full" />
              </div>
              <span className="memory-year" aria-hidden>{memory.date === "Today" ? "now" : memory.date?.slice(-4)}</span>
              <div className="memory-story">
                <p className="memory-date">{memory.date}</p>
                <h3 className="display">{memory.title}</h3>
                <p className="memory-description">{memory.description}</p>
                <button type="button" className="memory-open" onClick={() => onOpen(memory)} aria-label={`Open memory: ${memory.title}`}>
                  <span>{memory.video ? <><Film size={16} aria-hidden /> There is footage</> : "Open this memory"}</span>
                  <ArrowUpRight size={20} aria-hidden />
                </button>
                <p className="memory-location">{memory.locationName} <span aria-hidden>·</span> {String(i + 1).padStart(2, "0")}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
      <div className="memory-arrival">
        <p className="handwritten">And somehow, here we are.</p>
        <Egg id="egg-2" />
      </div>
    </div>
  );
}
