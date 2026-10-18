/* The Secret Dragon Egg Hunt.
 * Five eggs, each parked in a different chapter. Every egg is a real focusable
 * button sized for touch, so it is findable on a phone — hidden, not hostile. */

import type { ChapterId } from "./birthday";

export type Egg = {
  id: string;
  number: string;
  chapter: ChapterId;
  /** Shown in the discovery toast. */
  found: string;
  /** Shown in the collection drawer before it's found. */
  hint: string;
};

export const eggs: Egg[] = [
  { id: "egg-1", number: "01", chapter: "cover", found: "Under the scroll cue", hint: "The very bottom of the very first screen." },
  { id: "egg-2", number: "02", chapter: "room", found: "In the plant, obviously", hint: "Something is growing in the corner of your room." },
  { id: "egg-3", number: "03", chapter: "encyclopedia", found: "In the margin notes", hint: "The researchers left a footnote in the files." },
  { id: "egg-4", number: "04", chapter: "awards", found: "Under the podium", hint: "Someone has to sweep up after the ceremony." },
  { id: "egg-5", number: "05", chapter: "radio", found: "On the B-side", hint: "Records have two sides." },
];

export const EGG_STORAGE_KEY = "elizabeth.eggs.v1";

/** The reward. Write this one properly — she earned it. */
export const secretChapter = {
  label: "the hidden one",
  title: "you found all five.",
  subtitle: "of course you did.",
  paragraphs: [
    "Nobody else was finding these. You are relentlessly nosy and it finally paid off.",
    "Three years, a CODM group, two breaks in contact, and you still ended up here clicking on a plant. Worth it.",
  ],
  signoff: "now go and have an unreasonable birthday, dragon.",
};
