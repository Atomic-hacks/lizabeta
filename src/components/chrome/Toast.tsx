"use client";

import { useExperience } from "@/lib/experience";

/** Discovery notices. Polite live region: it never steals focus. */
export default function Toast() {
  const { toast } = useExperience();

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed bottom-6 left-[var(--gutter)] z-40 max-w-[min(22rem,calc(100vw-2*var(--gutter)))]"
    >
      {toast ? (
        <div className="border-l-2 border-[var(--stage-accent)] bg-[var(--stage-bg)] px-5 py-4 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.6)]">
          <p className="label text-[var(--stage-accent)]">{toast.title}</p>
          <p className="mt-2 text-sm leading-snug">{toast.body}</p>
        </div>
      ) : null}
    </div>
  );
}
