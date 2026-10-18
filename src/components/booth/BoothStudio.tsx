"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, ImagePlus, Trash2, Undo2 } from "lucide-react";
import { BOOTH_STORAGE_KEY, frames, type FrameId } from "@/content/frames";
import { useExperience } from "@/lib/experience";
import { readJSONExact, writeJSON } from "@/lib/storage";
import {
  exportBooth,
  photoWindow,
  renderBooth,
  type BoothState,
  type Sticker,
  type StickerKind,
} from "./render";

const STICKERS: { kind: StickerKind; name: string }[] = [
  { kind: "star", name: "Star" },
  { kind: "heart", name: "Heart" },
  { kind: "egg", name: "Egg" },
  { kind: "bow", name: "Bow" },
  { kind: "sparkle", name: "Sparkle" },
  { kind: "ring", name: "Ring" },
];

/* Art-directed slots, so added stickers land somewhere considered. */
const SEATS = [
  { x: 0.16, y: 0.24 },
  { x: 0.84, y: 0.3 },
  { x: 0.22, y: 0.76 },
  { x: 0.78, y: 0.7 },
  { x: 0.5, y: 0.16 },
  { x: 0.5, y: 0.86 },
];

export default function BoothStudio({ onClose, initialFrame }: { onClose: () => void; initialFrame?: FrameId }) {
  const [frameId, setFrameId] = useState<FrameId>(initialFrame ?? "cover-girl");
  const [slots, setSlots] = useState<Record<string, string>>({});
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [zoom, setZoom] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [hasImage, setHasImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<
    | { kind: "pan"; startX: number; startY: number; from: { x: number; y: number } }
    | { kind: "sticker"; id: string }
    | null
  >(null);
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const { cue } = useExperience();

  const frame = frames.find((f) => f.id === frameId) ?? frames[0];

  /* Defaults for every text slot, restored from the last visit. */
  useEffect(() => {
    const saved = readJSONExact<{ frameId: FrameId; slots: Record<string, string> } | null>(
      BOOTH_STORAGE_KEY,
      null,
    );
    const initial: Record<string, string> = {};
    frames.forEach((f) => f.slots.forEach((s) => (initial[s.id] = s.value)));
    /* Hydrating from localStorage: the value cannot be read during render
       without breaking SSR, so this is the one sanctioned place for it. */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSlots({ ...initial, ...(saved?.slots ?? {}) });
    if (initialFrame) setFrameId(initialFrame);
    else if (saved?.frameId && frames.some((f) => f.id === saved.frameId)) setFrameId(saved.frameId);
  }, [initialFrame]);

  useEffect(() => {
    if (Object.keys(slots).length) writeJSON(BOOTH_STORAGE_KEY, { frameId, slots });
  }, [frameId, slots]);

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  const state = useCallback(
    (): BoothState => ({
      frame: frameId,
      image: imageRef.current,
      offset,
      zoom,
      rotate,
      slots,
      stickers,
    }),
    [frameId, offset, zoom, rotate, slots, stickers],
  );

  /* One draw per state change — no render loop. */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    renderBooth(ctx, rect.width, rect.height, state());
  }, [state]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const onResize = () => draw();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [draw]);

  const onFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("That file isn't an image.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError("That photo is over 25MB — try a smaller one.");
      return;
    }
    setError(null);
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    const img = new window.Image();
    img.onload = () => {
      imageRef.current = img;
      setHasImage(true);
      setOffset({ x: 0, y: 0 });
      setZoom(1);
      setRotate(0);
      cue("click");
      draw();
    };
    img.onerror = () => setError("That image couldn't be read.");
    img.src = url;
  };

  /* --- pointer: drag a sticker if one is under the finger, else pan ----- */
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    const rect = canvas.getBoundingClientRect();
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      pinchRef.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), zoom };
      dragRef.current = null;
      return;
    }

    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const radius = 0.06 * Math.min(rect.width, rect.height);
    const hit = [...stickers]
      .reverse()
      .find((s) => Math.hypot(s.x * rect.width - px, s.y * rect.height - py) < radius);

    dragRef.current = hit
      ? { kind: "sticker", id: hit.id }
      : { kind: "pan", startX: px, startY: py, from: offset };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const rect = canvas.getBoundingClientRect();

    if (pointers.current.size === 2 && pinchRef.current) {
      const [a, b] = Array.from(pointers.current.values());
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const next = (pinchRef.current.zoom * d) / pinchRef.current.distance;
      setZoom(Math.min(4, Math.max(0.6, next)));
      return;
    }

    const drag = dragRef.current;
    if (!drag) return;

    if (drag.kind === "sticker") {
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setStickers((prev) =>
        prev.map((s) =>
          s.id === drag.id
            ? { ...s, x: Math.min(0.98, Math.max(0.02, x)), y: Math.min(0.98, Math.max(0.02, y)) }
            : s,
        ),
      );
      return;
    }

    const win = photoWindow(frameId, rect.width, rect.height);
    setOffset({
      x: drag.from.x + (e.clientX - rect.left - drag.startX) / win.w,
      y: drag.from.y + (e.clientY - rect.top - drag.startY) / win.h,
    });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchRef.current = null;
    if (pointers.current.size === 0) dragRef.current = null;
  };

  const onWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (!hasImage) return;
    e.preventDefault();
    setZoom((z) => Math.min(4, Math.max(0.6, z - e.deltaY * 0.0014)));
  };

  const addSticker = (kind: StickerKind) => {
    cue("click");
    setStickers((prev) => {
      const seat = SEATS[prev.length % SEATS.length];
      return [
        ...prev,
        {
          id: `${kind}-${Date.now()}`,
          kind,
          x: seat.x,
          y: seat.y,
          scale: 1,
          rot: ((prev.length * 37) % 40) / 100,
        },
      ];
    });
  };

  const save = async () => {
    try {
      setError(null);
      await exportBooth(state(), frame.ratio);
      cue("sparkle");
    } catch {
      setError("Saving didn't work in this browser. A screenshot works too.");
    }
  };

  return (
    <div className="grid gap-8 px-[clamp(1.25rem,3vw,2.5rem)] pb-[12vh] pt-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      {/* --- the plate ---------------------------------------------------- */}
      <div>
        <div
          className="relative mx-auto w-full max-w-[34rem] border border-current/20"
          style={{ aspectRatio: String(frame.ratio) }}
        >
          <canvas
            ref={canvasRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onWheel={onWheel}
            className="h-full w-full touch-none"
            style={{ cursor: hasImage ? "grab" : "default" }}
            aria-label={`${frame.name} frame preview`}
            role="img"
          />
        </div>
        <p className="label mt-3 text-center opacity-50">
          {hasImage
            ? "Drag to reposition — drag a sticker to move it — pinch or scroll to zoom"
            : "Add a photograph to begin"}
        </p>
      </div>

      {/* --- controls ----------------------------------------------------- */}
      <div className="space-y-7">
        <div>
          <p className="label opacity-55">The photo booth</p>
          <h3 className="display mt-2 text-[clamp(1.5rem,2.6vw,2.25rem)] leading-tight">
            Look alive.
            <br />
            You&rsquo;re iconic.
          </h3>
          <p className="mt-3 text-sm opacity-65">
            Your photograph stays on this device. Nothing is uploaded anywhere.
          </p>
        </div>

        <div>
          <label className="btn w-full cursor-pointer">
            <ImagePlus size={14} aria-hidden />
            <span>{hasImage ? "Change photograph" : "Add a photograph"}</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onFile(e.target.files?.[0])}
              className="sr-only-focusable"
            />
          </label>
          {error ? (
            <p role="status" className="mt-2 text-sm text-[var(--color-burgundy)]">
              {error}
            </p>
          ) : null}
        </div>

        <fieldset className="border-t border-current/15 pt-4">
          <legend className="label mb-3 opacity-55">Frame</legend>
          <div className="grid gap-2">
            {frames.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  cue("click");
                  setFrameId(f.id);
                }}
                aria-pressed={f.id === frameId}
                className={`flex min-h-11 cursor-pointer items-center justify-between gap-3 border px-3 py-2 text-left transition-colors duration-200 ${
                  f.id === frameId
                    ? "border-[var(--stage-accent)] bg-[var(--stage-accent)] text-[var(--stage-bg)]"
                    : "border-current/25 hover:border-current/60"
                }`}
              >
                <span className="label">{f.name}</span>
                <span className="text-[0.7rem] opacity-70">{f.note}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="border-t border-current/15 pt-4">
          <legend className="label mb-3 opacity-55">Position</legend>
          <label className="block">
            <span className="label opacity-55">Zoom</span>
            <input
              type="range"
              min={0.6}
              max={4}
              step={0.02}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="mt-2 w-full accent-[var(--stage-accent)]"
            />
          </label>
          <label className="mt-4 block">
            <span className="label opacity-55">Rotate</span>
            <input
              type="range"
              min={-30}
              max={30}
              step={0.5}
              value={rotate}
              onChange={(e) => setRotate(Number(e.target.value))}
              className="mt-2 w-full accent-[var(--stage-accent)]"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              setOffset({ x: 0, y: 0 });
              setZoom(1);
              setRotate(0);
            }}
            className="label mt-4 h-11 cursor-pointer underline-offset-4 hover:underline"
          >
            Re-centre
          </button>
        </fieldset>

        <fieldset className="border-t border-current/15 pt-4">
          <legend className="label mb-3 opacity-55">Frame text</legend>
          <div className="space-y-3">
            {frame.slots.map((s) => (
              <label key={s.id} className="block">
                <span className="label opacity-55">{s.label}</span>
                <input
                  type="text"
                  value={slots[s.id] ?? ""}
                  maxLength={s.maxLength}
                  onChange={(e) => setSlots((prev) => ({ ...prev, [s.id]: e.target.value }))}
                  className="field mt-1"
                />
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="border-t border-current/15 pt-4">
          <legend className="label mb-3 opacity-55">Stickers</legend>
          <div className="flex flex-wrap gap-2">
            {STICKERS.map((s) => (
              <button
                key={s.kind}
                type="button"
                onClick={() => addSticker(s.kind)}
                className="label min-h-11 cursor-pointer border border-current/25 px-3 transition-colors duration-200 hover:border-current/60"
              >
                {s.name}
              </button>
            ))}
          </div>
          {stickers.length ? (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setStickers((p) => p.slice(0, -1))}
                className="label flex min-h-11 cursor-pointer items-center gap-2 px-2 opacity-70"
              >
                <Undo2 size={13} aria-hidden /> Undo
              </button>
              <button
                type="button"
                onClick={() => setStickers([])}
                className="label flex min-h-11 cursor-pointer items-center gap-2 px-2 opacity-70"
              >
                <Trash2 size={13} aria-hidden /> Clear {stickers.length}
              </button>
            </div>
          ) : null}
        </fieldset>

        <div className="space-y-3 border-t border-current/15 pt-4">
          <button type="button" onClick={save} className="btn btn-solid w-full">
            <Download size={14} aria-hidden />
            <span>Download the print</span>
          </button>
          <button type="button" onClick={onClose} className="label h-11 w-full cursor-pointer opacity-55">
            Back to the issue
          </button>
        </div>
      </div>
    </div>
  );
}
