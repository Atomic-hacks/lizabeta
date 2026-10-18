"use client";

import { useExperience } from "@/lib/experience";
import { eggs } from "@/content/eggs";

/**
 * A hidden collectible. Deliberately low-contrast but a real 44px button with
 * a label, so it is reachable by keyboard and findable by thumb.
 */
export default function Egg({ id, className = "" }: { id: string; className?: string }) {
  const { foundEggs, collectEgg } = useExperience();
  const egg = eggs.find((e) => e.id === id);
  const found = foundEggs.includes(id);

  return (
    <button
      type="button"
      onClick={() => collectEgg(id)}
      aria-label={found ? `Dragon egg ${egg?.number} — already found` : "Something is hiding here"}
      className={`group grid h-11 w-11 place-items-center transition-opacity duration-300 ${
        found ? "opacity-100" : "opacity-[0.22] hover:opacity-90 focus-visible:opacity-100"
      } ${className}`}
    >
      <svg viewBox="0 0 24 30" className="h-5 w-4 overflow-visible" aria-hidden>
        <path
          d="M12 1C7 7 2 14.5 2 19.5A10 10 0 0 0 22 19.5C22 14.5 17 7 12 1Z"
          fill={found ? "var(--stage-accent)" : "none"}
          stroke="currentColor"
          strokeWidth="1.1"
        />
        {found ? null : (
          <circle cx="12" cy="19" r="2.5" fill="currentColor" className="animate-pulse" />
        )}
      </svg>
    </button>
  );
}
