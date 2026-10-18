/**
 * next/font rewrites family names at build time, so canvas can't be handed
 * "Cormorant Garamond" directly. We read the real stack back off the DOM once
 * and cache it.
 */
const cache = new Map<string, string>();

export function fontStack(className: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const hit = cache.get(className);
  if (hit) return hit;
  const probe = document.createElement("span");
  probe.className = className;
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  document.body.appendChild(probe);
  const stack = getComputedStyle(probe).fontFamily || fallback;
  probe.remove();
  cache.set(className, stack);
  return stack;
}

export const serifStack = () => fontStack("display", "Georgia, serif");
export const monoStack = () => fontStack("label", "monospace");
