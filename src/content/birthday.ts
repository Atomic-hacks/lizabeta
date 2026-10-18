/* ---------------------------------------------------------------------------
 * EDIT ME FIRST.
 * Everything personal about this site lives in src/content/*. Nothing in
 * src/components needs touching to make this hers.
 *
 * A note on names: she is ELIZABETH. "Dragon" is one person's nickname for
 * her, so it shows up only where it reads as affection or as a joke — the
 * files, the quiz, the egg hunt. It is never the name of the site.
 * ------------------------------------------------------------------------- */

export const birthdayConfig = {
  displayName: "Elizabeth",
  /** Used sparingly, in the playful chapters. */
  nickname: "Dragon",
  /** Shown in the masthead and the colophon. */
  universeName: "Elizabeth's Universe",
  issueNumber: "001",
  volume: "CH. 01",
  birthdayYear: 2026,
  /** ISO date, e.g. "2026-03-14". Leave "" to omit it. */
  birthdayDate: "",
  /** The cover. The video is portrait (480x624) and plays muted on a loop;
   *  the still is its poster and the reduced-motion fallback. */
  heroVideo: "/videos/hero-portrait.mp4",
  heroImage: "/images/elizabeth/slay-1.jpg",
  heroImageAlt: "Elizabeth",
  coverHeadline: "ELIZABETH",
  coverSecondary: "An entire universe, made for one person.",
  tagline: "An entire universe, made for one person.",
  /** Credit line in the colophon. */
  madeBy: "",
} as const;

export type ChapterId =
  | "cover"
  | "intro"
  | "room"
  | "archives"
  | "encyclopedia"
  | "awards"
  | "cake"
  | "booth"
  | "chaos"
  | "radio"
  | "wish"
  | "capsule"
  | "letter"
  | "colophon";

export type ChapterTheme = {
  bg: string;
  fg: string;
  accent: string;
  /** Noise is tuned per ground; near-black wants almost none. */
  grain?: number;
};

export type Chapter = {
  id: ChapterId;
  index: string;
  title: string;
  kicker: string;
  theme: ChapterTheme;
};

/* Purple and black are the foundation, but the journey is not one colour end
 * to end: chapters 05, 07 and 12 go deliberately light for contrast. */
export const chapters: Chapter[] = [
  {
    id: "cover",
    index: "01",
    title: "Elizabeth",
    kicker: "where it starts",
    theme: { bg: "#08060f", fg: "#f5f1ff", accent: "#9d4edd", grain: 0.03 },
  },
  {
    id: "intro",
    index: "02",
    title: "Why this exists",
    kicker: "why I did this",
    theme: { bg: "#140d24", fg: "#f5f1ff", accent: "#c8a2ff", grain: 0.025 },
  },
  {
    id: "room",
    index: "03",
    title: "Her room",
    kicker: "come in, touch things",
    theme: { bg: "#08060f", fg: "#f5f1ff", accent: "#9d4edd", grain: 0.02 },
  },
  {
    id: "archives",
    index: "04",
    title: "Us, mapped",
    kicker: "feb 2023 to now",
    theme: { bg: "#160f28", fg: "#f1ebff", accent: "#c8a2ff", grain: 0.025 },
  },
  {
    id: "encyclopedia",
    index: "05",
    title: "The Dragon files",
    kicker: "the little things I know",
    theme: { bg: "#efe9fb", fg: "#120c1f", accent: "#7b2fb5", grain: 0.05 },
  },
  {
    id: "awards",
    index: "06",
    title: "The awards",
    kicker: "awards you already won",
    theme: { bg: "#0a0812", fg: "#f6f0e4", accent: "#e2bd6a", grain: 0.02 },
  },
  {
    id: "cake",
    index: "07",
    title: "The cake lab",
    kicker: "build your own cake",
    theme: { bg: "#faf7ff", fg: "#140d24", accent: "#7b2fb5", grain: 0.045 },
  },
  {
    id: "booth",
    index: "08",
    title: "The photo booth",
    kicker: "put yourself on a cover",
    theme: { bg: "#1b1230", fg: "#f5f1ff", accent: "#c8a2ff", grain: 0.025 },
  },
  {
    id: "chaos",
    index: "09",
    title: "What kind of dragon are you?",
    kicker: "a little birthday quiz",
    theme: { bg: "#59377d", fg: "#fff3db", accent: "#e7c7ff", grain: 0.035 },
  },
  {
    id: "radio",
    index: "10",
    title: "The playlist",
    kicker: "your playlist, and some clips",
    theme: { bg: "#120c20", fg: "#f3eeff", accent: "#c8a2ff", grain: 0.025 },
  },
  {
    id: "wish",
    index: "11",
    title: "Make a wish",
    kicker: "don't tell me what you wished",
    theme: { bg: "#05040a", fg: "#efe7ff", accent: "#e2bd6a", grain: 0.015 },
  },
  {
    id: "capsule",
    index: "12",
    title: "The time capsule",
    kicker: "Something for next year",
    theme: { bg: "#f6f1ff", fg: "#1a1230", accent: "#7b2fb5", grain: 0.04 },
  },
  {
    id: "letter",
    index: "13",
    title: "The actual message",
    kicker: "the actual message",
    theme: { bg: "#140d24", fg: "#f5f1ff", accent: "#c8a2ff", grain: 0.025 },
  },
  {
    id: "colophon",
    index: "14",
    title: "The colophon",
    kicker: "how it was made",
    theme: { bg: "#08060f", fg: "#f5f1ff", accent: "#9d4edd", grain: 0.02 },
  },
];

export const chapterById = (id: ChapterId) => chapters.find((c) => c.id === id)!;
export const totalChapters = chapters.length;
