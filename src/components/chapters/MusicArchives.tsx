"use client";

import { useState } from "react";
import { ExternalLink, Play } from "lucide-react";
import { clips, type Clip } from "@/content/gallery";
import { playlistNote } from "@/content/playlist";
import { useExperience } from "@/lib/experience";
import { useRadio } from "@/lib/radio";
import Chapter from "../ui/Chapter";
import Dialog from "../ui/Dialog";
import Reveal from "../ui/Reveal";
import Reel from "../ui/Reel";

/**
 * ELIZABETH FM + the clips.
 *
 * The playlist plays through Spotify's own embed in the floating player, so
 * this chapter is the sleeve and the liner notes rather than a fake track
 * list: reading a playlist's songs needs an authenticated Web API call, and
 * inventing them would be worse than not showing them.
 */
export default function MusicArchives() {
  const { items, activate, setPanelOpen, isPlaying } = useRadio();
  const { cue } = useExperience();
  const [clip, setClip] = useState<Clip | null>(null);

  const playlist = items.find((i) => i.kind === "playlist") ?? items[0] ?? null;

  const play = () => {
    cue("whoosh");
    activate();
    setPanelOpen(true);
  };

  return (
    <Chapter id="radio">
      <div className="gutter">
        <Reveal
          as="h2"
          mode="lines"
          className="display text-[clamp(2.25rem,7vw,6rem)] leading-[0.94]"
        >
          songs that
          <br />
          sound like you.
        </Reveal>
        <p className="body-copy mt-6">
          I made you a playlist. {playlistNote} Press play and it follows you around the site.
        </p>

        <div className="mt-[8vh] grid gap-[clamp(2rem,4vw,4rem)] lg:grid-cols-12">
          {/* --- the sleeve --------------------------------------------- */}
          <div className="lg:col-span-5">
            <div className="vinyl-stage">
              <span className="handwritten vinyl-sleeve-note">Elizabeth FM</span>
              <div className="vinyl-disc">
                <div className="vinyl-label">
                  {playlist?.meta?.artwork ? (
                    // Spotify artwork stays on its CDN.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={playlist.meta.artwork} alt={playlist.meta.title} className="h-full w-full object-cover" loading="lazy" />
                  ) : <span className="display">just<br />for you.</span>}
                </div>
                <span aria-hidden className="vinyl-spindle" />
              </div>
              <button type="button" onClick={play} aria-label="Play Elizabeth’s playlist" className="vinyl-play"><Play size={25} aria-hidden /></button>
              <span className="paper-sticker vinyl-sticker">put something on.</span>
            </div>

            <p className="display mt-4 text-[clamp(1.25rem,2vw,1.75rem)] leading-tight">
              {playlist?.meta?.title ?? "the playlist"}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button type="button" onClick={play} className="btn btn-solid">
                <span>{isPlaying ? "it's playing" : "play it here"}</span>
              </button>
              <a
                href={playlist?.url ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="label flex h-11 items-center gap-1 opacity-70 underline-offset-4 hover:underline hover:opacity-100"
              >
                open in Spotify <ExternalLink size={12} aria-hidden />
              </a>
            </div>
            <p className="label mt-4 max-w-[36ch] opacity-45">
              Spotify may play previews. Open the playlist in Spotify to keep listening.
            </p>
          </div>

          {/* --- the clips ---------------------------------------------- */}
          <div className="lg:col-span-7">
            <p className="display text-[clamp(1.5rem,3vw,2.25rem)] leading-tight">
              and some evidence.
            </p>
            <p className="body-copy mt-3">
              {clips.length} clips I kept. No particular order.
            </p>

            <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {clips.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      cue("click");
                      setClip(item);
                    }}
                    className="group block w-full cursor-pointer text-left"
                  >
                    <span className="relative block aspect-video overflow-hidden rounded-xl border border-current/20 bg-current/[0.06]">
                      {/* The poster only: clips download when opened. */}
                      {item.poster ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.poster}
                          alt=""
                          aria-hidden
                          loading="lazy"
                          className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : null}
                      <span className="absolute inset-0 grid place-items-center">
                        <span className="grid h-10 w-10 place-items-center rounded-full border border-white/70 bg-black/40 text-white">
                          <Play size={14} strokeWidth={1.5} aria-hidden />
                        </span>
                      </span>
                    </span>
                    <span className="mt-2 block text-xs leading-snug opacity-70">
                      {item.caption}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Dialog
        open={clip !== null}
        onClose={() => setClip(null)}
        title={clip ? `Clip — ${clip.caption}` : "Clip"}
        variant="sheet"
        className="md:max-w-3xl"
      >
        {clip ? (
          <div className="px-[clamp(1.25rem,3vw,2.5rem)] pb-[10vh]">
            <Reel
              src={clip.src}
              poster={clip.poster}
              label={clip.caption}
              className="w-full rounded-xl border border-current/20 bg-black"
            />
            <p className="display mt-4 text-[clamp(1.125rem,2.2vw,1.5rem)] leading-tight">
              {clip.caption}
            </p>
          </div>
        ) : null}
      </Dialog>
    </Chapter>
  );
}
