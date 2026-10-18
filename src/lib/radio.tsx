"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  RADIO_STORAGE_KEY,
  dragonPlaylist,
  playlistUrl,
  spotifyUriFromUrl,
  type Track,
} from "@/content/playlist";
import {
  fetchTrackMeta,
  loadEmbedApi,
  type EmbedController,
  type TrackMeta,
} from "./spotify";
import { readJSONExact, writeJSON } from "./storage";

export type RadioStatus = "idle" | "loading" | "ready" | "error";

/** Either the whole playlist, or one song someone singled out. */
export type RadioItem = {
  id: string;
  uri: string;
  url: string;
  kind: "playlist" | "track";
  dedication?: string;
  meta: TrackMeta | null;
  source: Track | null;
};

type RadioValue = {
  items: RadioItem[];
  index: number;
  current: RadioItem | null;
  status: RadioStatus;
  activated: boolean;
  isPlaying: boolean;
  position: number;
  duration: number;
  /** The embed exposes neither volume nor playlist skipping. */
  supportsVolume: boolean;
  supportsSkip: boolean;
  playbackNote: string;
  panelOpen: boolean;

  activate: () => void;
  select: (index: number, options?: { play?: boolean }) => void;
  toggle: () => void;
  seek: (ms: number) => void;
  setPanelOpen: (open: boolean) => void;
  retry: () => void;
  registerHost: (el: HTMLDivElement | null) => void;
};

const RadioContext = createContext<RadioValue | null>(null);

const NOTE_PLAYLIST =
  "Choose songs in the Spotify player below. If playback doesn’t start, press play there.";
const NOTE_ERROR = "Spotify isn't answering. The playlist still opens in the app.";

/** The playlist first, then any individually dedicated songs. */
function buildItems(): RadioItem[] {
  const items: RadioItem[] = [];
  const playlistUri = spotifyUriFromUrl(playlistUrl);
  if (playlistUri) {
    items.push({
      id: "playlist",
      uri: playlistUri,
      url: playlistUrl,
      kind: "playlist",
      meta: null,
      source: null,
    });
  }
  dragonPlaylist.forEach((track) => {
    const uri = spotifyUriFromUrl(track.spotifyUrl);
    if (!uri) return;
    items.push({
      id: track.id,
      uri,
      url: track.spotifyUrl,
      kind: "track",
      dedication: track.dedication,
      meta: null,
      source: track,
    });
  });
  return items;
}

export function RadioProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<RadioItem[]>(buildItems);
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<RadioStatus>("idle");
  const [activated, setActivated] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);

  const hostRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<EmbedController | null>(null);
  const pendingPlayRef = useRef(false);
  const wantedIndexRef = useRef(0);
  const creatingRef = useRef(false);
  const generationRef = useRef(0);
  const readyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const saved = readJSONExact<{ index: number; panelOpen: boolean }>(RADIO_STORAGE_KEY, {
      index: 0,
      panelOpen: false,
    });
    if (Number.isInteger(saved?.index) && saved.index >= 0 && saved.index < buildItems().length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIndex(saved.index);
      wantedIndexRef.current = saved.index;
    }
    setPanelOpen(saved?.panelOpen === true);
  }, []);

  useEffect(() => {
    writeJSON(RADIO_STORAGE_KEY, { index, panelOpen });
  }, [index, panelOpen]);

  /* Title + artwork come from Spotify's oEmbed. This runs on mount rather
     than on activation: it is a single request to our own cached route, it
     loads no Spotify script, and without it the sleeve in the music chapter
     sits empty until someone presses play. */
  useEffect(() => {
    let cancelled = false;
    const list = buildItems();
    (async () => {
      const metas = await Promise.all(
        list.map((item) => fetchTrackMeta(item.url).catch(() => null)),
      );
      if (cancelled) return;
      setItems((prev) =>
        prev.map((item, i) => ({
          ...item,
          meta: {
            title: item.source?.title ?? metas[i]?.title ?? "Elizabeth FM",
            artist: item.source?.artist ?? metas[i]?.artist,
            artwork: metas[i]?.artwork,
          },
        })),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const createController = useCallback(() => {
    const host = hostRef.current;
    if (!host || controllerRef.current || creatingRef.current) return;
    const list = buildItems();
    const item = list[wantedIndexRef.current] ?? list[0];
    if (!item) {
      setStatus("error");
      return;
    }

    creatingRef.current = true;
    const generation = ++generationRef.current;
    setStatus("loading");
    // Spotify replaces its target node. Keep React's host intact so retries
    // always have a connected element to mount into.
    host.replaceChildren();
    const mount = document.createElement("div");
    host.appendChild(mount);
    const fail = () => {
      if (generation !== generationRef.current) return;
      ++generationRef.current;
      creatingRef.current = false;
      pendingPlayRef.current = false;
      setIsPlaying(false);
      setStatus("error");
    };
    readyTimerRef.current = setTimeout(fail, 20000);

    loadEmbedApi()
      .then((api) => {
        if (generation !== generationRef.current || !mount.isConnected) return;
        const latest = list[wantedIndexRef.current] ?? item;
        api.createController(
          mount,
          { uri: latest.uri, width: "100%", height: latest.kind === "playlist" ? "352" : "80" },
          (controller) => {
            if (generation !== generationRef.current || !host.isConnected) {
              controller.destroy();
              return;
            }
            controllerRef.current = controller;
            controller.addListener("ready", () => {
              if (generation !== generationRef.current) return;
              if (readyTimerRef.current) clearTimeout(readyTimerRef.current);
              creatingRef.current = false;
              setStatus("ready");
              const selected = list[wantedIndexRef.current] ?? latest;
              if (selected.uri !== latest.uri) controller.loadUri(selected.uri);
              if (pendingPlayRef.current) {
                pendingPlayRef.current = false;
                controller.play();
              }
            });
            controller.addListener("playback_update", (e) => {
              if (generation !== generationRef.current) return;
              setPosition(e.data.position ?? 0);
              setDuration(e.data.duration ?? 0);
              setIsPlaying(!e.data.isPaused);
            });
          },
        );
      })
      .catch(() => {
        if (generation !== generationRef.current) return;
        if (readyTimerRef.current) clearTimeout(readyTimerRef.current);
        fail();
      });
  }, []);

  const registerHost = useCallback(
    (el: HTMLDivElement | null) => {
      hostRef.current = el;
      if (el && activated) createController();
    },
    [activated, createController],
  );

  useEffect(() => {
    if (activated) createController();
  }, [activated, createController]);

  useEffect(
    () => () => {
      ++generationRef.current;
      if (readyTimerRef.current) clearTimeout(readyTimerRef.current);
      creatingRef.current = false;
      try {
        controllerRef.current?.destroy();
      } catch {
        /* already gone */
      }
      controllerRef.current = null;
    },
    [],
  );

  const retry = useCallback(() => {
    ++generationRef.current;
    if (readyTimerRef.current) clearTimeout(readyTimerRef.current);
    pendingPlayRef.current = true;
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);
    try {
      controllerRef.current?.destroy();
    } catch {
      /* no-op */
    }
    controllerRef.current = null;
    creatingRef.current = false;
    setStatus("idle");
    createController();
  }, [createController]);

  const activate = useCallback(() => {
    setPanelOpen(true);
    setActivated(true);
    if (status === "error") {
      retry();
      return;
    }
    if (controllerRef.current && !creatingRef.current) {
      pendingPlayRef.current = false;
      controllerRef.current.resume();
    } else {
      pendingPlayRef.current = true;
      createController();
    }
  }, [createController, retry, status]);

  const select = useCallback(
    (nextIndex: number, options?: { play?: boolean }) => {
      const list = buildItems();
      if (list.length === 0) return;
      const bounded = ((nextIndex % list.length) + list.length) % list.length;
      setIndex(bounded);
      wantedIndexRef.current = bounded;
      setPosition(0);
      setDuration(0);

      setPanelOpen(true);
      if (!activated || creatingRef.current) {
        pendingPlayRef.current = options?.play !== false;
        setActivated(true);
        return;
      }
      const controller = controllerRef.current;
      if (!controller) return;
      pendingPlayRef.current = options?.play !== false;
      controller.loadUri(list[bounded].uri);
      if (pendingPlayRef.current) {
        pendingPlayRef.current = false;
        controller.play();
      } else {
        controller.pause();
      }
    },
    [activated],
  );

  const toggle = useCallback(() => {
    if (!activated || !controllerRef.current) {
      activate();
      return;
    }
    controllerRef.current?.togglePlay();
  }, [activated, activate]);

  const seek = useCallback((ms: number) => {
    controllerRef.current?.seek(ms / 1000);
  }, []);


  const value = useMemo<RadioValue>(
    () => ({
      items,
      index,
      current: items[index] ?? null,
      status,
      activated,
      isPlaying,
      position,
      duration,
      supportsVolume: false,
      // Skipping inside a playlist belongs to Spotify's own player.
      supportsSkip: items.length > 1,
      playbackNote: status === "error" ? NOTE_ERROR : NOTE_PLAYLIST,
      panelOpen,
      activate,
      select,
      toggle,
      seek,
      setPanelOpen,
      retry,
      registerHost,
    }),
    [
      items,
      index,
      status,
      activated,
      isPlaying,
      position,
      duration,
      panelOpen,
      activate,
      select,
      toggle,
      seek,
      retry,
      registerHost,
    ],
  );

  return <RadioContext.Provider value={value}>{children}</RadioContext.Provider>;
}

export function useRadio(): RadioValue {
  const ctx = useContext(RadioContext);
  if (!ctx) throw new Error("useRadio must be used inside <RadioProvider>");
  return ctx;
}
