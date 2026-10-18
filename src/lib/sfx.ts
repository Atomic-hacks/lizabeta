/* ---------------------------------------------------------------------------
 * Interface sound design, synthesised in the browser.
 *
 * Every cue is generated with WebAudio oscillators and noise buffers, so the
 * site ships no audio files, needs no licences, and nothing is downloaded
 * before it is used. The AudioContext is only created after a real user
 * gesture, which is also the only time browsers allow it.
 * ------------------------------------------------------------------------- */

export type Cue =
  | "tick"
  | "reveal"
  | "sparkle"
  | "seal"
  | "whoosh"
  | "blow"
  | "click"
  | "chime";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = false;

function ensureContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
    return ctx;
  } catch {
    return null;
  }
}

/** Call from a click/keydown handler. Returns false if audio is unavailable. */
export function enableSfx(): boolean {
  const context = ensureContext();
  if (!context) return false;
  if (context.state === "suspended") void context.resume();
  enabled = true;
  return true;
}

export function disableSfx(): void {
  enabled = false;
}

export function isSfxEnabled(): boolean {
  return enabled;
}

function noiseBuffer(context: AudioContext, seconds: number): AudioBuffer {
  const length = Math.floor(context.sampleRate * seconds);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    // Decaying white noise — the basis for breath and paper sounds.
    data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  }
  return buffer;
}

function tone(
  context: AudioContext,
  out: GainNode,
  opts: {
    freq: number;
    to?: number;
    type?: OscillatorType;
    start?: number;
    dur: number;
    peak: number;
  },
) {
  const osc = context.createOscillator();
  const gain = context.createGain();
  const t0 = context.currentTime + (opts.start ?? 0);
  osc.type = opts.type ?? "sine";
  osc.frequency.setValueAtTime(opts.freq, t0);
  if (opts.to) osc.frequency.exponentialRampToValueAtTime(opts.to, t0 + opts.dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(opts.peak, t0 + Math.min(0.02, opts.dur / 4));
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.dur);
  osc.connect(gain).connect(out);
  osc.start(t0);
  osc.stop(t0 + opts.dur + 0.05);
}

function noise(
  context: AudioContext,
  out: GainNode,
  opts: { dur: number; peak: number; filter: number; sweepTo?: number; start?: number },
) {
  const src = context.createBufferSource();
  src.buffer = noiseBuffer(context, opts.dur);
  const band = context.createBiquadFilter();
  const gain = context.createGain();
  const t0 = context.currentTime + (opts.start ?? 0);
  band.type = "bandpass";
  band.frequency.setValueAtTime(opts.filter, t0);
  if (opts.sweepTo) band.frequency.exponentialRampToValueAtTime(opts.sweepTo, t0 + opts.dur);
  band.Q.value = 0.8;
  gain.gain.setValueAtTime(opts.peak, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.dur);
  src.connect(band).connect(gain).connect(out);
  src.start(t0);
}

/** Fire a cue. Silent no-op when sound effects are off or unsupported. */
export function playCue(cue: Cue): void {
  if (!enabled) return;
  const context = ensureContext();
  if (!context || !master) return;
  if (context.state === "suspended") void context.resume();
  const out = master;

  switch (cue) {
    case "tick":
      // Countdown: a dry mechanical hit with a low body.
      noise(context, out, { dur: 0.09, peak: 0.28, filter: 2600, sweepTo: 900 });
      tone(context, out, { freq: 160, to: 90, type: "triangle", dur: 0.14, peak: 0.22 });
      break;
    case "reveal":
      // Award: struck metal, two partials a fifth apart.
      tone(context, out, { freq: 523.25, type: "triangle", dur: 1.6, peak: 0.16 });
      tone(context, out, { freq: 783.99, type: "sine", dur: 1.9, peak: 0.1, start: 0.02 });
      noise(context, out, { dur: 0.3, peak: 0.12, filter: 5200, sweepTo: 1600 });
      break;
    case "sparkle":
      // Secret found: a quick ascending arpeggio.
      [880, 1174.66, 1567.98, 2093].forEach((f, i) =>
        tone(context, out, { freq: f, type: "sine", dur: 0.5, peak: 0.1, start: i * 0.055 }),
      );
      break;
    case "seal":
      // Capsule: paper fold, then a soft thud of wax.
      noise(context, out, { dur: 0.42, peak: 0.2, filter: 1800, sweepTo: 420 });
      tone(context, out, { freq: 110, to: 55, type: "sine", dur: 0.5, peak: 0.26, start: 0.22 });
      break;
    case "whoosh":
      noise(context, out, { dur: 0.6, peak: 0.16, filter: 320, sweepTo: 2800 });
      break;
    case "blow":
      // Candles out: breath, no tone at all.
      noise(context, out, { dur: 0.75, peak: 0.3, filter: 900, sweepTo: 220 });
      break;
    case "click":
      tone(context, out, { freq: 1100, to: 700, type: "square", dur: 0.035, peak: 0.07 });
      break;
    case "chime":
      tone(context, out, { freq: 659.25, type: "sine", dur: 1.1, peak: 0.12 });
      tone(context, out, { freq: 987.77, type: "sine", dur: 1.4, peak: 0.08, start: 0.08 });
      break;
  }
}
