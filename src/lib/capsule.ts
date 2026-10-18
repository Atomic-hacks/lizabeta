/* Shared shape + validation for capsule entries. Used by the seal and append
 * routes so both enforce exactly the same limits, server-side. */

export const CAPSULE_LIMITS = {
  letter: 8000,
  hope: 280,
  memory: 2500,
  prediction: 600,
  /** ~1.4MB of base64. */
  photo: 2_000_000,
};

export type CapsuleEntry = {
  written_at: string;
  letter: string;
  hopes: string[];
  memory: string;
  prediction: string;
  photo: string | null;
};

function str(value: unknown, max: number): string {
  return typeof value === "string" ? value.slice(0, max) : "";
}

/** Throws with a readable message if the entry is unusable. */
export function normaliseEntry(body: unknown): CapsuleEntry {
  const input = (body ?? {}) as Record<string, unknown>;
  const letter = str(input.letter, CAPSULE_LIMITS.letter);
  const hopes = Array.isArray(input.hopes)
    ? input.hopes.slice(0, 3).map((h) => str(h, CAPSULE_LIMITS.hope))
    : [];
  const memory = str(input.memory, CAPSULE_LIMITS.memory);
  const prediction = str(input.prediction, CAPSULE_LIMITS.prediction);
  const photo = str(input.photo, CAPSULE_LIMITS.photo + 1);

  if (!letter.trim() && !memory.trim() && !prediction.trim() && !hopes.some((h) => h.trim())) {
    throw new Error("There's nothing in this one yet.");
  }
  if (photo && !/^data:image\/(png|jpeg|webp);base64,/.test(photo)) {
    throw new Error("That photograph format isn't supported.");
  }
  if (photo.length > CAPSULE_LIMITS.photo) {
    throw new Error("That photograph is too large.");
  }

  return {
    written_at: new Date().toISOString(),
    letter,
    hopes,
    memory,
    prediction,
    photo: photo || null,
  };
}
