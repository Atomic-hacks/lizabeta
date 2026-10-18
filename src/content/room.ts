/* ---------------------------------------------------------------------------
 * ELIZABETH'S ROOM
 *
 * The room is a hub: its objects open other chapters. Positions are
 * percentages of the scene, so moving an object never needs new breakpoints.
 *
 * On the anime cards: Elizabeth likes anime, and two of these are affectionate
 * fan-made birthday cards built around an abstract motif — an infinity figure
 * and a lightning arc. They are clearly labelled as unofficial and fan-made,
 * they are not written as messages from any character, and no character
 * artwork is reproduced anywhere in this project.
 * ------------------------------------------------------------------------- */

export type RoomAction =
  | { kind: "chapter"; target: string }
  | { kind: "radio" }
  | { kind: "studio"; target: "cake" }
  | { kind: "card"; target: string }
  | { kind: "surprise" }
  | { kind: "egg"; target: string };

export type RoomObject = {
  id: string;
  /** Numbered tag shown on the hotspot — interactive without needing hover. */
  tag: string;
  name: string;
  /** One line, shown on the hotspot label and in the mobile list. */
  hint: string;
  /** Percentage position within the scene. */
  at: { x: number; y: number };
  action: RoomAction;
  /** Hidden objects get no visible tag, but stay real 44px buttons. */
  hidden?: boolean;
};

export const roomObjects: RoomObject[] = [
  {
    id: "record-player",
    tag: "01",
    name: "The record player",
    hint: "Put something on",
    at: { x: 68.5, y: 44 },
    action: { kind: "radio" },
  },
  {
    id: "photo-album",
    tag: "02",
    name: "The photo album",
    hint: "Everywhere we've been",
    at: { x: 79, y: 47 },
    action: { kind: "chapter", target: "archives" },
  },
  {
    id: "poster-infinity",
    tag: "03",
    name: "The Gojo poster",
    hint: "There's a card behind it",
    at: { x: 16, y: 20 },
    action: { kind: "card", target: "infinity" },
  },
  {
    id: "poster-lightning",
    tag: "04",
    name: "The Killua poster",
    hint: "Another card behind this one",
    at: { x: 32.5, y: 21 },
    action: { kind: "card", target: "lightning" },
  },
  {
    id: "present",
    tag: "05",
    name: "The present",
    hint: "Obviously open this",
    at: { x: 44, y: 78 },
    action: { kind: "surprise" },
  },
  {
    id: "calendar",
    tag: "06",
    name: "The calendar",
    hint: "Next year, from here",
    at: { x: 89, y: 28 },
    action: { kind: "chapter", target: "capsule" },
  },
  {
    id: "cake",
    tag: "07",
    name: "The cake",
    hint: "Build it yourself",
    at: { x: 54, y: 47 },
    action: { kind: "studio", target: "cake" },
  },
  {
    id: "plant",
    tag: "08",
    name: "Something in the plant",
    hint: "There's something in the leaves",
    at: { x: 95, y: 59 },
    action: { kind: "egg", target: "egg-2" },
    hidden: true,
  },
];

export type CharacterCard = {
  id: string;
  /** "infinity" draws a lemniscate; "lightning" strikes an arc. */
  motif: "infinity" | "lightning";
  /** The inspiration, named as an inspiration. */
  inspiredBy: string;
  /** Poster art — also used on the wall in the room. */
  image: string;
  imageAlt: string;
  title: string;
  kicker: string;
  /** The actual messages. These are the point of the card. */
  lines: string[];
  signoff: string;
  palette: { bg: string; fg: string; accent: string };
};

export const characterCards: CharacterCard[] = [
  {
    id: "infinity",
    motif: "infinity",
    inspiredBy: "Gojo — fan art, unofficial, not a message from anyone but me",
    image: "/images/gallery/gojo1.jpg",
    imageAlt: "Fan art poster with an infinity motif",
    title: "INFINITY",
    kicker: "Card one of two",
    lines: [
      "A little Gojo card for your birthday. Yes, I remembered.",
      "I hope you get time with your siblings and your best friend today. And plenty of sleep, since I know that belongs on the list.",
      "You mean a lot to me, Feyi. I wanted to make you something you could come back to.",
    ],
    signoff: "Happy birthday. You can go back to Instagram after this.",
    palette: { bg: "#070a16", fg: "#eef2ff", accent: "#8fb6ff" },
  },
  {
    id: "lightning",
    motif: "lightning",
    inspiredBy: "Killua — fan art, unofficial, not a message from anyone but me",
    image: "/images/gallery/killua1.jpg",
    imageAlt: "Fan art poster with a lightning motif",
    title: "100,000 VOLTS",
    kicker: "Card two of two",
    lines: [
      "I know how much you love your siblings. I hope you feel just as loved today.",
      "A Killua card, a purple website, and a mention for all your dogs. I’m trying to cover the important things here.",
    ],
    signoff: "Enjoy your day, Dragon.",
    palette: { bg: "#0a1014", fg: "#eafaff", accent: "#7df0e0" },
  },
];

/** What's actually in the box. */
export const presentSurprise = {
  label: "The present",
  title: "The purple Porsche.",
  lines: [
    "Purple, obviously. Three working days… cough… cough.",
    "For now, it’s this website. I made it for you, and I hope it makes you smile.",
  ],
  signoff: "Happy birthday, Feyi.",
};
