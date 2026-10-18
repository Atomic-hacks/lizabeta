import type { FrameId } from "@/content/frames";
import { monoStack, serifStack } from "@/lib/canvasFont";

/* ---------------------------------------------------------------------------
 * The photo booth renderer. One function draws the live preview and the
 * exported PNG, so what she sees is exactly what she downloads.
 *
 * Her photograph never leaves the browser: it is read with createObjectURL and
 * drawn straight onto the canvas. Nothing is uploaded anywhere.
 * ------------------------------------------------------------------------- */

export type StickerKind = "star" | "heart" | "egg" | "bow" | "sparkle" | "ring";

export type Sticker = {
  id: string;
  kind: StickerKind;
  /** Normalised position (0-1) so stickers survive any canvas size. */
  x: number;
  y: number;
  scale: number;
  rot: number;
};

export type BoothState = {
  frame: FrameId;
  image: HTMLImageElement | null;
  /** Normalised pan, relative to the photo window. */
  offset: { x: number; y: number };
  zoom: number;
  rotate: number;
  slots: Record<string, string>;
  stickers: Sticker[];
};

/** Photo window per frame, in fractions of the plate. */
const WINDOWS: Record<FrameId, { x: number; y: number; w: number; h: number }> = {
  "cover-girl": { x: 0, y: 0, w: 1, h: 1 },
  wanted: { x: 0.12, y: 0.2, w: 0.76, h: 0.52 },
  "birthday-club": { x: 0.08, y: 0.07, w: 0.84, h: 0.68 },
  certified: { x: 0.12, y: 0.1, w: 0.76, h: 0.72 },
  "dragon-files": { x: 0.05, y: 0.22, w: 0.3, h: 0.62 },
};

export function photoWindow(frame: FrameId, W: number, H: number) {
  const win = WINDOWS[frame];
  return { x: win.x * W, y: win.y * H, w: win.w * W, h: win.h * H };
}

function drawSticker(ctx: CanvasRenderingContext2D, s: Sticker, W: number, H: number) {
  const r = 0.045 * Math.min(W, H) * s.scale;
  ctx.save();
  ctx.translate(s.x * W, s.y * H);
  ctx.rotate(s.rot);

  switch (s.kind) {
    case "star":
      ctx.fillStyle = "#b49a65";
      ctx.beginPath();
      for (let i = 0; i < 5; i += 1) {
        const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
        const a2 = a + Math.PI / 5;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        ctx.lineTo(Math.cos(a2) * r * 0.44, Math.sin(a2) * r * 0.44);
      }
      ctx.closePath();
      ctx.fill();
      break;
    case "heart":
      ctx.fillStyle = "#7b2fb5";
      ctx.beginPath();
      ctx.moveTo(0, r * 0.85);
      ctx.bezierCurveTo(r * 1.35, -r * 0.2, r * 0.5, -r, 0, -r * 0.32);
      ctx.bezierCurveTo(-r * 0.5, -r, -r * 1.35, -r * 0.2, 0, r * 0.85);
      ctx.fill();
      break;
    case "egg":
      ctx.strokeStyle = "#111111";
      ctx.lineWidth = Math.max(1.5, r * 0.09);
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.bezierCurveTo(r * 0.85, -r * 0.1, r * 0.72, r, 0, r);
      ctx.bezierCurveTo(-r * 0.72, r, -r * 0.85, -r * 0.1, 0, -r);
      ctx.stroke();
      ctx.fillStyle = "rgba(123,47,181,0.85)";
      ctx.beginPath();
      ctx.arc(0, r * 0.25, r * 0.22, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "bow":
      ctx.fillStyle = "#c2558f";
      ctx.beginPath();
      ctx.ellipse(-r * 0.5, 0, r * 0.52, r * 0.34, -0.4, 0, Math.PI * 2);
      ctx.ellipse(r * 0.5, 0, r * 0.52, r * 0.34, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#8d4f5f";
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.17, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "sparkle":
      ctx.strokeStyle = "#f4f0e8";
      ctx.lineWidth = Math.max(1.4, r * 0.12);
      [0, Math.PI / 2, Math.PI / 4, -Math.PI / 4].forEach((a, i) => {
        const len = i < 2 ? r : r * 0.55;
        ctx.beginPath();
        ctx.moveTo(-Math.cos(a) * len, -Math.sin(a) * len);
        ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
        ctx.stroke();
      });
      break;
    case "ring":
      ctx.strokeStyle = "#111111";
      ctx.lineWidth = Math.max(1.4, r * 0.1);
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
      ctx.stroke();
      break;
  }
  ctx.restore();
}

function drawPhoto(
  ctx: CanvasRenderingContext2D,
  state: BoothState,
  win: { x: number; y: number; w: number; h: number },
  rounded = false,
) {
  ctx.save();
  ctx.beginPath();
  if (rounded) {
    // An arched window — top corners rounded, like a gallery frame.
    const r = win.w / 2;
    ctx.moveTo(win.x, win.y + win.h);
    ctx.lineTo(win.x, win.y + r);
    ctx.arc(win.x + r, win.y + r, r, Math.PI, 0);
    ctx.lineTo(win.x + win.w, win.y + win.h);
    ctx.closePath();
  } else {
    ctx.rect(win.x, win.y, win.w, win.h);
  }
  ctx.clip();

  // Cream ground inside the window, so an empty booth still looks designed.
  ctx.fillStyle = "#e4ded2";
  ctx.fillRect(win.x, win.y, win.w, win.h);

  const img = state.image;
  if (img && img.naturalWidth > 0) {
    const cover = Math.max(win.w / img.naturalWidth, win.h / img.naturalHeight);
    const scale = cover * state.zoom;
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const cx = win.x + win.w / 2 + state.offset.x * win.w;
    const cy = win.y + win.h / 2 + state.offset.y * win.h;

    ctx.translate(cx, cy);
    ctx.rotate((state.rotate * Math.PI) / 180);
    ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
  } else {
    ctx.strokeStyle = "rgba(17,17,17,0.25)";
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 8]);
    ctx.strokeRect(win.x + 10, win.y + 10, win.w - 20, win.h - 20);
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(17,17,17,0.45)";
    ctx.textAlign = "center";
    ctx.font = `${Math.max(10, win.w * 0.028)}px ${monoStack()}`;
    ctx.fillText("ADD A PHOTOGRAPH", win.x + win.w / 2, win.y + win.h / 2);
  }
  ctx.restore();
}

/** Fits text to a width by stepping the size down — never squashed glyphs. */
function fit(
  ctx: CanvasRenderingContext2D,
  text: string,
  max: number,
  startSize: number,
  weightFamily: (size: number) => string,
) {
  let size = startSize;
  ctx.font = weightFamily(size);
  while (ctx.measureText(text).width > max && size > 8) {
    size -= 1;
    ctx.font = weightFamily(size);
  }
  return size;
}

export function renderBooth(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  state: BoothState,
) {
  const serif = serifStack();
  const mono = monoStack();
  const win = photoWindow(state.frame, W, H);
  const slot = (id: string) => state.slots[id] ?? "";

  ctx.clearRect(0, 0, W, H);
  ctx.textBaseline = "alphabetic";

  switch (state.frame) {
    /* ---------------------------------------------------- THE COVER GIRL */
    case "cover-girl": {
      drawPhoto(ctx, state, win);

      // Scrims top and bottom so type survives any photograph.
      const top = ctx.createLinearGradient(0, 0, 0, H * 0.3);
      top.addColorStop(0, "rgba(10,10,10,0.5)");
      top.addColorStop(1, "rgba(10,10,10,0)");
      ctx.fillStyle = top;
      ctx.fillRect(0, 0, W, H * 0.3);

      const bottom = ctx.createLinearGradient(0, H, 0, H * 0.62);
      bottom.addColorStop(0, "rgba(10,10,10,0.62)");
      bottom.addColorStop(1, "rgba(10,10,10,0)");
      ctx.fillStyle = bottom;
      ctx.fillRect(0, H * 0.62, W, H * 0.38);

      ctx.fillStyle = "#f6f2e9";
      ctx.textAlign = "center";
      const mast = slot("masthead").toUpperCase();
      const mastSize = fit(ctx, mast, W * 0.86, W * 0.34, (s) => `300 ${s}px ${serif}`);
      ctx.fillText(mast, W / 2, H * 0.145);

      ctx.textAlign = "left";
      ctx.font = `${Math.max(9, W * 0.022)}px ${mono}`;
      ctx.globalAlpha = 0.85;
      ctx.fillText(slot("kicker").toUpperCase(), W * 0.07, H * 0.185);
      ctx.textAlign = "right";
      ctx.fillText("NO. 001", W * 0.93, H * 0.185);
      ctx.globalAlpha = 1;

      ctx.textAlign = "left";
      const head = slot("headline").toUpperCase();
      const headSize = fit(ctx, head, W * 0.86, W * 0.14, (s) => `300 ${s}px ${serif}`);
      ctx.fillText(head, W * 0.07, H * 0.9);
      ctx.font = `${Math.max(9, W * 0.021)}px ${mono}`;
      ctx.globalAlpha = 0.8;
      ctx.fillText("PHOTOGRAPHED FOR THE BIRTHDAY ISSUE", W * 0.07, H * 0.94);
      ctx.globalAlpha = 1;

      ctx.strokeStyle = "rgba(246,242,233,0.5)";
      ctx.lineWidth = Math.max(1, W * 0.004);
      ctx.strokeRect(W * 0.04, H * 0.03, W * 0.92, H * 0.94);
      void mastSize;
      void headSize;
      break;
    }

    /* --------------------------------------------------------- WANTED */
    case "wanted": {
      ctx.fillStyle = "#e6dcc4";
      ctx.fillRect(0, 0, W, H);

      // Aged blotches, deterministic so the export matches the preview.
      for (let i = 0; i < 26; i += 1) {
        const seed = (i * 97) % 101;
        ctx.fillStyle = `rgba(120,96,56,${0.03 + (seed % 5) * 0.012})`;
        ctx.beginPath();
        ctx.arc((seed / 101) * W, ((seed * 7) % 101) / 101 * H, W * (0.02 + (seed % 7) * 0.012), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "#1a1410";
      ctx.textAlign = "center";
      const wantedSize = fit(ctx, "WANTED", W * 0.8, W * 0.26, (s) => `300 ${s}px ${serif}`);
      ctx.fillText("WANTED", W / 2, H * 0.14);
      ctx.font = `${Math.max(9, W * 0.024)}px ${mono}`;
      ctx.fillText("BY ORDER OF THE BIRTHDAY COMMITTEE", W / 2, H * 0.175);

      ctx.fillStyle = "#1a1410";
      ctx.fillRect(win.x - W * 0.012, win.y - W * 0.012, win.w + W * 0.024, win.h + W * 0.024);
      drawPhoto(ctx, state, win);

      ctx.fillStyle = "#1a1410";
      ctx.textAlign = "center";
      ctx.font = `${Math.max(10, W * 0.028)}px ${mono}`;
      ctx.fillText("WANTED FOR", W / 2, H * 0.79);
      const crime = slot("crime").toUpperCase();
      fit(ctx, crime, W * 0.84, W * 0.1, (s) => `300 ${s}px ${serif}`);
      ctx.fillText(crime, W / 2, H * 0.85);

      ctx.font = `${Math.max(10, W * 0.028)}px ${mono}`;
      ctx.fillText("REWARD", W / 2, H * 0.91);
      const reward = slot("reward").toUpperCase();
      fit(ctx, reward, W * 0.84, W * 0.075, (s) => `300 ${s}px ${serif}`);
      ctx.fillText(reward, W / 2, H * 0.96);
      void wantedSize;
      break;
    }

    /* -------------------------------------------------- BIRTHDAY CLUB */
    case "birthday-club": {
      ctx.fillStyle = "#faf7f0";
      ctx.fillRect(0, 0, W, H);
      drawPhoto(ctx, state, win);

      // Photo-strip perforations.
      ctx.fillStyle = "#e3ddd0";
      const holes = 9;
      for (let i = 0; i < holes; i += 1) {
        const y = H * 0.07 + ((i + 0.5) / holes) * H * 0.68;
        ctx.beginPath();
        ctx.arc(W * 0.04, y, W * 0.011, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(W * 0.96, y, W * 0.011, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "#111111";
      ctx.textAlign = "left";
      ctx.font = `${Math.max(9, W * 0.023)}px ${mono}`;
      ctx.fillText(slot("caption").toUpperCase(), W * 0.08, H * 0.82);
      ctx.fillRect(W * 0.08, H * 0.845, W * 0.84, 1);

      ctx.textAlign = "left";
      fit(ctx, "BIRTHDAY", W * 0.84, W * 0.17, (s) => `300 ${s}px ${serif}`);
      ctx.fillText("BIRTHDAY", W * 0.08, H * 0.93);
      ctx.textAlign = "right";
      ctx.font = `${Math.max(9, W * 0.021)}px ${mono}`;
      ctx.globalAlpha = 0.6;
      ctx.fillText("ELIZABETH ✦ 001", W * 0.92, H * 0.96);
      ctx.globalAlpha = 1;
      break;
    }

    /* ----------------------------------------------------- CERTIFIED */
    case "certified": {
      ctx.fillStyle = "#111111";
      ctx.fillRect(0, 0, W, H);

      const word = slot("word").toUpperCase();
      ctx.fillStyle = "#f4f0e8";
      ctx.textAlign = "center";
      fit(ctx, word, W * 0.96, W * 0.52, (s) => `300 ${s}px ${serif}`);
      ctx.globalAlpha = 0.9;
      ctx.fillText(word, W / 2, H * 0.68);
      ctx.globalAlpha = 1;

      // The photo sits in an arch, over the word.
      drawPhoto(ctx, state, win, true);

      ctx.fillStyle = "#f4f0e8";
      ctx.font = `${Math.max(9, W * 0.021)}px ${mono}`;
      ctx.fillText(slot("sub").toUpperCase(), W / 2, H * 0.93);
      ctx.strokeStyle = "rgba(200,162,255,0.9)";
      ctx.lineWidth = Math.max(1, W * 0.003);
      ctx.beginPath();
      ctx.moveTo(W * 0.3, H * 0.955);
      ctx.lineTo(W * 0.7, H * 0.955);
      ctx.stroke();
      break;
    }

    /* -------------------------------------------------- DRAGON FILES */
    case "dragon-files": {
      ctx.fillStyle = "#efece4";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#7b2fb5";
      ctx.fillRect(0, 0, W, H * 0.13);

      ctx.fillStyle = "#f4f0e8";
      ctx.textAlign = "left";
      ctx.font = `${Math.max(10, W * 0.018)}px ${mono}`;
      ctx.fillText("THE DRAGON FILES — SPECIMEN RECORD", W * 0.05, H * 0.082);

      drawPhoto(ctx, state, win);
      ctx.strokeStyle = "rgba(17,17,17,0.5)";
      ctx.lineWidth = 1;
      ctx.strokeRect(win.x, win.y, win.w, win.h);

      const fields: [string, string][] = [
        ["SPECIMEN", slot("name")],
        ["CLASSIFICATION", slot("classification")],
        ["CLEARANCE", slot("clearance")],
        ["STATUS", "PROTECTED, LOUDLY"],
      ];

      let y = H * 0.27;
      fields.forEach(([key, value]) => {
        ctx.fillStyle = "rgba(17,17,17,0.5)";
        ctx.font = `${Math.max(8, W * 0.014)}px ${mono}`;
        ctx.fillText(key, W * 0.4, y);
        ctx.fillStyle = "#111111";
        fit(ctx, value.toUpperCase(), W * 0.54, W * 0.055, (s) => `300 ${s}px ${serif}`);
        ctx.fillText(value.toUpperCase(), W * 0.4, y + H * 0.07);
        ctx.fillStyle = "rgba(17,17,17,0.18)";
        ctx.fillRect(W * 0.4, y + H * 0.095, W * 0.55, 1);
        y += H * 0.15;
      });

      // Barcode, derived from the specimen name so it's stable.
      const name = slot("name") || "DRAGON";
      let bx = W * 0.4;
      for (let i = 0; i < 46; i += 1) {
        const w = ((name.charCodeAt(i % name.length) + i * 7) % 4) + 1;
        ctx.fillStyle = i % 2 ? "transparent" : "#111111";
        ctx.fillRect(bx, H * 0.86, w, H * 0.06);
        bx += w + 2;
      }
      break;
    }
  }

  state.stickers.forEach((s) => drawSticker(ctx, s, W, H));
}

export async function exportBooth(state: BoothState, ratio: number) {
  const W = 1400;
  const H = Math.round(W / ratio);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  renderBooth(ctx, W, H, state);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Export failed");
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `elizabeth-booth-${state.frame}-${Date.now()}.png`;
  link.click();
  URL.revokeObjectURL(url);
}
