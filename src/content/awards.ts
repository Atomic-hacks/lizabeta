/* The Elizabeth Awards. Order matters — the last one is staged on its own,
 * so keep the sincere one at the bottom. */

export type Award = {
  id: string;
  category: string;
  winner: string;
  citation: string;
  form: "plaque" | "statuette" | "certificate";
  confetti?: boolean;
};

export const awards: Award[] = [
  {
    id: "main-character",
    category: "Most Likely To Still Be Scrolling",
    winner: "Elizabeth",
    citation: "Instagram again. What happened to studying? Leemaooo.",
    form: "plaque",
  },
  {
    id: "asked-first",
    category: "Bravest Move, February 2023",
    winner: "You, obviously",
    citation: "Asked first, 17 days after we met in a CODM group. Bold.",
    form: "certificate",
  },
  {
    id: "chaos",
    category: "Always Ready For Gist",
    winner: "Elizabeth",
    citation: "Gossiping with Ayo made it onto the birthday website. Of course it did.",
    form: "certificate",
    confetti: true,
  },
  {
    id: "comedian",
    category: "A Mention For The Dogs",
    winner: "All your dogs",
    citation: "There are lots of them, and they’re part of your life too.",
    form: "plaque",
  },
  {
    id: "survivor",
    category: "Still Here Award",
    winner: "Both of us, somehow",
    citation: "June 2023. The weird years. December 2025. May 2026. Still talking.",
    form: "statuette",
  },
  {
    id: "lifetime",
    category: "Lifetime Achievement In Being Herself",
    winner: "Elizabeth",
    citation: "For the sister you are to your siblings, and the person I’m glad I met.",
    form: "statuette",
    confetti: true,
  },
];
