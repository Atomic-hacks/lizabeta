"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/gsap";

/* The constellation the embers resolve into: a dragon drawn as a star chart.
 * Normalised coordinates, with the lines that join them. */
const STARS: [number, number][] = [
  [0.22, 0.62], [0.3, 0.52], [0.4, 0.47], [0.5, 0.44], [0.58, 0.37],
  [0.64, 0.28], [0.72, 0.24], [0.8, 0.3], [0.68, 0.44], [0.6, 0.54],
  [0.52, 0.62], [0.44, 0.7], [0.34, 0.74], [0.26, 0.78], [0.7, 0.6],
  [0.78, 0.68],
];
const LINKS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [4, 8], [8, 9],
  [9, 10], [10, 11], [11, 12], [12, 13], [9, 14], [14, 15],
];

type Ember = { x: number; y: number; vx: number; vy: number; r: number; seed: number };

/**
 * Embers while she holds, a constellation when she lets go. The frame loop
 * runs only between the first hold and the end of the resolve, then stops.
 */
export default function WishCanvas({
  holding,
  released,
}: {
  holding: boolean;
  released: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const embersRef = useRef<Ember[]>([]);
  const rafRef = useRef(0);
  const resolveRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const still = prefersReducedMotion();
    const active = holding || released;
    let visible = false;
    let rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const size = () => {
      rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();

    if (embersRef.current.length === 0) {
      embersRef.current = Array.from({ length: STARS.length * 4 }, (_, i) => ({
        x: 0.5 + (Math.random() - 0.5) * 0.06,
        y: 0.68 + Math.random() * 0.05,
        vx: (Math.random() - 0.5) * 0.0006,
        vy: -0.0012 - Math.random() * 0.0016,
        r: 0.6 + Math.random() * 1.6,
        seed: i,
      }));
    }

    const draw = (time: number) => {
      ctx.clearRect(0, 0, rect.width, rect.height);

      if (released) {
        resolveRef.current = Math.min(1, resolveRef.current + (still ? 1 : 0.012));
      }
      const t = resolveRef.current;
      const ease = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;

      // Lines appear only once the stars have nearly arrived.
      if (ease > 0.55) {
        ctx.strokeStyle = `rgba(200,162,255,${(ease - 0.55) * 0.9})`;
        ctx.lineWidth = 0.8;
        LINKS.forEach(([a, b]) => {
          ctx.beginPath();
          ctx.moveTo(STARS[a][0] * rect.width, STARS[a][1] * rect.height);
          ctx.lineTo(STARS[b][0] * rect.width, STARS[b][1] * rect.height);
          ctx.stroke();
        });
      }

      embersRef.current.forEach((e, i) => {
        if (!released && (holding || still)) {
          e.x += e.vx;
          e.y += e.vy;
          if (e.y < 0.42) {
            e.x = 0.5 + (Math.random() - 0.5) * 0.05;
            e.y = 0.68;
          }
        }

        const star = STARS[i % STARS.length];
        const jitter = ((e.seed * 37) % 11) / 1100;
        const x = (e.x + (star[0] + jitter - e.x) * ease) * rect.width;
        const y = (e.y + (star[1] - jitter - e.y) * ease) * rect.height;

        // Twinkle only while something is actually happening; at rest the
        // embers are drawn once and left alone.
        const twinkle = active && !still ? 0.65 + Math.sin(time / 420 + e.seed) * 0.35 : 1;
        const alpha = (holding || released ? 1 : 0.32) * twinkle;

        const glow = ctx.createRadialGradient(x, y, 0, x, y, 9 + e.r * 3);
        glow.addColorStop(0, `rgba(226,189,106,${0.5 * alpha})`);
        glow.addColorStop(1, "rgba(226,189,106,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, 9 + e.r * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(245,241,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, e.r * (released ? 1.1 : 0.85), 0, Math.PI * 2);
        ctx.fill();
      });

      /* The loop only continues while there is something left to animate:
         embers rising during a hold, or the constellation resolving. Idle,
         off-screen or finished, it draws one frame and stops. */
      const resolving = released && resolveRef.current < 1;
      if (visible && !still && (holding || resolving)) {
        rafRef.current = requestAnimationFrame(draw);
      } else {
        rafRef.current = 0;
      }
    };

    const kick = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(draw);
    };

    /* Nothing runs while the chapter is off screen. */
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) kick();
        else if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = 0;
        }
      },
      { rootMargin: "5% 0px" },
    );
    observer.observe(canvas);

    kick();
    const onResize = () => {
      size();
      kick();
    };
    window.addEventListener("resize", onResize);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      window.removeEventListener("resize", onResize);
    };
  }, [holding, released]);

  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />;
}
