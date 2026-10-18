"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ExternalLink, LoaderCircle, Pause, Play } from "lucide-react";
import { useExperience } from "@/lib/experience";
import { useRadio } from "@/lib/radio";
import { formatTime } from "@/lib/spotify";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import Egg from "../ui/Egg";

/**
 * ELIZABETH FM — the player that follows you around.
 *
 * Mounted once, outside the chapter stack, so the music survives navigation.
 * The Spotify embed lives inside it permanently: unmounting the iframe would
 * stop playback, so when the panel is closed the embed is clipped to zero
 * height instead of removed.
 *
 * Only controls Spotify's embed actually supports are shown — play/pause and
 * seek. There is no volume slider and no skip button for the playlist,
 * because the embed exposes neither. Spotify's own player, right below,
 * handles moving between songs.
 */
export default function FloatingRadio() {
  const { stage, cue } = useExperience();
  const {
    current,
    items,
    index,
    status,
    activated,
    isPlaying,
    position,
    duration,
    panelOpen,
    setPanelOpen,
    toggle,
    select,
    seek,
    retry,
    registerHost,
    playbackNote,
    supportsSkip,
  } = useRadio();

  const panelRef = useRef<HTMLDivElement>(null);
  const [scrubbing, setScrubbing] = useState<number | null>(null);

  useEffect(() => {
    if (!panelOpen || prefersReducedMotion() || !panelRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(panelRef.current, { y: 20, opacity: 0, duration: 0.45, ease: "power3.out" });
    }, panelRef.current);
    return () => ctx.revert();
  }, [panelOpen]);

  const title = current?.meta?.title ?? "Elizabeth FM";
  const artwork = current?.meta?.artwork;
  const showProgress = duration > 0;
  const shown = scrubbing ?? position;

  return (
    <div hidden={stage !== "live"} className="pointer-events-none fixed bottom-0 right-0 z-40 p-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4">
      <div
        ref={panelRef}
        data-lenis-prevent
        className={`birthday-radio pointer-events-auto ml-auto rounded-2xl border border-current/20 bg-[var(--stage-bg)] text-[var(--stage-fg)] shadow-[0_24px_60px_-40px_rgba(0,0,0,0.8)] ${
          panelOpen ? "max-h-[calc(100dvh-6rem)] w-[min(23rem,calc(100vw-1.5rem))] overflow-y-auto overscroll-contain" : "w-[min(17rem,calc(100vw-1.5rem))]"
        }`}
      >
        {/* --- the sleeve ------------------------------------------------ */}
        <div className="flex items-center gap-3 p-3">
          <button
            type="button"
            onClick={() => {
              cue("click");
              setPanelOpen(!panelOpen);
            }}
            aria-expanded={panelOpen}
            aria-controls="radio-panel"
            className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
          >
            <span className="relative grid h-11 w-11 shrink-0 place-items-center">
              <span
                className="record-spin absolute inset-0 rounded-full border border-current/25 bg-cover bg-center"
                data-playing={isPlaying}
                style={{
                  backgroundImage: artwork ? `url(${artwork})` : undefined,
                  backgroundColor: artwork ? undefined : "color-mix(in srgb, currentColor 12%, transparent)",
                }}
              />
              <span className="relative h-2 w-2 rounded-full bg-[var(--stage-bg)] ring-1 ring-current/30" />
            </span>

            <span className="min-w-0 flex-1">
              <span className="label block opacity-55">Elizabeth FM</span>
              <span className="mt-[2px] block truncate text-sm">
                {status === "loading" ? "Loading Spotify…" : status === "error" ? "Couldn’t load Spotify" : activated ? title : "open the player"}
              </span>
            </span>

            <span aria-hidden className="flex h-5 shrink-0 items-end gap-[2px]">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="meter-bar w-[2px] bg-[var(--stage-accent)]"
                  data-playing={isPlaying}
                  style={{ height: `${8 + i * 3}px`, animationDelay: `${i * 110}ms` }}
                />
              ))}
            </span>
          </button>

          <button
            type="button"
            onClick={status === "error" ? retry : toggle}
            disabled={status === "loading" || !current}
            aria-label={status === "loading" ? "Loading Spotify" : status === "error" ? "Retry Spotify" : isPlaying ? "Pause" : "Play"}
            className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full border border-current/25 transition-colors duration-200 hover:bg-current/10"
          >
            {status === "loading" ? (
              <LoaderCircle size={14} className="animate-spin" aria-hidden />
            ) : isPlaying ? (
              <Pause size={14} strokeWidth={1.5} aria-hidden />
            ) : (
              <Play size={14} strokeWidth={1.5} aria-hidden />
            )}
          </button>
        </div>

        {/* --- expanded -------------------------------------------------- */}
        <div id="radio-panel" hidden={!panelOpen}>
          <div className="border-t border-current/15 px-3 pb-3 pt-3">
            <div className="flex items-baseline justify-between gap-3">
              <p className="label opacity-55">
                {current?.kind === "playlist" ? "the whole playlist" : "one song in particular"}
              </p>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                aria-label="Collapse the player"
                className="grid h-11 w-11 cursor-pointer place-items-center opacity-60"
              >
                <ChevronDown size={14} aria-hidden />
              </button>
            </div>

            <p className="display mt-1 text-[1.4rem] leading-tight">{title}</p>
            {current?.dedication ? (
              <p className="mt-1 text-sm italic opacity-70">{current.dedication}</p>
            ) : null}

            {showProgress ? (
              <div className="mt-3">
                <input
                  type="range"
                  min={0}
                  max={duration}
                  value={Math.min(shown, duration)}
                  aria-label="Seek within this song"
                  onChange={(e) => setScrubbing(Number(e.target.value))}
                  onPointerUp={() => {
                    if (scrubbing !== null) seek(scrubbing);
                    setScrubbing(null);
                  }}
                  onKeyUp={() => {
                    if (scrubbing !== null) seek(scrubbing);
                    setScrubbing(null);
                  }}
                  className="w-full"
                />
                <div className="flex justify-between">
                  <span className="label opacity-50 tabular-nums">{formatTime(shown)}</span>
                  <span className="label opacity-50 tabular-nums">{formatTime(duration)}</span>
                </div>
              </div>
            ) : null}

            {/* Only shown when there is genuinely something to switch between. */}
            {supportsSkip ? (
              <ol className="mt-3 max-h-[22vh] overflow-y-auto overscroll-contain">
                {items.map((item, i) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => select(i)}
                      aria-current={i === index ? "true" : undefined}
                      className={`flex w-full cursor-pointer items-baseline gap-3 border-t border-current/10 py-2 text-left transition-colors duration-200 hover:bg-current/[0.05] ${
                        i === index ? "opacity-100" : "opacity-70"
                      }`}
                    >
                      <span className="label shrink-0 opacity-50">
                        {item.kind === "playlist" ? "ALL" : String(i).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm">
                        {item.meta?.title ?? "loading…"}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            ) : null}

            <div className="mt-3 border-t border-current/15 pt-3">
              {status === "idle" ? (
                <p className="text-sm">Press play to start your playlist.</p>
              ) : status === "loading" ? (
                <p role="status" className="text-sm">Loading your playlist…</p>
              ) : status === "error" ? (
                <div>
                  <p className="text-sm">Spotify isn&rsquo;t answering.</p>
                  <div className="mt-2 flex flex-wrap gap-3">
                    <button type="button" onClick={retry} className="label h-11 cursor-pointer underline">
                      try again
                    </button>
                    <a
                      href={current?.url ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="label flex h-11 items-center gap-1 underline"
                    >
                      open it in Spotify <ExternalLink size={12} aria-hidden />
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-xs opacity-60">{playbackNote}</p>
              )}

              <div className="mt-2 flex items-center justify-between gap-2">
                <a
                  href={current?.url ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="label flex h-11 items-center gap-1 opacity-70 hover:opacity-100"
                >
                  open in Spotify <ExternalLink size={12} aria-hidden />
                </a>
                {/* Egg 05: the B-side. */}
                <Egg id="egg-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Spotify's own player. One host element for the whole session —
            swapping or unmounting it would tear down playback. */}
        <div
          aria-hidden={!panelOpen || !activated}
          inert={!panelOpen || !activated}
          className={
            panelOpen && activated
              ? "border-t border-current/15 px-3 pb-3 pt-3"
              : "h-0 overflow-hidden opacity-0"
          }
        >
          {panelOpen && activated ? (
            <p className="label mb-2 opacity-45">playing via Spotify</p>
          ) : null}
          <div ref={registerHost} className="min-h-[80px] w-full" />
        </div>
      </div>
    </div>
  );
}
