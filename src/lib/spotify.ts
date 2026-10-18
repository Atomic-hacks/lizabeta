/* ---------------------------------------------------------------------------
 * Spotify, the supported way.
 *
 * Two integration paths, both official:
 *   1. The Embed IFrame API  — always available, no login, no setup.
 *   2. The Web Playback SDK  — optional, needs OAuth + a Premium listener.
 *
 * What the IFrame API genuinely gives us: play, pause, seek, position,
 * duration, and whether playback is paused. It does NOT expose volume, so the
 * UI does not render a volume control in embed mode. It plays a 30-second
 * preview for anonymous listeners and the full track once the listener is
 * signed in to Spotify in the same browser.
 *
 * No audio is extracted, proxied or downloaded anywhere in this file.
 * ------------------------------------------------------------------------- */

export type TrackMeta = {
  title: string;
  artist?: string;
  artwork?: string;
};

/* --- Embed IFrame API types (only what we use) ------------------------- */

export type PlaybackState = {
  position: number;
  duration: number;
  isPaused: boolean;
  isBuffering: boolean;
};

export type EmbedController = {
  loadUri: (uri: string) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  resume: () => void;
  seek: (seconds: number) => void;
  destroy: () => void;
  addListener: (
    event: "playback_update" | "ready" | "account_error" | "playback_started",
    cb: (e: { data: PlaybackState }) => void,
  ) => void;
  removeListener: (event: string, cb?: (e: { data: PlaybackState }) => void) => void;
};

type IFrameApi = {
  createController: (
    element: HTMLElement,
    options: { uri: string; width: string | number; height: string | number },
    callback: (controller: EmbedController) => void,
  ) => void;
};

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: IFrameApi) => void;
    SpotifyIframeApi?: IFrameApi;
  }
}

const EMBED_API_SRC = "https://open.spotify.com/embed/iframe-api/v1";

let apiPromise: Promise<IFrameApi> | null = null;

/** Loads Spotify's embed API once. Rejects (rather than hanging) on failure. */
export function loadEmbedApi(): Promise<IFrameApi> {
  if (typeof window === "undefined") return Promise.reject(new Error("server"));
  if (window.SpotifyIframeApi) return Promise.resolve(window.SpotifyIframeApi);
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<IFrameApi>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${EMBED_API_SRC}"]`);
    const script = existing ?? document.createElement("script");
    const fail = (message: string) => {
      window.clearTimeout(timeout);
      script.remove();
      reject(new Error(message));
    };
    const timeout = window.setTimeout(() => fail("Spotify embed API did not load"), 12000);

    window.onSpotifyIframeApiReady = (api) => {
      window.clearTimeout(timeout);
      window.SpotifyIframeApi = api;
      resolve(api);
    };
    script.onerror = () => fail("Spotify embed API blocked");
    if (!existing) {
      script.src = EMBED_API_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
  }).catch((error: unknown) => {
    apiPromise = null;
    throw error;
  });

  return apiPromise;
}

/* --- Metadata ---------------------------------------------------------- */

/**
 * Title + artwork come from Spotify's public oEmbed endpoint, proxied through
 * our own route so it is cached and CORS-safe. oEmbed does not return the
 * artist, so `artist` only ever comes from src/content/playlist.ts — we don't
 * guess it.
 */
export async function fetchTrackMeta(spotifyUrl: string): Promise<TrackMeta | null> {
  try {
    const res = await fetch(`/api/spotify?url=${encodeURIComponent(spotifyUrl)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { title?: string; thumbnail_url?: string };
    if (!data.title) return null;
    return { title: data.title, artwork: data.thumbnail_url };
  } catch {
    return null;
  }
}

export function trackUri(id: string): string {
  return `spotify:track:${id}`;
}

export function openInSpotify(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer");
}

export function formatTime(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "0:00";
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
