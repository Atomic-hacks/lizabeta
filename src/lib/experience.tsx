"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { chapters, type ChapterId } from "@/content/birthday";
import { EGG_STORAGE_KEY, eggs } from "@/content/eggs";
import { clearKey, readJSONExact, writeJSON } from "./storage";
import { disableSfx, enableSfx, playCue, type Cue } from "./sfx";

/** The opening is a small state machine, not a pile of timeouts. */
export type Stage = "loading" | "countdown" | "invite" | "live";

const PREFS_KEY = "elizabeth.prefs.v1";
const SEEN_KEY = "elizabeth.seen.v1";

type Prefs = { sfx: boolean; music: boolean };

type ExperienceValue = {
  stage: Stage;
  setStage: (stage: Stage) => void;
  /** True on repeat visits — lets us offer "skip the opening". */
  hasVisited: boolean;
  reducedMotion: boolean;

  sfxOn: boolean;
  toggleSfx: () => void;
  cue: (name: Cue) => void;

  musicPreference: boolean;
  setMusicPreference: (on: boolean) => void;

  activeChapter: ChapterId;
  setActiveChapter: (id: ChapterId) => void;
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;

  /** Set by the room's objects; the owning chapter consumes and clears it. */
  studioRequest: "cake" | "booth" | null;
  requestStudio: (studio: "cake" | "booth" | null) => void;

  foundEggs: string[];
  collectEgg: (id: string) => void;
  resetEggs: () => void;
  allEggsFound: boolean;
  toast: { title: string; body: string } | null;
  pushToast: (title: string, body: string) => void;

  replay: () => void;
};

const ExperienceContext = createContext<ExperienceValue | null>(null);

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [stage, setStage] = useState<Stage>("loading");
  const [hasVisited, setHasVisited] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [sfxOn, setSfxOn] = useState(false);
  const [musicPreference, setMusicPreference] = useState(false);
  const [activeChapter, setActiveChapter] = useState<ChapterId>("cover");
  const [navOpen, setNavOpen] = useState(false);
  const [studioRequest, setStudioRequest] = useState<"cake" | "booth" | null>(null);
  const [foundEggs, setFoundEggs] = useState<string[]>([]);
  const [toast, setToast] = useState<{ title: string; body: string } | null>(null);

  /* --- preferences + progress, restored once on mount ------------------- */
  useEffect(() => {
    const prefs = readJSONExact<Prefs>(PREFS_KEY, { sfx: true, music: false });
    /* Hydrating from localStorage: the value cannot be read during render
       without breaking SSR, so this is the one sanctioned place for it. */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMusicPreference(prefs.music);
    setFoundEggs(readJSONExact<string[]>(EGG_STORAGE_KEY, []));
    setHasVisited(readJSONExact<boolean>(SEEN_KEY, false));
    writeJSON(SEEN_KEY, true);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const cue = useCallback((name: Cue) => playCue(name), []);

  const toggleSfx = useCallback(() => {
    setSfxOn((on) => {
      const next = !on;
      if (next) {
        const ok = enableSfx();
        if (!ok) return false;
        playCue("click");
      } else {
        disableSfx();
      }
      writeJSON(PREFS_KEY, { sfx: next, music: musicPreference });
      return next;
    });
  }, [musicPreference]);

  const handleMusicPreference = useCallback(
    (on: boolean) => {
      setMusicPreference(on);
      writeJSON(PREFS_KEY, { sfx: sfxOn, music: on });
    },
    [sfxOn],
  );

  const requestStudio = useCallback((studio: "cake" | "booth" | null) => {
    setStudioRequest(studio);
  }, []);

  const pushToast = useCallback((title: string, body: string) => {
    setToast({ title, body });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const collectEgg = useCallback(
    (id: string) => {
      setFoundEggs((prev) => {
        if (prev.includes(id)) return prev;
        const next = [...prev, id];
        writeJSON(EGG_STORAGE_KEY, next);
        const egg = eggs.find((e) => e.id === id);
        playCue("sparkle");
        setToast({
          title: "Secret discovered",
          body: `Dragon egg ${egg?.number ?? "??"} / 0${eggs.length} — ${egg?.found ?? ""}`,
        });
        return next;
      });
    },
    [],
  );

  const resetEggs = useCallback(() => {
    setFoundEggs([]);
    clearKey(EGG_STORAGE_KEY);
  }, []);

  /* The scroll reset itself happens in <Stage>, which owns Lenis: calling
     window.scrollTo here would desync it from ScrollTrigger. */
  const replay = useCallback(() => {
    setStage("countdown");
  }, []);

  /* --- Escape closes the chapter index --------------------------------- */
  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navOpen]);

  const value = useMemo<ExperienceValue>(
    () => ({
      stage,
      setStage,
      hasVisited,
      reducedMotion,
      sfxOn,
      toggleSfx,
      cue,
      musicPreference,
      setMusicPreference: handleMusicPreference,
      activeChapter,
      setActiveChapter,
      navOpen,
      setNavOpen,
      studioRequest,
      requestStudio,
      foundEggs,
      collectEgg,
      resetEggs,
      allEggsFound: foundEggs.length >= eggs.length,
      toast,
      pushToast,
      replay,
    }),
    [
      stage,
      hasVisited,
      reducedMotion,
      sfxOn,
      toggleSfx,
      cue,
      musicPreference,
      handleMusicPreference,
      activeChapter,
      navOpen,
      studioRequest,
      requestStudio,
      foundEggs,
      collectEgg,
      resetEggs,
      toast,
      pushToast,
      replay,
    ],
  );

  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
}

export function useExperience(): ExperienceValue {
  const ctx = useContext(ExperienceContext);
  if (!ctx) throw new Error("useExperience must be used inside <ExperienceProvider>");
  return ctx;
}

export { chapters };
