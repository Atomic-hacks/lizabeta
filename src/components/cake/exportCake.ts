import { birthdayConfig } from "@/content/birthday";
import { frostings, sponges, type CakeConfig } from "@/content/cake";
import { monoStack, serifStack } from "@/lib/canvasFont";

function label(list: { id: string; name: string }[], id: string): string {
  return list.find((item) => item.id === id)?.name ?? id;
}

/** Composites the live preview into a shareable, properly typeset plate. */
export async function exportCakeImage(source: HTMLCanvasElement, config: CakeConfig) {
  const W = 1200;
  const H = 1500;
  const out = document.createElement("canvas");
  out.width = W;
  out.height = H;
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  const serif = serifStack();
  const mono = monoStack();

  ctx.fillStyle = "#faf7ff";
  ctx.fillRect(0, 0, W, H);

  /* Masthead */
  ctx.fillStyle = "#140d24";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = `600 46px ${serif}`;
  ctx.fillText(birthdayConfig.displayName, 72, 104);
  ctx.font = `12px ${mono}`;
  ctx.globalAlpha = 0.65;
  ctx.fillText("ELIZABETH'S UNIVERSE — THE CAKE LAB", 72, 134);
  ctx.textAlign = "right";
  ctx.fillText(`CH. 07 / ${birthdayConfig.birthdayYear}`, W - 72, 134);
  ctx.globalAlpha = 1;

  ctx.fillRect(72, 160, W - 144, 1);

  /* The cake itself, letterboxed into the plate */
  const frame = { x: 72, y: 200, w: W - 144, h: 760 };
  ctx.fillStyle = "#f1e8ff";
  ctx.fillRect(frame.x, frame.y, frame.w, frame.h);

  const ratio = Math.min(frame.w / source.width, frame.h / source.height);
  const dw = source.width * ratio;
  const dh = source.height * ratio;
  ctx.drawImage(
    source,
    frame.x + (frame.w - dw) / 2,
    frame.y + (frame.h - dh) / 2,
    dw,
    dh,
  );

  /* Headline */
  ctx.fillStyle = "#140d24";
  ctx.textAlign = "left";
  ctx.font = `600 96px ${serif}`;
  ctx.fillText("Her cake.", 72, 1090);
  ctx.font = `300 italic 42px ${serif}`;
  ctx.fillStyle = "#7b2fb5";
  ctx.fillText(config.message.slice(0, 34) || "Happy birthday", 72, 1148);

  /* Spec sheet, set as two columns of label/value pairs */
  const spec: [string, string][] = [
    ["SHAPE", config.shape.toUpperCase()],
    ["TIERS", String(config.tiers)],
    ["SPONGE", label(sponges, config.sponge).toUpperCase()],
    ["FROSTING", label(frostings, config.frosting).toUpperCase()],
    ["CANDLES", `${config.candleCount} × ${config.candleStyle.toUpperCase()}`],
    [
      "DECORATION",
      config.decorations.length ? config.decorations.join(", ").toUpperCase() : "NONE, BOLDLY",
    ],
  ];

  ctx.fillStyle = "#140d24";
  spec.forEach(([key, value], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 72 + col * ((W - 144) / 2);
    const y = 1230 + row * 78;
    ctx.globalAlpha = 0.18;
    ctx.fillRect(x, y - 34, (W - 144) / 2 - 24, 1);
    ctx.globalAlpha = 0.55;
    ctx.font = `11px ${mono}`;
    ctx.fillText(key, x, y - 12);
    ctx.globalAlpha = 1;
    ctx.font = `300 28px ${serif}`;
    ctx.fillText(value, x, y + 20);
  });

  ctx.globalAlpha = 0.5;
  ctx.font = `11px ${mono}`;
  ctx.textAlign = "center";
  ctx.fillText("BUILT BY HAND IN THE CAKE LAB — NOT EDIBLE, REGRETTABLY", W / 2, H - 48);
  ctx.globalAlpha = 1;

  const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Export failed");

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `elizabeth-cake-${Date.now()}.png`;
  link.click();
  URL.revokeObjectURL(url);
}
