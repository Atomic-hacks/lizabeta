/* The Wall of Love. Birthday notes from other people.
 * Envelopes are scattered deterministically from `seat`, so the composition
 * is art-directed rather than random. */

export type LoveNote = {
  id: string;
  from: string;
  /** Optional relation line, e.g. "SINCE 2019". */
  relation?: string;
  message: string;
  /** Position + tilt of the envelope on the canvas. */
  seat: { x: number; y: number; rotate: number };
  /** Paper tone. */
  stock?: "cream" | "rose" | "ink" | "gold";
  image?: string;
  audio?: string;
  video?: string;
};

export const loveNotes: LoveNote[] = [
  {
    id: "n1",
    from: "[Name]",
    relation: "[How they know her]",
    message:
      "[Replace with their actual message. Collect these over text and paste them in — it takes ten minutes and it is the best section of the site.]",
    seat: { x: 12, y: 18, rotate: -6 },
    stock: "cream",
  },
  {
    id: "n2",
    from: "[Name]",
    relation: "[How they know her]",
    message: "[Their message.]",
    seat: { x: 42, y: 8, rotate: 4 },
    stock: "rose",
  },
  {
    id: "n3",
    from: "[Name]",
    relation: "[How they know her]",
    message: "[Their message.]",
    seat: { x: 70, y: 22, rotate: -3 },
    stock: "cream",
  },
  {
    id: "n4",
    from: "[Name]",
    relation: "[How they know her]",
    message: "[Their message.]",
    seat: { x: 20, y: 56, rotate: 7 },
    stock: "gold",
  },
  {
    id: "n5",
    from: "[Name]",
    relation: "[How they know her]",
    message: "[Their message.]",
    seat: { x: 52, y: 62, rotate: -8 },
    stock: "ink",
  },
  {
    id: "n6",
    from: "[Name]",
    relation: "[How they know her]",
    message: "[Their message.]",
    seat: { x: 78, y: 58, rotate: 5 },
    stock: "cream",
  },
];
