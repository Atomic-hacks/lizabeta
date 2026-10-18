"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Minus, Plus, RotateCcw, Download } from "lucide-react";
import {
  CAKE_STORAGE_KEY,
  candleColors,
  candleStyles,
  decorations,
  defaultCake,
  frostingColors,
  frostings,
  shapes,
  sponges,
  tierOptions,
  type CakeConfig,
  type DecorationId,
} from "@/content/cake";
import { useExperience } from "@/lib/experience";
import { readJSON, writeJSON } from "@/lib/storage";
import { hasWebGL } from "@/lib/webgl";
import CakeFlat from "./CakeFlat";
import CakeScene from "./CakeScene";
import Confetti from "../ui/Confetti";
import { exportCakeImage } from "./exportCake";

type Phase = "build" | "wish" | "done";

/* A labelled group of options. Keeps the eight steps visually identical. */
function Step({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="border-t border-current/15 pt-4">
      <legend className="sr-only-focusable">{title}</legend>
      <p className="label mb-3 opacity-55" aria-hidden>
        {number} — {title}
      </p>
      {children}
    </fieldset>
  );
}

function Chip({
  active,
  onClick,
  children,
  note,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  note?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-11 cursor-pointer border px-3 py-2 text-left transition-colors duration-200 ${
        active
          ? "border-[var(--stage-accent)] bg-[var(--stage-accent)] text-[var(--stage-bg)]"
          : "border-current/25 hover:border-current/60"
      }`}
    >
      <span className="label block">{children}</span>
      {note ? <span className="mt-1 block text-[0.7rem] opacity-60">{note}</span> : null}
    </button>
  );
}

function SwatchRow({
  items,
  value,
  onChange,
  label: groupLabel,
}: {
  items: { id: string; name: string; hex: string }[];
  value: string;
  onChange: (id: string) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={groupLabel} className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active = value === item.id || value === item.hex;
        return (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(item.id)}
            title={item.name}
            className="group flex min-h-11 cursor-pointer items-center gap-2 border px-2 py-1 transition-colors duration-200"
            style={{ borderColor: active ? "var(--stage-fg)" : "color-mix(in srgb, currentColor 25%, transparent)" }}
          >
            <span
              aria-hidden
              className="h-5 w-5 border border-black/10"
              style={{ backgroundColor: item.hex }}
            />
            <span className="label">{item.name}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function CakeStudio({ onClose }: { onClose: () => void }) {
  const [config, setConfig] = useState<CakeConfig>(defaultCake);
  const [phase, setPhase] = useState<Phase>("build");
  const [bursts, setBursts] = useState(0);
  const [threeD, setThreeD] = useState(true);
  const [exportError, setExportError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { cue } = useExperience();

  /* Her work survives an accidental refresh. */
  useEffect(() => {
    /* Hydrating from localStorage: the value cannot be read during render
       without breaking SSR, so this is the one sanctioned place for it. */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConfig(readJSON<CakeConfig>(CAKE_STORAGE_KEY, defaultCake));
    setThreeD(hasWebGL());
  }, []);

  const update = useCallback((patch: Partial<CakeConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...patch };
      writeJSON(CAKE_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const toggleDecoration = (id: DecorationId) => {
    cue("click");
    update({
      decorations: config.decorations.includes(id)
        ? config.decorations.filter((d) => d !== id)
        : [...config.decorations, id],
    });
  };

  const light = () => {
    cue("chime");
    setPhase("wish");
  };

  const blowOut = () => {
    cue("blow");
    setPhase("done");
    setBursts((b) => b + 1);
  };

  const save = async () => {
    const source = canvasRef.current;
    if (!source) {
      setExportError("The preview isn't ready yet — give it a second and try again.");
      return;
    }
    try {
      setExportError(null);
      await exportCakeImage(source, config);
      cue("sparkle");
    } catch {
      setExportError("Saving didn't work in this browser. A screenshot works too.");
    }
  };

  const reset = () => {
    cue("click");
    setConfig(defaultCake);
    writeJSON(CAKE_STORAGE_KEY, defaultCake);
    setPhase("build");
  };

  const preview = threeD ? (
    <CakeScene
      config={config}
      lit={phase !== "build"}
      blown={phase === "done"}
      spin={phase === "done"}
      onReady={(canvas) => {
        canvasRef.current = canvas;
      }}
    />
  ) : (
    <CakeFlat
      config={config}
      lit={phase !== "build"}
      blown={phase === "done"}
      onReady={(canvas) => {
        canvasRef.current = canvas;
      }}
    />
  );

  return (
    <div className="flex min-h-[calc(100dvh-5rem)] flex-col lg:grid lg:grid-cols-12 lg:gap-0">
      {/* --- preview: sticky on top for phones, centre column on desktop --- */}
      <div className="sticky top-[4.5rem] z-10 order-1 h-[38svh] shrink-0 self-start bg-[#faf7ff] lg:order-2 lg:col-span-6 lg:h-[calc(100dvh-5rem)] lg:border-x lg:border-current/15">
        <div className="relative h-full w-full">
          {preview}
          <Confetti fire={bursts} />

          {phase === "wish" ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#faf7ff] to-transparent p-5 text-center">
              <p className="label opacity-60">One last thing…</p>
              <p className="display text-[clamp(1.5rem,3vw,2.25rem)]">Make a wish.</p>
            </div>
          ) : null}

          {!threeD ? (
            <p className="label absolute left-3 top-3 max-w-[18ch] opacity-50">
              2D lab — this device has no WebGL
            </p>
          ) : null}
        </div>
      </div>

      {/* --- controls ------------------------------------------------------ */}
      <div className="order-2 space-y-6 px-[clamp(1.25rem,3vw,2.5rem)] py-8 lg:order-1 lg:col-span-3 lg:overflow-y-auto">
        <div>
          <p className="label opacity-55">The cake lab</p>
          <h3 className="display mt-2 text-[clamp(1.75rem,3vw,2.5rem)] leading-tight">
            Build it exactly
            <br />
            how you want it.
          </h3>
        </div>

        <Step number="01" title="Shape">
          <div className="grid grid-cols-3 gap-2">
            {shapes.map((s) => (
              <Chip
                key={s.id}
                active={config.shape === s.id}
                onClick={() => {
                  cue("click");
                  update({ shape: s.id });
                }}
                note={s.note}
              >
                {s.name}
              </Chip>
            ))}
          </div>
        </Step>

        <Step number="02" title="Tiers">
          <div className="grid grid-cols-3 gap-2">
            {tierOptions.map((t) => (
              <Chip
                key={t.id}
                active={config.tiers === t.id}
                onClick={() => {
                  cue("click");
                  update({ tiers: t.id });
                }}
                note={t.note}
              >
                {t.name}
              </Chip>
            ))}
          </div>
        </Step>

        <Step number="03" title="Sponge">
          <SwatchRow
            items={sponges}
            value={config.sponge}
            onChange={(id) => {
              cue("click");
              update({ sponge: id });
            }}
            label="Sponge flavour"
          />
        </Step>

        <Step number="04" title="Frosting">
          <SwatchRow
            items={frostings}
            value={config.frosting}
            onChange={(id) => {
              cue("click");
              update({ frosting: id });
            }}
            label="Frosting flavour"
          />
        </Step>

        <Step number="05" title="Colour">
          <div className="flex flex-wrap gap-2">
            {frostingColors.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  cue("click");
                  update({ color: c.hex });
                }}
                aria-pressed={config.color === c.hex}
                title={c.name}
                className="h-11 w-11 cursor-pointer border-2 transition-transform duration-200"
                style={{
                  backgroundColor: c.hex,
                  borderColor: config.color === c.hex ? "var(--stage-fg)" : "transparent",
                }}
              >
                <span className="sr-only-focusable">{c.name}</span>
              </button>
            ))}
            <label className="flex min-h-11 cursor-pointer items-center gap-2 border border-current/25 px-3">
              <span className="label">Custom</span>
              <input
                type="color"
                value={config.color}
                onChange={(e) => update({ color: e.target.value })}
                className="h-6 w-8 cursor-pointer border-0 bg-transparent p-0"
                aria-label="Custom frosting colour"
              />
            </label>
          </div>
        </Step>

        <Step number="06" title="Decorations">
          <div className="grid grid-cols-2 gap-2">
            {decorations.map((d) => (
              <Chip
                key={d.id}
                active={config.decorations.includes(d.id)}
                onClick={() => toggleDecoration(d.id)}
                note={d.note}
              >
                {d.name}
              </Chip>
            ))}
          </div>
        </Step>

        <Step number="07" title="Candles">
          <div className="grid grid-cols-2 gap-2">
            {candleStyles.map((s) => (
              <Chip
                key={s.id}
                active={config.candleStyle === s.id}
                onClick={() => {
                  cue("click");
                  update({ candleStyle: s.id });
                }}
                note={s.note}
              >
                {s.name}
              </Chip>
            ))}
          </div>
          <div className="mt-3">
            <SwatchRow
              items={candleColors}
              value={config.candleColor}
              onChange={(id) => {
                const hex = candleColors.find((c) => c.id === id)?.hex;
                if (hex) update({ candleColor: hex });
              }}
              label="Candle colour"
            />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span className="label opacity-55">How many</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => update({ candleCount: Math.max(1, config.candleCount - 1) })}
                aria-label="One fewer candle"
                className="grid h-11 w-11 cursor-pointer place-items-center border border-current/25"
              >
                <Minus size={14} aria-hidden />
              </button>
              <span className="display w-10 text-center text-2xl tabular-nums" aria-live="polite">
                {config.candleCount}
              </span>
              <button
                type="button"
                onClick={() => update({ candleCount: Math.min(12, config.candleCount + 1) })}
                aria-label="One more candle"
                className="grid h-11 w-11 cursor-pointer place-items-center border border-current/25"
              >
                <Plus size={14} aria-hidden />
              </button>
            </div>
          </div>
        </Step>

        <Step number="08" title="Message">
          <label className="block">
            <span className="label opacity-55">Written in icing</span>
            <input
              type="text"
              value={config.message}
              maxLength={34}
              onChange={(e) => update({ message: e.target.value })}
              className="field display mt-2 text-xl"
              placeholder="Happy birthday Dragon"
            />
          </label>
          <p className="label mt-2 opacity-40">{config.message.length} / 34</p>
        </Step>
      </div>

      {/* --- summary + actions -------------------------------------------- */}
      <div className="order-3 flex flex-col gap-6 px-[clamp(1.25rem,3vw,2.5rem)] pb-[12vh] pt-8 lg:col-span-3 lg:overflow-y-auto lg:pb-8">
        <div>
          <p className="label opacity-55">The order</p>
          <dl className="mt-4">
            {[
              ["Shape", shapes.find((s) => s.id === config.shape)?.name ?? ""],
              ["Tiers", String(config.tiers)],
              ["Sponge", sponges.find((s) => s.id === config.sponge)?.name ?? ""],
              ["Frosting", frostings.find((f) => f.id === config.frosting)?.name ?? ""],
              ["Candles", `${config.candleCount} × ${candleStyles.find((s) => s.id === config.candleStyle)?.name ?? ""}`],
              [
                "Decoration",
                config.decorations.length
                  ? config.decorations
                      .map((d) => decorations.find((x) => x.id === d)?.name)
                      .filter(Boolean)
                      .join(", ")
                  : "None, boldly",
              ],
            ].map(([key, value]) => (
              <div key={key} className="flex justify-between gap-4 border-t border-current/15 py-2">
                <dt className="label opacity-50">{key}</dt>
                <dd className="text-right text-sm">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="space-y-3">
          {phase === "build" ? (
            <button type="button" onClick={light} className="btn btn-solid w-full">
              <span>This is my cake</span>
            </button>
          ) : null}

          {phase === "wish" ? (
            <>
              <p className="body-copy text-sm">
                No microphone, no camera. Just the button.
              </p>
              <button type="button" onClick={blowOut} className="btn btn-solid w-full">
                <span>Blow out the candles</span>
              </button>
            </>
          ) : null}

          {phase === "done" ? (
            <>
              <p className="display text-[clamp(1.5rem,2.4vw,2rem)] leading-tight">
                That&rsquo;s the one.
              </p>
              <button type="button" onClick={save} className="btn btn-solid w-full">
                <Download size={14} aria-hidden />
                <span>Save my cake</span>
              </button>
              <button type="button" onClick={reset} className="btn w-full">
                <RotateCcw size={14} aria-hidden />
                <span>Make another</span>
              </button>
              {exportError ? (
                <p role="status" className="text-sm text-[var(--color-burgundy)]">
                  {exportError}
                </p>
              ) : null}
            </>
          ) : null}

          <button type="button" onClick={onClose} className="label h-11 w-full cursor-pointer opacity-55">
            Back to the issue
          </button>
        </div>

        <p className="label opacity-35">
          Saved to this browser automatically — a refresh won&rsquo;t undo your work.
        </p>
      </div>
    </div>
  );
}
