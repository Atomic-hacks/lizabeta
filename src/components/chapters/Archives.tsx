"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { memories, type Memory } from "@/content/memories";
import { useExperience } from "@/lib/experience";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import Chapter from "../ui/Chapter";
import Plate from "../ui/Plate";
import Reel from "../ui/Reel";
import Reveal from "../ui/Reveal";
import Dialog from "../ui/Dialog";
import Egg from "../ui/Egg";

const MAP_W = 3200;
const MAP_H = 1000;

/** Catmull-Rom through every memory, converted to cubic beziers. The road is
 * generated from the data: move a pin in content/memories.ts and it re-draws. */
function buildRoute(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  const p = points.map((pt) => ({ x: (pt.x / 100) * MAP_W, y: (pt.y / 100) * MAP_H }));
  let d = `M ${p[0].x.toFixed(1)} ${p[0].y.toFixed(1)}`;
  for (let i = 0; i < p.length - 1; i += 1) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    const t = 0.32; // tension — loose enough to look drawn by hand
    const c1 = { x: p1.x + (p2.x - p0.x) * t, y: p1.y + (p2.y - p0.y) * t };
    const c2 = { x: p2.x - (p3.x - p1.x) * t, y: p2.y - (p3.y - p1.y) * t };
    d += ` C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)}, ${c2.x.toFixed(1)} ${c2.y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export default function Archives() {
  const [open, setOpen] = useState<Memory | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const markerRef = useRef<SVGGElement>(null);
  /* Reduced motion gets the itinerary at every width: no pinning, no
     horizontal travel, every stop still openable. */
  const { reducedMotion: staticMode } = useExperience();

  const route = useMemo(() => buildRoute(memories.map((m) => m.coordinates)), []);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const path = routeRef.current;
    if (!section || !track || !path || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

      /* getPointAtLength is SVG geometry work and was being called on every
         scroll frame. Sample the route once, then interpolate between
         neighbours — same curve, no per-frame measuring. */
      const SAMPLES = 320;
      const points = Array.from({ length: SAMPLES + 1 }, (_, i) => {
        const p = path.getPointAtLength((length * i) / SAMPLES);
        return { x: p.x, y: p.y };
      });

      const markerSetX = gsap.quickSetter(markerRef.current, "x", "px");
      const markerSetY = gsap.quickSetter(markerRef.current, "y", "px");

      const place = (progress: number) => {
        const f = Math.max(0, Math.min(1, progress)) * SAMPLES;
        const i = Math.floor(f);
        const a = points[i];
        const b = points[Math.min(i + 1, SAMPLES)];
        const t = f - i;
        markerSetX(a.x + (b.x - a.x) * t);
        markerSetY(a.y + (b.y - a.y) * t);
        path.style.strokeDashoffset = String(length * (1 - progress));
      };
      place(0);

      const mm = gsap.matchMedia();

      /* Desktop: the map travels sideways while the page scrolls down. */
      mm.add("(min-width: 1024px)", () => {
        const distance = () => track.scrollWidth - window.innerWidth;
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${Math.max(distance(), 1) + window.innerHeight * 0.6}`,
            pin: true,
            scrub: 0.9,
            invalidateOnRefresh: true,
            onUpdate: (self) => place(self.progress),
            /* The one legitimate use of will-change in the project: this
               element is genuinely transformed on every frame, but only
               while the pin is active. */
            onToggle: (self) => {
              track.style.willChange = self.isActive ? "transform" : "auto";
            },
          },
        });
        tl.to(track, { x: () => -distance(), ease: "none", duration: 1 }, 0);
        // Out of the way early, and back on the way up.
        tl.to(
          section.querySelector(".archives-intro"),
          { autoAlpha: 0, xPercent: -14, ease: "none", duration: 0.16 },
          0,
        );
      });

      /* Phones and tablets: no pinning. The route draws as the stops pass. */
      mm.add("(max-width: 1023px)", () => {
        ScrollTrigger.create({
          trigger: section,
          start: "top 70%",
          end: "bottom 60%",
          scrub: true,
          onUpdate: (self) => place(self.progress),
        });
      });
    }, section);

    return () => ctx.revert();
  }, [staticMode]);

  const pins = memories.map((memory, i) => ({
    memory,
    left: `${(memory.coordinates.x / 100) * MAP_W}px`,
    top: `${(memory.coordinates.y / 100) * MAP_H}px`,
    index: String(i + 1).padStart(2, "0"),
  }));

  return (
    <Chapter id="archives" pad={staticMode ? "default" : "none"}>
      <div ref={sectionRef} className="relative">
        {/* --- heading ---------------------------------------------------- */}
        {/* Overlaid on the plate, then animated out of the way: the intro
            fades and slides left in the first fifth of the pinned scroll, so
            the map is fully visible and clickable while you travel it. */}
        <div className="archives-intro gutter pt-[12vh] lg:pointer-events-none lg:absolute lg:inset-x-0 lg:top-0 lg:z-20 lg:pt-[13vh]">
          <Reveal
            as="h2"
            mode="lines"
            className="display text-[clamp(1.85rem,min(5vw,6.5vh),4rem)] leading-[1] lg:max-w-[20ch]"
          >
            february 2023
            <br />
            to whatever this is now.
          </Reveal>
          <p className="body-copy mt-5 max-w-[42ch]">
            {staticMode
              ? "Every stop opens. Some of them are funny."
              : "Scroll and the road draws itself. Open any stop — some of them are funny, one of them isn't."}
          </p>
        </div>

        {/* --- the map (desktop + tablet) --------------------------------- */}
        {staticMode ? null : (
          <div className="relative hidden h-[100svh] items-center overflow-hidden lg:flex">
            <div ref={trackRef} className="relative h-[1000px] shrink-0" style={{ width: MAP_W }}>
              <MapArt route={route} routeRef={routeRef} markerRef={markerRef} />
              {pins.map(({ memory, left, top, index }) => (
                <button
                  key={memory.id}
                  type="button"
                  onClick={() => setOpen(memory)}
                  style={{ left, top }}
                  className="group absolute z-10 -translate-x-1/2 -translate-y-full cursor-pointer text-left"
                >
                  <span className="label block opacity-50">{index}</span>
                  <span className="display block max-w-[16ch] text-[clamp(1.5rem,2vw,2.25rem)] leading-[1.02] transition-opacity duration-300 group-hover:opacity-60">
                    {memory.locationName}
                  </span>
                  <span className="mt-2 flex items-center gap-2">
                    <MapPin size={14} strokeWidth={1.5} aria-hidden className="text-[var(--stage-accent)]" />
                    <span className="h-[1px] w-10 bg-current opacity-30 transition-all duration-300 group-hover:w-16" />
                  </span>
                </button>
              ))}
              {/* Egg 02: off the road, in the unmapped corner. */}
              <div className="absolute" style={{ left: "2840px", top: "860px" }}>
                <Egg id="egg-2" />
              </div>
            </div>
          </div>
        )}

        {/* --- the itinerary (phones, and anyone with reduced motion) ----- */}
        <ol className={`gutter mt-[8vh] space-y-0 ${staticMode ? "" : "lg:hidden"}`}>
          {pins.map(({ memory, index }) => (
            <li key={memory.id} className="relative border-t border-current/15 pl-7">
              <span
                aria-hidden
                className="absolute left-[3px] top-0 h-full w-[1px] bg-current opacity-20"
              />
              <span
                aria-hidden
                className="absolute left-0 top-[1.4rem] h-[7px] w-[7px] rounded-full bg-[var(--stage-accent)]"
              />
              <button
                type="button"
                onClick={() => setOpen(memory)}
                className="flex w-full cursor-pointer items-baseline justify-between gap-4 py-5 text-left"
              >
                <span>
                  <span className="label opacity-50">{index}</span>
                  <span className="display mt-1 block text-[clamp(1.75rem,7vw,2.75rem)] leading-[1.02]">
                    {memory.locationName}
                  </span>
                </span>
                <span className="label shrink-0 opacity-55">Open</span>
              </button>
            </li>
          ))}
          <li className="flex justify-end border-t border-current/15 pt-2">
            {staticMode ? <Egg id="egg-2" /> : null}
          </li>
        </ol>
      </div>

      {/* --- the memory file ------------------------------------------- */}
      <Dialog
        open={open !== null}
        onClose={() => setOpen(null)}
        title={open ? `Archive file — ${open.locationName}` : "Archive file"}
      >
        {open ? (
          <article className="px-[clamp(1.25rem,3vw,2.5rem)] pb-[12vh]">
            <Plate
              src={open.images[0]}
              alt={`${open.title}`}
              caption={open.locationName}
              className="aspect-[4/3] w-full rounded-xl"
              sizes="(max-width: 768px) 100vw, 36rem"
            />
            <p className="label mt-6 text-[var(--stage-accent)]">{open.date || "sometime"}</p>
            <h3 className="display mt-3 text-[clamp(2rem,5vw,3.25rem)] leading-[1.0]">
              {open.title}
            </h3>
            <p className="body-copy mt-5">{open.description}</p>

            {open.quote ? (
              <blockquote className="mt-8 border-l-2 border-[var(--stage-accent)] pl-5">
                <p className="display text-[clamp(1.25rem,2.4vw,1.75rem)] italic leading-snug">
                  &ldquo;{open.quote}&rdquo;
                </p>
              </blockquote>
            ) : null}

            {open.audio ? (
              <div className="mt-8">
                <p className="label mb-3 opacity-55">Voice note</p>
                <audio controls preload="none" src={open.audio} className="w-full">
                  <a href={open.audio}>Download the recording</a>
                </audio>
              </div>
            ) : null}

            {open.video ? (
              <div className="mt-8">
                <p className="label mb-3 opacity-55">there is footage</p>
                <Reel
                  src={open.video}
                  poster={open.images[0]}
                  label={`A clip from ${open.title}`}
                  className="w-full rounded-xl border border-current/15 bg-black"
                />
              </div>
            ) : null}
          </article>
        ) : null}
      </Dialog>
    </Chapter>
  );
}

/** The illustrated plate: graticule, contours, water, and the drawn road. */
function MapArt({
  route,
  routeRef,
  markerRef,
}: {
  route: string;
  routeRef: React.RefObject<SVGPathElement | null>;
  markerRef: React.RefObject<SVGGElement | null>;
}) {
  return (
    <svg
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      className="absolute inset-0 h-full w-full"
      aria-hidden
      preserveAspectRatio="none"
    >
      {/* The graticule is drawn as explicit lines: a tiled <pattern> over a
          3200px plate has to be re-rastered every time the plate moves. */}
      <g stroke="currentColor" strokeWidth="0.6" opacity="0.13">
        {Array.from({ length: 20 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 168} y1="0" x2={i * 168} y2={MAP_H} />
        ))}
        {Array.from({ length: 7 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 160} x2={MAP_W} y2={i * 160} />
        ))}
      </g>

      {/* Coastline and the inland sea, as flat fills. */}
      <path
        d="M-20 760 C 240 700, 420 820, 700 780 C 980 740, 1120 840, 1420 800 C 1720 760, 1900 870, 2240 820 C 2560 775, 2860 880, 3220 810 L 3220 1020 L -20 1020 Z"
        fill="currentColor"
        fillOpacity="0.07"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.6"
      />
      <ellipse cx="1180" cy="190" rx="250" ry="92" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <ellipse cx="1180" cy="190" rx="190" ry="62" fill="currentColor" fillOpacity="0.06" />

      {/* Contour country. */}
      {[0, 1, 2, 3].map((i) => (
        <path
          key={i}
          d={`M ${380 + i * 26} ${470 - i * 18} C ${560 + i * 20} ${380 - i * 22}, ${760 - i * 18} ${560 + i * 16}, ${940 + i * 24} ${450 - i * 12}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.9"
          opacity={0.26 - i * 0.04}
        />
      ))}
      {[0, 1, 2].map((i) => (
        <path
          key={`b-${i}`}
          d={`M ${2180 + i * 30} ${300 - i * 20} C ${2360 + i * 18} ${210 - i * 16}, ${2560 - i * 20} ${380 + i * 18}, ${2760 + i * 26} ${270 - i * 14}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.9"
          opacity={0.24 - i * 0.05}
        />
      ))}

      {/* District names, set like a real map. */}
      {[
        { x: 520, y: 170, t: "THE EARLY YEARS" },
        { x: 1500, y: 560, t: "UNDOCUMENTED TERRITORY" },
        { x: 2300, y: 140, t: "THE LOUD DECADE" },
        { x: 2900, y: 700, t: "HERE BE DRAGONS" },
      ].map((d) => (
        <text
          key={d.t}
          x={d.x}
          y={d.y}
          fill="currentColor"
          opacity="0.35"
          fontSize="19"
          letterSpacing="7"
          fontFamily="var(--font-mono)"
        >
          {d.t}
        </text>
      ))}

      {/* Compass. */}
      <g transform="translate(3010, 170)" opacity="0.4">
        <circle r="46" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M0 -44 L9 0 L0 44 L-9 0 Z" fill="currentColor" opacity="0.6" />
        <text x="-6" y="-56" fill="currentColor" fontSize="18" fontFamily="var(--font-mono)">N</text>
      </g>

      {/* Scale bar. */}
      <g transform="translate(120, 930)" opacity="0.4">
        <line x1="0" y1="0" x2="200" y2="0" stroke="currentColor" strokeWidth="1.4" />
        <line x1="0" y1="-6" x2="0" y2="6" stroke="currentColor" strokeWidth="1.4" />
        <line x1="100" y1="-4" x2="100" y2="4" stroke="currentColor" strokeWidth="1.4" />
        <line x1="200" y1="-6" x2="200" y2="6" stroke="currentColor" strokeWidth="1.4" />
        <text x="0" y="24" fill="currentColor" fontSize="16" fontFamily="var(--font-mono)">
          SEVERAL YEARS
        </text>
      </g>

      {/* The road: a faint printed version, then the drawn-on overlay. */}
      <path d={route} fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.18" strokeDasharray="2 10" />
      <path
        ref={routeRef}
        d={route}
        fill="none"
        stroke="var(--stage-accent)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Traveller. */}
      <g ref={markerRef}>
        <circle r="13" fill="var(--stage-accent)" opacity="0.18" />
        <circle r="5.5" fill="var(--stage-accent)" />
      </g>
    </svg>
  );
}
