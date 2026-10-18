/* Photo booth frames. Each frame is drawn on a canvas by a pure function in
 * src/components/booth/frames.ts — this file is the catalogue the UI shows. */

export type FrameId = "cover-girl" | "wanted" | "birthday-club" | "certified" | "dragon-files";

export type Frame = {
  id: FrameId;
  name: string;
  note: string;
  /** Output aspect ratio (w/h). */
  ratio: number;
  /** Editable text slots with sensible defaults. */
  slots: { id: string; label: string; value: string; maxLength: number }[];
};

export const frames: Frame[] = [
  {
    id: "cover-girl",
    name: "The Cover Girl",
    note: "High-fashion masthead",
    ratio: 0.75,
    slots: [
      { id: "masthead", label: "Masthead", value: "ELIZABETH", maxLength: 12 },
      { id: "headline", label: "Headline", value: "SHE'S THE MOMENT", maxLength: 28 },
      { id: "kicker", label: "Cover line", value: "THE BIRTHDAY EDITION", maxLength: 30 },
    ],
  },
  {
    id: "wanted",
    name: "Wanted: Dragon",
    note: "Vintage poster, questionable charges",
    ratio: 0.75,
    slots: [
      { id: "crime", label: "Wanted for", value: "EXCESSIVE CHARISMA", maxLength: 26 },
      { id: "reward", label: "Reward", value: "ONE SLICE OF CAKE", maxLength: 24 },
    ],
  },
  {
    id: "birthday-club",
    name: "Birthday Club",
    note: "Minimal photo strip",
    ratio: 0.72,
    slots: [
      { id: "caption", label: "Caption", value: "BIRTHDAY CLUB / MEMBER 001", maxLength: 30 },
    ],
  },
  {
    id: "certified",
    name: "Certified Icon",
    note: "Bold typographic portrait",
    ratio: 1,
    slots: [
      { id: "word", label: "Big word", value: "ICON", maxLength: 8 },
      { id: "sub", label: "Sub-line", value: "CERTIFIED, NOTARISED", maxLength: 28 },
    ],
  },
  {
    id: "dragon-files",
    name: "The Dragon Files",
    note: "Archival identity card",
    ratio: 1.4,
    slots: [
      { id: "name", label: "Specimen", value: "DRAGON", maxLength: 16 },
      { id: "classification", label: "Classification", value: "CERTIFIED ICON", maxLength: 22 },
      { id: "clearance", label: "Clearance", value: "LEVEL: UNSUPERVISED", maxLength: 24 },
    ],
  },
];

export const BOOTH_STORAGE_KEY = "elizabeth.booth.v1";
