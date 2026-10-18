import { birthdayConfig } from "@/content/birthday";
import type { QuizResult } from "@/content/quiz";
import { monoStack, serifStack } from "@/lib/canvasFont";

/** The collectible: a typeset result card, 1000 x 1400. */
export async function exportResultCard(result: QuizResult) {
  const W = 1000;
  const H = 1400;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  const serif = serifStack();
  const mono = monoStack();
  const { bg, fg, accent } = result.palette;

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.strokeRect(44, 44, W - 88, H - 88);

  ctx.fillStyle = fg;
  ctx.textAlign = "left";
  ctx.font = `12px ${mono}`;
  ctx.globalAlpha = 0.7;
  ctx.fillText("ELIZABETH'S UNIVERSE — THE CHAOS INDEX", 88, 118);
  ctx.textAlign = "right";
  ctx.fillText(birthdayConfig.displayName.toUpperCase(), W - 88, 118);
  ctx.globalAlpha = 1;

  // Title, wrapped by hand so the card never clips.
  ctx.textAlign = "left";
  const words = result.title.split(" ");
  const lines: string[] = [];
  let line = "";
  ctx.font = `600 96px ${serif}`;
  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > W - 176 && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);

  let y = 300;
  lines.forEach((l) => {
    ctx.fillText(l, 88, y);
    y += 104;
  });

  ctx.fillStyle = accent;
  ctx.font = `500 italic 42px ${serif}`;
  ctx.fillText(result.subtitle, 88, y + 14);

  // Description.
  ctx.fillStyle = fg;
  ctx.globalAlpha = 0.82;
  ctx.font = `24px ${mono.includes("mono") ? serif : serif}`;
  const descWords = result.description.split(" ");
  let dy = y + 96;
  let dline = "";
  descWords.forEach((word) => {
    const test = dline ? `${dline} ${word}` : word;
    if (ctx.measureText(test).width > W - 176 && dline) {
      ctx.fillText(dline, 88, dy);
      dy += 38;
      dline = word;
    } else {
      dline = test;
    }
  });
  if (dline) ctx.fillText(dline, 88, dy);
  ctx.globalAlpha = 1;

  // Trait meters.
  let ty = Math.max(dy + 110, 1010);
  result.traits.forEach((trait) => {
    ctx.fillStyle = fg;
    ctx.globalAlpha = 0.6;
    ctx.font = `12px ${mono}`;
    ctx.fillText(trait.label.toUpperCase(), 88, ty);
    ctx.textAlign = "right";
    ctx.fillText(`${trait.value}`, W - 88, ty);
    ctx.textAlign = "left";
    ctx.globalAlpha = 0.18;
    ctx.fillRect(88, ty + 12, W - 176, 3);
    ctx.globalAlpha = 1;
    ctx.fillStyle = accent;
    ctx.fillRect(88, ty + 12, ((W - 176) * trait.value) / 100, 3);
    ty += 62;
  });

  ctx.fillStyle = fg;
  ctx.globalAlpha = 0.5;
  ctx.font = `11px ${mono}`;
  ctx.textAlign = "center";
  ctx.fillText("A LITTLE BIRTHDAY QUIZ", W / 2, H - 88);
  ctx.globalAlpha = 1;

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Export failed");
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `elizabeth-chaos-${result.id}.png`;
  link.click();
  URL.revokeObjectURL(url);
}
