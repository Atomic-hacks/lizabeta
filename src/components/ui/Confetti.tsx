"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/gsap";

type ConfettiProps = {
  /** Incrementing this number fires a burst. */
  fire: number;
  colors?: string[];
  /** Paper rectangles, not circles — it reads as confetti, not bubbles. */
  count?: number;
  className?: string;
};

type Piece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  w: number;
  h: number;
  color: string;
  life: number;
};

/**
 * A short canvas burst that ends. The animation frame is cancelled the moment
 * the last piece dies, so nothing keeps running behind the page.
 */
export default function Confetti({
  fire,
  colors = ["#9d4edd", "#c8a2ff", "#f5f1ff", "#f0b8d0", "#e2bd6a"],
  count = 90,
  className = "",
}: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    if (fire === 0) return;
    const canvas = canvasRef.current;
    if (!canvas || prefersReducedMotion()) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const pieces: Piece[] = Array.from({ length: count }, () => ({
      x: rect.width * (0.35 + Math.random() * 0.3),
      y: rect.height * (0.45 + Math.random() * 0.1),
      vx: (Math.random() - 0.5) * 9,
      vy: -(5 + Math.random() * 9),
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      w: 4 + Math.random() * 7,
      h: 2 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1,
    }));

    const step = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      let alive = 0;

      for (const p of pieces) {
        p.vy += 0.26;
        p.vx *= 0.995;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life -= 0.0075;
        if (p.life <= 0 || p.y > rect.height + 40) continue;
        alive += 1;

        ctx.save();
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (alive > 0) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        ctx.clearRect(0, 0, rect.width, rect.height);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [fire, colors, count]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
