"use client";

import { useEffect, useRef } from "react";
import { useExperience } from "@/lib/experience";
import { useRadio } from "@/lib/radio";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { enableSfx } from "@/lib/sfx";

/**
 * An invitation, not a gate. Either answer continues immediately, and the
 * question is never asked twice.
 */
export default function SoundInvite({ onDone }: { onDone: () => void }) {
  const { setMusicPreference, toggleSfx, sfxOn } = useExperience();
  const { activate } = useRadio();
  const ref = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    firstRef.current?.focus();
    if (prefersReducedMotion() || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".invite-item", {
        y: 24,
        opacity: 0,
        duration: 0.75,
        stagger: 0.09,
        ease: "power3.out",
      });
    }, ref.current);
    return () => ctx.revert();
  }, []);

  const withMusic = () => {
    // Both of these need the user gesture we are standing in right now.
    if (!sfxOn) {
      enableSfx();
      toggleSfx();
    }
    setMusicPreference(true);
    activate();
    onDone();
  };

  const silently = () => {
    setMusicPreference(false);
    onDone();
  };

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label="Soundtrack"
      className="fixed inset-0 z-[78] flex flex-col items-center justify-center gap-10 bg-dusk px-[var(--gutter)] text-center text-softwhite"
    >
      <p className="invite-item label text-lavender">one thing first</p>
      <h2 className="invite-item display text-[clamp(2.25rem,7vw,5.5rem)] leading-[0.98]">
        I made you
        <br />
        a playlist.
      </h2>
      <p className="invite-item body-copy mx-auto text-center">
        It plays through Spotify&rsquo;s own player and follows you around the site. Sign in
        to Spotify in this browser and you get the full songs; if you don&rsquo;t, you get
        previews and nothing else changes.
      </p>
      <div className="invite-item flex flex-col gap-3 sm:flex-row sm:gap-4">
        <button ref={firstRef} type="button" onClick={withMusic} className="btn btn-solid">
          <span>put it on</span>
        </button>
        <button type="button" onClick={silently} className="btn">
          <span>maybe later</span>
        </button>
      </div>
    </div>
  );
}
