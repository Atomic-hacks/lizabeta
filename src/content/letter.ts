/* The final letter — your words, typeset. */

export const letter = {
  headline: ["ANOTHER YEAR.", "ANOTHER CHAPTER.", "STILL MY DRAGON."],
  image: "/images/elizabeth/slay-2.jpg",
  imageAlt: "Elizabeth",
  /** Plays above the letter. Leave "" for no video. */
  video: "/videos/VIDEO-2026-10-06-00-03-35 2.mp4",
  salutation: "Feyi,",
  paragraphs: [
    "You've always been, and will always be, a special part of my life.",
    "I wanted to do something special to appreciate a special person on a special day of their life.",
    "So, from me to you: happy birthday. Know that you will always be loved, cherished and appreciated in my heart.",
  ],
  signoff: "Happy birthday, my dragon.",
  /** The important legal disclosure. */
  postscript:
    "P.S. The purple Porsche will be delivered in three working days… cough… cough.",
  signature: "",
  footer: ["MADE WITH AN UNREASONABLE", "AMOUNT OF EFFORT.", "JUST FOR YOU."],
} as const;
