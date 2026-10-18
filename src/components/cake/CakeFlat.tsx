"use client";

import { useEffect, useRef } from "react";
import type { CakeConfig } from "@/content/cake";
import { prefersReducedMotion } from "@/lib/gsap";
import { drawFlatCake } from "./flat";

/**
 * The 2D cake lab: identical options, drawn on a canvas. Only animates while
 * a flame is actually moving, and the frame loop stops the moment it settles.
 */
export default function CakeFlat({
  config,
  lit,
  blown,
  onReady,
}: {
  config: CakeConfig;
  lit: boolean;
  blown: boolean;
  onReady?: (canvas: HTMLCanvasElement) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onReady?.(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let t0 = 0;
    const still = prefersReducedMotion();

    const size = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return rect;
    };

    let rect = size();

    const render = (time: number) => {
      if (!t0) t0 = time;
      const elapsed = (time - t0) / 1000;
      const flicker = blown ? Math.min(1, elapsed / 1.1) : elapsed;
      drawFlatCake(ctx, rect.width, rect.height, config, { lit, blown, flicker });

      const settled = blown ? flicker >= 1 : !lit || still;
      if (!settled) raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    const onResize = () => {
      rect = size();
      t0 = 0;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(render);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [config, lit, blown, onReady]);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      role="img"
      aria-label={`A ${config.tiers}-tier ${config.shape} cake with ${config.candleCount} candles`}
    />
  );
}
