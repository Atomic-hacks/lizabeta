"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, ImagePlus, Lock, Plus } from "lucide-react";
import { useExperience } from "@/lib/experience";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { readJSONExact, writeJSON } from "@/lib/storage";
import Chapter from "../ui/Chapter";
import Reveal from "../ui/Reveal";

const DRAFT_KEY = "elizabeth.capsule.draft.v1";
const LOCAL_KEY = "elizabeth.capsule.local.v2";
const CODE_KEY = "elizabeth.capsule.code.v1";

type Draft = {
  letter: string;
  hopes: [string, string, string];
  memory: string;
  prediction: string;
  photo: string | null;
};

const EMPTY: Draft = { letter: "", hopes: ["", "", ""], memory: "", prediction: "", photo: null };

type LocalCapsule = { unlockAt: string; entries: Draft[] } | null;
type Mode = "unknown" | "cloud" | "local";

/**
 * THE TIME CAPSULE — locked, not just saved.
 *
 * Once she locks it, it is append-only: she can keep adding things all year,
 * and nothing hands any of it back until her next birthday. With Supabase
 * configured, that rule is enforced by the API, so no client clock can open
 * it early. Without Supabase it lives in this browser, the lock is still
 * honoured, and the UI says plainly that it is device-only.
 */
export default function TimeCapsule() {
  const [draft, setDraft] = useState<Draft>(() => readJSONExact<Draft>(DRAFT_KEY, EMPTY));
  const [mode, setMode] = useState<Mode>("unknown");
  const [unlockAt, setUnlockAt] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(() => readJSONExact<string | null>(CODE_KEY, null));
  const [freshCode, setFreshCode] = useState<string | null>(null);
  const [entryCount, setEntryCount] = useState(0);
  const [local, setLocal] = useState<LocalCapsule>(() => readJSONExact<LocalCapsule>(LOCAL_KEY, null));
  const [opened, setOpened] = useState<Draft[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [adding, setAdding] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const envelopeRef = useRef<HTMLDivElement>(null);
  const { cue } = useExperience();

  /* Asking the server about a capsule never returns its contents early. */
  const refresh = useCallback(async (withCode: string) => {
    try {
      const res = await fetch("/api/capsule/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: withCode }),
      });
      const data = await res.json();
      if (!res.ok) return;
      setUnlockAt(data.unlockAt);
      if (data.locked) {
        setEntryCount(data.entries ?? 0);
        setOpened(null);
      } else {
        setOpened(data.entries ?? []);
        setEntryCount((data.entries ?? []).length);
      }
    } catch {
      /* offline — the capsule is still sealed, nothing to show */
    }
  }, []);


  useEffect(() => {
    const savedCode = readJSONExact<string | null>(CODE_KEY, null);
    const savedLocal = readJSONExact<LocalCapsule>(LOCAL_KEY, null);
    const controller = new AbortController();

    fetch("/api/capsule/status", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error("Capsule status unavailable");
        return r.json();
      })
      .then((data: { cloud: boolean; unlockAt: string }) => {
        setMode(data.cloud ? "cloud" : "local");
        setUnlockAt(data.cloud ? data.unlockAt : savedLocal?.unlockAt ?? data.unlockAt);
        if (!data.cloud) setEntryCount(savedLocal?.entries.length ?? 0);
        if (data.cloud && savedCode) void refresh(savedCode);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setMode("local");
        setUnlockAt(savedLocal?.unlockAt ?? null);
        setEntryCount(savedLocal?.entries.length ?? 0);
      });
    return () => controller.abort();
  }, [refresh]);

  useEffect(() => {
    const t = window.setTimeout(() => writeJSON(DRAFT_KEY, draft), 600);
    return () => window.clearTimeout(t);
  }, [draft]);


  const sealed = mode === "cloud" ? Boolean(code) : Boolean(local);
  const unlockDate = unlockAt ? new Date(unlockAt) : null;
  const isOpenable = unlockDate ? now >= unlockDate.getTime() : false;
  const unlockLabel = unlockDate
    ? unlockDate.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : "next year";
  const daysLeft = unlockDate
    ? Math.max(0, Math.ceil((unlockDate.getTime() - now) / 86_400_000))
    : null;

  const hasSomething =
    draft.letter.trim() || draft.memory.trim() || draft.prediction.trim() ||
    draft.hopes.some((h) => h.trim());

  const sealAnimation = () =>
    new Promise<void>((resolve) => {
      if (prefersReducedMotion() || !envelopeRef.current) return resolve();
      cue("seal");
      gsap
        .timeline({ onComplete: resolve })
        .fromTo(envelopeRef.current, { scale: 0.98 }, { scale: 1, duration: 0.4, ease: "power3.out" })
        .fromTo(
          envelopeRef.current.querySelector(".wax"),
          { scale: 2.2, opacity: 0, rotate: -18 },
          { scale: 1, opacity: 1, rotate: 0, duration: 0.5, ease: "power4.out" },
          "-=0.2",
        );
    });

  const onPhoto = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.match(/^image\/(png|jpeg|webp)$/)) return setError("PNG, JPEG or WebP only.");
    if (file.size > 1_400_000) return setError("That photo is over 1.4MB — try a smaller one.");
    const reader = new FileReader();
    reader.onload = () => {
      setError(null);
      setDraft((d) => ({ ...d, photo: String(reader.result) }));
    };
    reader.onerror = () => setError("That photo couldn't be read.");
    reader.readAsDataURL(file);
  };

  const lockIt = async () => {
    if (!hasSomething) return setError("Put something in it first.");
    setError(null);
    setBusy(true);

    if (mode !== "cloud") {
      const until = unlockAt ?? new Date(Date.now() + 365 * 86_400_000).toISOString();
      const next = { unlockAt: until, entries: [draft] };
      writeJSON(LOCAL_KEY, next);
      setLocal(next);
      setUnlockAt(until);
      setEntryCount(1);
      setDraft(EMPTY);
      writeJSON(DRAFT_KEY, EMPTY);
      await sealAnimation();
      setBusy(false);
      return;
    }

    try {
      const res = await fetch("/api/capsule/seal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok || !data.code) {
        setError(data.error ?? "It wouldn't lock. Your draft is still here.");
        setBusy(false);
        return;
      }
      setCode(data.code);
      setFreshCode(data.code);
      writeJSON(CODE_KEY, data.code);
      setUnlockAt(data.unlockAt);
      setEntryCount(1);
      setDraft(EMPTY);
      writeJSON(DRAFT_KEY, EMPTY);
      await sealAnimation();
    } catch {
      setError("No connection. Your draft is saved on this device.");
    } finally {
      setBusy(false);
    }
  };

  const addMore = async () => {
    if (!hasSomething) return setError("Write something to add first.");
    setError(null);
    setBusy(true);

    if (mode !== "cloud") {
      const next = {
        unlockAt: local?.unlockAt ?? new Date(Date.now() + 365 * 86_400_000).toISOString(),
        entries: [...(local?.entries ?? []), draft],
      };
      writeJSON(LOCAL_KEY, next);
      setLocal(next);
      setEntryCount(next.entries.length);
      setDraft(EMPTY);
      writeJSON(DRAFT_KEY, EMPTY);
      setNote("Added. Still locked.");
      setAdding(false);
      setBusy(false);
      cue("seal");
      return;
    }

    try {
      const res = await fetch("/api/capsule/append", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "That didn't save.");
        setBusy(false);
        return;
      }
      setEntryCount(data.entries ?? entryCount + 1);
      setDraft(EMPTY);
      writeJSON(DRAFT_KEY, EMPTY);
      setNote("Added. Still locked.");
      setAdding(false);
      cue("seal");
    } catch {
      setError("No connection.");
    } finally {
      setBusy(false);
    }
  };

  const openIt = async () => {
    setError(null);
    if (mode !== "cloud") {
      if (!isOpenable) return setError(`Not yet. It opens on ${unlockLabel}.`);
      setOpened(local?.entries ?? []);
      return;
    }
    if (!code) return setError("Paste the recovery code first.");
    await refresh(code);
    if (!isOpenable) setError(`Not yet. It opens on ${unlockLabel}.`);
  };

  const copyCode = async () => {
    if (!freshCode) return;
    try {
      await navigator.clipboard.writeText(freshCode);
      setCopied(true);
      cue("click");
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setError("Copying is blocked here — write it down instead.");
    }
  };

  const form = (
    <div className="space-y-6">
      <label className="block">
        <span className="label opacity-55">a letter to yourself</span>
        <textarea
          value={draft.letter}
          onChange={(e) => setDraft({ ...draft, letter: e.target.value })}
          rows={7}
          maxLength={8000}
          placeholder="dear me,"
          className="field display mt-2 w-full resize-none text-[clamp(1.05rem,1.6vw,1.35rem)] leading-relaxed"
        />
      </label>

      <fieldset>
        <legend className="label opacity-55">three hopes</legend>
        {draft.hopes.map((hope, i) => (
          <label key={i} className="mt-2 flex items-baseline gap-3">
            <span className="label shrink-0 opacity-40">{String(i + 1).padStart(2, "0")}</span>
            <span className="sr-only-focusable">Hope {i + 1}</span>
            <input
              type="text"
              value={hope}
              maxLength={280}
              onChange={(e) => {
                const hopes = [...draft.hopes] as Draft["hopes"];
                hopes[i] = e.target.value;
                setDraft({ ...draft, hopes });
              }}
              className="field"
            />
          </label>
        ))}
      </fieldset>

      <label className="block">
        <span className="label opacity-55">one memory to keep</span>
        <textarea
          value={draft.memory}
          onChange={(e) => setDraft({ ...draft, memory: e.target.value })}
          rows={3}
          maxLength={2500}
          className="field mt-2 w-full resize-none"
        />
      </label>

      <label className="block">
        <span className="label opacity-55">one prediction</span>
        <input
          type="text"
          value={draft.prediction}
          maxLength={600}
          onChange={(e) => setDraft({ ...draft, prediction: e.target.value })}
          className="field mt-2"
          placeholder="by next year i will have…"
        />
      </label>

      <div>
        <span className="label opacity-55">a photo, if you want</span>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <label className="btn cursor-pointer">
            <ImagePlus size={14} aria-hidden />
            <span>{draft.photo ? "change photo" : "attach a photo"}</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => onPhoto(e.target.files?.[0])}
              className="sr-only-focusable"
            />
          </label>
          {draft.photo ? (
            <button
              type="button"
              onClick={() => setDraft({ ...draft, photo: null })}
              className="label h-11 cursor-pointer px-2 opacity-60"
            >
              remove
            </button>
          ) : null}
        </div>
        {draft.photo ? (
          // A local data URL she just chose; next/image would only get in the way.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={draft.photo}
            alt="The photo you attached"
            className="mt-3 max-h-40 w-auto rounded-lg border border-current/20"
          />
        ) : null}
      </div>
    </div>
  );

  return (
    <Chapter id="capsule">
      <div className="gutter">
        <Reveal
          as="h2"
          mode="lines"
          className="display text-[clamp(2rem,min(6.5vw,8vh),5rem)] leading-[0.96]"
        >
          dear you,
          <br />
          one year from now.
        </Reveal>

        <div className="mt-[7vh] grid gap-[clamp(2rem,4vw,4rem)] lg:grid-cols-12">
          <div className="lg:col-span-7">
            {!sealed ? (
              <>
                <p className="body-copy mb-6">
                  Write something, lock it, and it stays locked until {unlockLabel}. You can
                  keep adding to it all year. You cannot read it back early — that is the
                  point.
                </p>
                {form}
              </>
            ) : isOpenable && opened ? (
              <div className="space-y-6">
                <p className="body-copy">
                  It&rsquo;s open. {opened.length} {opened.length === 1 ? "entry" : "entries"},
                  written across the year.
                </p>
                {opened.map((entry, i) => (
                  <article key={i} className="panel rounded-xl p-5">
                    <p className="label opacity-50">entry {String(i + 1).padStart(2, "0")}</p>
                    {entry.letter ? (
                      <p className="mt-3 whitespace-pre-wrap text-[1.05rem] leading-relaxed">
                        {entry.letter}
                      </p>
                    ) : null}
                    {entry.hopes?.filter(Boolean).length ? (
                      <ul className="mt-4 space-y-1">
                        {entry.hopes.filter(Boolean).map((h, j) => (
                          <li key={j} className="text-sm opacity-80">
                            — {h}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {entry.memory ? <p className="mt-4 text-sm opacity-80">{entry.memory}</p> : null}
                    {entry.prediction ? (
                      <p className="quiet mt-4 text-lg">{entry.prediction}</p>
                    ) : null}
                    {entry.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={entry.photo} alt="" className="mt-4 max-h-56 rounded-lg" />
                    ) : null}
                  </article>
                ))}
              </div>
            ) : adding ? (
              <>
                <p className="body-copy mb-6">
                  Adding to a locked capsule. This goes in with everything else and still
                  can&rsquo;t be read until {unlockLabel}.
                </p>
                {form}
              </>
            ) : (
              <div className="panel rounded-2xl p-[clamp(1.25rem,3vw,2.5rem)]">
                <p className="flex items-center gap-3">
                  <Lock size={18} aria-hidden className="shrink-0 text-[var(--stage-accent)]" />
                  <span className="display text-[clamp(1.25rem,2.4vw,1.9rem)]">
                    locked until {unlockLabel}
                  </span>
                </p>
                <p className="mt-4 text-sm opacity-75">
                  {entryCount} {entryCount === 1 ? "thing" : "things"} inside
                  {daysLeft !== null ? ` · ${daysLeft} days to go` : ""}.
                  {mode === "cloud"
                    ? " Stored on the site, not on this phone."
                    : " Stored in this browser only — it will not follow you to another device."}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button type="button" onClick={() => setAdding(true)} className="btn btn-solid">
                    <Plus size={14} aria-hidden />
                    <span>add something else</span>
                  </button>
                  <button type="button" onClick={openIt} className="btn">
                    <span>{isOpenable ? "open it" : "try to open it"}</span>
                  </button>
                </div>
                {note ? (
                  <p role="status" className="label mt-4 text-[var(--stage-accent)]">
                    {note}
                  </p>
                ) : null}
              </div>
            )}

            {error ? (
              <p role="status" className="mt-4 text-sm text-[var(--stage-accent)]">
                {error}
              </p>
            ) : null}
          </div>

          {/* --- the envelope ------------------------------------------ */}
          <aside className="lg:col-span-5">
            <div
              ref={envelopeRef}
              className="panel rounded-2xl p-[clamp(1.25rem,2.5vw,2rem)]"
            >
              <p className="label opacity-55">{sealed ? "sealed until" : "it will lock until"}</p>
              <p className="display mt-2 text-[clamp(1.4rem,2.6vw,2.1rem)] leading-tight">
                {unlockLabel}
              </p>

              <svg viewBox="0 0 200 110" className="mt-5 w-full" aria-hidden>
                <rect x="1" y="1" width="198" height="108" rx="6" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
                <path d="M1 7 L100 66 L199 7" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
                {sealed ? (
                  <g className="wax">
                    <circle cx="100" cy="66" r="17" fill="#7b2fb5" />
                    <text x="100" y="73" textAnchor="middle" fill="#f5f1ff" fontSize="18" fontFamily="var(--font-display)">
                      E
                    </text>
                  </g>
                ) : null}
              </svg>

              {!sealed ? (
                <button
                  type="button"
                  onClick={lockIt}
                  disabled={busy}
                  className="btn btn-solid mt-5 w-full disabled:opacity-60"
                >
                  <span>{busy ? "locking…" : "lock it"}</span>
                </button>
              ) : adding ? (
                <div className="mt-5 space-y-3">
                  <button
                    type="button"
                    onClick={addMore}
                    disabled={busy}
                    className="btn btn-solid w-full disabled:opacity-60"
                  >
                    <span>{busy ? "adding…" : "put it in"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdding(false)}
                    className="label h-11 w-full cursor-pointer opacity-60"
                  >
                    cancel
                  </button>
                </div>
              ) : null}

              {freshCode ? (
                <div className="mt-5 border-t border-current/15 pt-4">
                  <p className="label opacity-55">your key — shown once</p>
                  <p className="label-tight mt-2 break-all text-base tracking-[0.1em]">
                    {freshCode}
                  </p>
                  <button type="button" onClick={copyCode} className="btn mt-3 w-full">
                    {copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
                    <span>{copied ? "copied" : "copy it"}</span>
                  </button>
                  <p className="mt-3 text-xs opacity-70">
                    Keep this somewhere you&rsquo;ll still have it in a year. It is saved in
                    this browser too, but the code is the only way back in from anywhere else.
                  </p>
                </div>
              ) : null}

              {mode === "cloud" && sealed && !freshCode ? (
                <div className="mt-5 border-t border-current/15 pt-4">
                  <label className="block">
                    <span className="label opacity-55">on a different device?</span>
                    <input
                      type="text"
                      defaultValue=""
                      onChange={(e) => setCode(e.target.value.trim().toUpperCase())}
                      placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
                      className="field label-tight mt-2 text-sm tracking-[0.1em]"
                    />
                  </label>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </Chapter>
  );
}
