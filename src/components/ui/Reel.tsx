"use client";

import { useEffect, useRef, useState } from "react";

type ReelProps = {
  src: string;
  poster?: string;
  /** Decorative loops play themselves; everything else waits to be asked. */
  ambient?: boolean;
  className?: string;
  label: string;
};

/**
 * Video that behaves itself: nothing downloads until it is wanted, ambient
 * loops only autoplay when the clip is actually on screen and the visitor
 * hasn't asked for less motion, and everything pauses on its way out.
 */
export default function Reel({ src, poster, ambient = false, className = "", label }: ReelProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video || !ambient) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {
            /* autoplay refused — the poster stands in, which is fine */
          });
        } else {
          video.pause();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(video);
    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [ambient]);

  if (failed) {
    return (
      <div
        className={`grid place-items-center bg-[color-mix(in_srgb,var(--stage-fg)_10%,var(--stage-bg))] ${className}`}
        role="img"
        aria-label={label}
      >
        <p className="label px-4 text-center opacity-70">{label}</p>
      </div>
    );
  }

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      className={className}
      aria-label={label}
      onError={() => setFailed(true)}
      preload={ambient ? "metadata" : "none"}
      muted={ambient}
      loop={ambient}
      playsInline
      controls={!ambient}
    />
  );
}
