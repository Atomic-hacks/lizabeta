/** One-time WebGL probe. The cake studio uses it to choose 3D or the 2D lab. */
let cached: boolean | null = null;

export function hasWebGL(): boolean {
  if (cached !== null) return cached;
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");
    cached = Boolean(gl);
  } catch {
    cached = false;
  }
  return cached;
}
