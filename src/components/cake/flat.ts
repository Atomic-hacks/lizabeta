import { frostings, sponges, type CakeConfig } from "@/content/cake";

/* ---------------------------------------------------------------------------
 * The 2D lab. Everything the 3D studio can build, drawn with the Canvas API,
 * so a device without WebGL still gets a real cake builder rather than an
 * apology. Also used as the export source in fallback mode.
 * ------------------------------------------------------------------------- */

function mix(a: string, b: string, t: number): string {
  const pa = [parseInt(a.slice(1, 3), 16), parseInt(a.slice(3, 5), 16), parseInt(a.slice(5, 7), 16)];
  const pb = [parseInt(b.slice(1, 3), 16), parseInt(b.slice(3, 5), 16), parseInt(b.slice(5, 7), 16)];
  const out = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `#${out.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function shade(hex: string, amount: number): string {
  return mix(hex, amount > 0 ? "#ffffff" : "#000000", Math.abs(amount));
}

function tierPath(
  ctx: CanvasRenderingContext2D,
  shape: CakeConfig["shape"],
  cx: number,
  top: number,
  w: number,
  h: number,
) {
  ctx.beginPath();
  if (shape === "square") {
    ctx.rect(cx - w / 2, top, w, h);
    return;
  }
  if (shape === "heart") {
    // A heart read from the front is a tier with two shoulders.
    const left = cx - w / 2;
    const right = cx + w / 2;
    ctx.moveTo(left, top + h * 0.3);
    ctx.bezierCurveTo(left, top - h * 0.18, cx - w * 0.08, top - h * 0.1, cx, top + h * 0.12);
    ctx.bezierCurveTo(cx + w * 0.08, top - h * 0.1, right, top - h * 0.18, right, top + h * 0.3);
    ctx.lineTo(right, top + h);
    ctx.lineTo(left, top + h);
    ctx.closePath();
    return;
  }
  // Round: straight sides with an elliptical top and bottom.
  ctx.moveTo(cx - w / 2, top + h * 0.12);
  ctx.lineTo(cx - w / 2, top + h * 0.88);
  ctx.ellipse(cx, top + h * 0.88, w / 2, h * 0.12, 0, Math.PI, 0, true);
  ctx.lineTo(cx + w / 2, top + h * 0.12);
  ctx.ellipse(cx, top + h * 0.12, w / 2, h * 0.12, 0, 0, Math.PI, true);
  ctx.closePath();
}

function decorate(
  ctx: CanvasRenderingContext2D,
  kind: CakeConfig["decorations"][number],
  x: number,
  y: number,
  scale: number,
  seed: number,
) {
  const r = 7 * scale;
  ctx.save();
  ctx.translate(x, y);

  switch (kind) {
    case "strawberries":
      ctx.fillStyle = "#c0243a";
      ctx.beginPath();
      ctx.moveTo(0, r * 1.4);
      ctx.quadraticCurveTo(r, 0, 0, -r * 1.2);
      ctx.quadraticCurveTo(-r, 0, 0, r * 1.4);
      ctx.fill();
      ctx.fillStyle = "#4b5d2a";
      ctx.fillRect(-r * 0.5, -r * 1.4, r, r * 0.3);
      break;
    case "cherries":
      ctx.fillStyle = "#8e1026";
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.95, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#4b5d2a";
      ctx.lineWidth = 1.6 * scale;
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.quadraticCurveTo(r * 0.8, -r * 2.2, r * 1.4, -r * 1.6);
      ctx.stroke();
      break;
    case "sprinkles":
      ctx.rotate((seed % 7) * 0.9);
      ctx.fillStyle = ["#f2b5c4", "#f6e07a", "#9fd3c7", "#ffffff", "#c86b8a"][seed % 5];
      ctx.fillRect(-r * 0.8, -r * 0.22, r * 1.6, r * 0.44);
      break;
    case "pearls":
      ctx.fillStyle = "#fbf6ea";
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.52, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.beginPath();
      ctx.arc(r * 0.12, r * 0.12, r * 0.52, 0.6, 2.2);
      ctx.fill();
      break;
    case "stars":
    case "hearts":
    case "bows":
    case "flowers":
    default: {
      ctx.fillStyle =
        kind === "stars" ? "#e2bd6a" : kind === "hearts" ? "#c2558f" : kind === "bows" ? "#7b2fb5" : "#f4dce4";
      if (kind === "stars") {
        ctx.beginPath();
        for (let i = 0; i < 5; i += 1) {
          const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
          const a2 = a + Math.PI / 5;
          ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
          ctx.lineTo(Math.cos(a2) * r * 0.45, Math.sin(a2) * r * 0.45);
        }
        ctx.closePath();
        ctx.fill();
      } else if (kind === "hearts") {
        ctx.beginPath();
        ctx.moveTo(0, r * 0.9);
        ctx.bezierCurveTo(r * 1.3, -r * 0.2, r * 0.5, -r, 0, -r * 0.35);
        ctx.bezierCurveTo(-r * 0.5, -r, -r * 1.3, -r * 0.2, 0, r * 0.9);
        ctx.fill();
      } else if (kind === "bows") {
        ctx.beginPath();
        ctx.ellipse(-r * 0.5, 0, r * 0.5, r * 0.34, -0.4, 0, Math.PI * 2);
        ctx.ellipse(r * 0.5, 0, r * 0.5, r * 0.34, 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        for (let i = 0; i < 5; i += 1) {
          const a = (i / 5) * Math.PI * 2;
          ctx.beginPath();
          ctx.arc(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5, r * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = "#d9b24c";
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.32, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

export type FlatState = { lit: boolean; blown: boolean; flicker: number };

/** Draws the whole cake into any 2D context sized w x h. */
export function drawFlatCake(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  config: CakeConfig,
  state: FlatState,
  background = "#faf7ff",
) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, w, h);

  const scale = Math.min(w, h) / 520;
  const cx = w / 2;
  const baseY = h * 0.78;

  const spongeColor = sponges.find((s) => s.id === config.sponge)?.hex ?? "#f2e3c2";
  const flavour = frostings.find((f) => f.id === config.frosting)?.hex ?? "#f6ecd9";
  const frosting = mix(flavour, config.color, 0.72);

  /* Stand */
  ctx.fillStyle = "#e8dff5";
  ctx.beginPath();
  ctx.ellipse(cx, baseY + 10 * scale, 180 * scale, 22 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(cx - 26 * scale, baseY + 18 * scale, 52 * scale, 42 * scale);
  ctx.beginPath();
  ctx.ellipse(cx, baseY + 62 * scale, 70 * scale, 14 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  /* Tiers, bottom up */
  const tierH = 78 * scale;
  for (let level = 0; level < config.tiers; level += 1) {
    const tw = (300 - level * 68) * scale;
    const top = baseY - (level + 1) * tierH * 0.94;

    // Sponge peeking out below the frosting.
    tierPath(ctx, config.shape, cx, top + 6 * scale, tw * 0.99, tierH);
    ctx.fillStyle = spongeColor;
    ctx.fill();

    // Frosting body with a soft vertical gradient.
    const grad = ctx.createLinearGradient(cx - tw / 2, top, cx + tw / 2, top + tierH);
    grad.addColorStop(0, shade(frosting, 0.16));
    grad.addColorStop(0.55, frosting);
    grad.addColorStop(1, shade(frosting, -0.14));
    tierPath(ctx, config.shape, cx, top, tw, tierH * 0.84);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = shade(frosting, -0.3);
    ctx.lineWidth = 1 * scale;
    ctx.stroke();

    // Drips over the sponge seam.
    ctx.fillStyle = shade(frosting, 0.08);
    for (let d = 0; d < 7; d += 1) {
      const dx = cx - tw / 2 + ((d + 0.5) / 7) * tw;
      const depth = (10 + ((d * 37) % 16)) * scale;
      ctx.beginPath();
      ctx.moveTo(dx - 11 * scale, top + tierH * 0.8);
      ctx.quadraticCurveTo(dx, top + tierH * 0.8 + depth, dx + 11 * scale, top + tierH * 0.8);
      ctx.fill();
    }

    // Decorations around the rim.
    if (config.decorations.length) {
      const count = 7;
      for (let i = 0; i < count; i += 1) {
        const dx = cx - tw / 2 + ((i + 0.5) / count) * tw;
        decorate(
          ctx,
          config.decorations[(i + level) % config.decorations.length],
          dx,
          top + 4 * scale,
          scale,
          i + level * 3,
        );
      }
    }
  }

  /* Message on the top tier */
  const topTierY = baseY - config.tiers * tierH * 0.94;
  if (config.message.trim()) {
    ctx.fillStyle = "#7b2fb5";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const size = Math.max(11, (config.message.length > 20 ? 15 : 20) * scale);
    ctx.font = `300 ${size}px "Cormorant Garamond", Georgia, serif`;
    ctx.fillText(config.message.slice(0, 34), cx, topTierY + 44 * scale);
  }

  /* Candles */
  const n = Math.max(1, Math.min(config.candleCount, 12));
  const spread = (300 - (config.tiers - 1) * 68) * scale * 0.72;
  for (let i = 0; i < n; i += 1) {
    const x = cx - spread / 2 + ((i + 0.5) / n) * spread;
    const candleH = (config.candleStyle === "sparkler" ? 56 : config.candleStyle === "taper" ? 48 : 36) * scale;
    const y = topTierY + 8 * scale;

    ctx.fillStyle = config.candleColor;
    if (config.candleStyle === "twist") {
      ctx.save();
      ctx.strokeStyle = config.candleColor;
      ctx.lineWidth = 5 * scale;
      ctx.beginPath();
      for (let t = 0; t <= 1; t += 0.08) {
        const px = x + Math.sin(t * 9) * 3 * scale;
        ctx.lineTo(px, y - t * candleH);
      }
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.fillRect(x - 3 * scale, y - candleH, 6 * scale, candleH);
    }

    if (state.lit || state.blown) {
      const rise = state.blown ? state.flicker * 36 * scale : 0;
      const alpha = state.blown ? Math.max(0, 1 - state.flicker) : 1;
      const flameY = y - candleH - 7 * scale - rise;
      const wobble = state.blown ? 0 : Math.sin(state.flicker * 9 + i) * 1.6 * scale;

      ctx.save();
      ctx.globalAlpha = alpha;
      const glow = ctx.createRadialGradient(x, flameY, 0, x, flameY, 26 * scale);
      glow.addColorStop(0, "rgba(255,196,112,0.55)");
      glow.addColorStop(1, "rgba(255,196,112,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, flameY, 26 * scale, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffce7a";
      ctx.beginPath();
      ctx.moveTo(x + wobble, flameY - 11 * scale);
      ctx.quadraticCurveTo(x + 5 * scale + wobble, flameY, x + wobble, flameY + 7 * scale);
      ctx.quadraticCurveTo(x - 5 * scale + wobble, flameY, x + wobble, flameY - 11 * scale);
      ctx.fill();
      ctx.restore();
    }
  }
}
