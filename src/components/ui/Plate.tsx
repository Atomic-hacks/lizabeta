"use client";

import Image from "next/image";
import { useState } from "react";

type PlateProps = {
  src: string;
  alt: string;
  className?: string;
  /** Shown in the placeholder so you know which file to drop in. */
  caption?: string;
  priority?: boolean;
  sizes?: string;
  /** Tailwind object-position override, e.g. "object-top". */
  position?: string;
};

/**
 * Photography with a designed absence. If the file isn't there yet, you get a
 * typeset placeholder naming the expected path — never a broken image icon.
 */
export default function Plate({
  src,
  alt,
  className = "",
  caption,
  priority = false,
  sizes = "100vw",
  position = "object-center",
}: PlateProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`relative flex flex-col justify-between overflow-hidden bg-[color-mix(in_srgb,var(--stage-fg)_10%,var(--stage-bg))] p-[clamp(1rem,2vw,2rem)] ${className}`}
        role="img"
        aria-label={alt}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, currentColor 0 1px, transparent 1px 16px)",
          }}
        />
        {/* Full-strength text: this placeholder has to stay readable on the
            near-black chapters as well as the light ones. */}
        <span />
        <div className="relative">
          <p className="label text-[var(--stage-accent)]">Photo unavailable</p>
          <p className="display mt-2 text-[clamp(1.25rem,2.4vw,2rem)] leading-tight">
            {caption ?? alt}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        quality={88}
        onError={() => setFailed(true)}
        className={`object-cover ${position}`}
      />
    </div>
  );
}
