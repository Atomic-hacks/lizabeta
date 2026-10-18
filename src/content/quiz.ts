/* The Chaos Index. Deterministic scoring: every answer adds weight to one or
 * more results, and the highest total wins. No randomness. */

export type ResultId =
  | "empress"
  | "chaotic-good"
  | "unbothered"
  | "overthinker"
  | "menace";

export type Question = {
  id: string;
  /** Editorial number, e.g. "01". */
  number: string;
  prompt: string;
  /** Small context line under the question. */
  note?: string;
  answers: {
    id: string;
    label: string;
    weights: Partial<Record<ResultId, number>>;
  }[];
};

export const questions: Question[] = [
  {
    id: "q1",
    number: "01",
    prompt: "It’s 3am. What are you doing?",
    answers: [
      { id: "a", label: "Scrolling Instagram", weights: { overthinker: 3 } },
      { id: "b", label: "Gossiping with Ayo", weights: { menace: 3, "chaotic-good": 1 } },
      { id: "c", label: "Sleeping. Why are you waking me?", weights: { unbothered: 3 } },
      { id: "d", label: "Studying (leemaooo)", weights: { overthinker: 3 } },
    ],
  },
  {
    id: "q2",
    number: "02",
    prompt: "You finally put your phone down. What next?",
    answers: [
      { id: "a", label: "Talking to my siblings", weights: { "chaotic-good": 3 } },
      { id: "b", label: "Calling my best friend", weights: { "chaotic-good": 3, menace: 1 } },
      { id: "c", label: "Sleeping", weights: { unbothered: 3 } },
      { id: "d", label: "Pick it back up. Scrolling Insta again", weights: { overthinker: 3 } },
    ],
  },
  {
    id: "q3",
    number: "03",
    prompt: "You have a whole afternoon free. Pick one.",
    answers: [
      { id: "a", label: "Spending it with my siblings", weights: { "chaotic-good": 3 } },
      { id: "b", label: "Gossiping with Ayo, obviously", weights: { menace: 3 } },
      { id: "c", label: "Staying home with my dogs", weights: { overthinker: 2, unbothered: 2 } },
      { id: "d", label: "Studying (leemaooo). Okay, Instagram", weights: { overthinker: 3 } },
    ],
  },
  {
    id: "q4",
    number: "04",
    prompt: "One of your siblings calls while you’re busy.",
    answers: [
      { id: "a", label: "Pick up. What happened?", weights: { "chaotic-good": 3, menace: 1 } },
      { id: "b", label: "Tell them I’ll call back, then actually call back", weights: { empress: 2, "chaotic-good": 2 } },
      { id: "c", label: "Put everything down and talk to them", weights: { unbothered: 2, "chaotic-good": 2 } },
      { id: "d", label: "Ask if they’re okay before anything else", weights: { overthinker: 3 } },
    ],
  },
  {
    id: "q5",
    number: "05",
    prompt: "What’s getting your attention first?",
    answers: [
      { id: "a", label: "Something purple", weights: { empress: 3 } },
      { id: "b", label: "Ayo has gist", weights: { menace: 3 } },
      { id: "c", label: "One of my dogs", weights: { unbothered: 3 } },
      { id: "d", label: "A reel my best friend sent me", weights: { overthinker: 2, "chaotic-good": 1 } },
    ],
  },
  {
    id: "q6",
    number: "06",
    prompt: "Birthday plans?",
    answers: [
      { id: "a", label: "Wear purple. That part is settled", weights: { empress: 3 } },
      { id: "b", label: "Spend time with my best friend", weights: { menace: 2, "chaotic-good": 2 } },
      { id: "c", label: "My siblings, my dogs, and me", weights: { unbothered: 3 } },
      { id: "d", label: "Let me finish scrolling first", weights: { overthinker: 3 } },
    ],
  },
  {
    id: "q7",
    number: "07",
    prompt: "One last thing before you go…",
    answers: [
      { id: "a", label: "Is it purple?", weights: { empress: 3 } },
      { id: "b", label: "Wait, let me tell Ayo something", weights: { menace: 3 } },
      { id: "c", label: "Can I go back to sleep now?", weights: { unbothered: 3 } },
      { id: "d", label: "Just one more reel", weights: { overthinker: 3 } },
    ],
  },
];

export type QuizResult = {
  id: ResultId;
  title: string;
  subtitle: string;
  description: string;
  traits: { label: string; value: number }[];
  /** Two-colour treatment for the collectible card. */
  palette: { bg: string; fg: string; accent: string };
};

export const results: Record<ResultId, QuizResult> = {
  empress: {
    id: "empress",
    title: "Purple, please",
    subtitle: "You know your favourite colour",
    description:
      "There’s a reason this whole website is purple. Even the Porsche had to be purple. I did pay attention, you see.",
    traits: [
      { label: "Purple", value: 98 },
      { label: "Studying", value: 21 },
      { label: "Siblings", value: 90 },
      { label: "Sleep", value: 34 },
    ],
    palette: { bg: "#4a1273", fg: "#f8f2ff", accent: "#f0b8d0" },
  },
  "chaotic-good": {
    id: "chaotic-good",
    title: "Siblings first",
    subtitle: "You love those people so much",
    description:
      "You love your siblings a lot. So of course talking to them made it into this quiz. Happy birthday to their sister, and to someone I’m very glad I know.",
    traits: [
      { label: "Siblings", value: 100 },
      { label: "Best friend", value: 29 },
      { label: "Gist", value: 92 },
      { label: "Sleep", value: 44 },
    ],
    palette: { bg: "#13332c", fg: "#eefaf5", accent: "#9fe3cf" },
  },
  unbothered: {
    id: "unbothered",
    title: "Going back to sleep",
    subtitle: "Wake you up later",
    description:
      "Sleep, your dogs, and nobody disturbing you for a bit. Fair enough. It’s your birthday; you can come back to this when you wake up.",
    traits: [
      { label: "Sleep", value: 97 },
      { label: "Disturbances", value: 12 },
      { label: "Dogs", value: 88 },
      { label: "Getting up", value: 18 },
    ],
    palette: { bg: "#e9e2f7", fg: "#1a1230", accent: "#7b2fb5" },
  },
  overthinker: {
    id: "overthinker",
    title: "Just one more reel",
    subtitle: "Still on Instagram",
    description:
      "You were scrolling Instagram, put your phone down, then went back to scrolling Insta. The studying can wait, apparently. Leemaooo.",
    traits: [
      { label: "Instagram", value: 95 },
      { label: "Sleep", value: 23 },
      { label: "Reels", value: 93 },
      { label: "Sleep", value: 27 },
    ],
    palette: { bg: "#131a2e", fg: "#e9ecfb", accent: "#8fb6ff" },
  },
  menace: {
    id: "menace",
    title: "Gossiping with Ayo",
    subtitle: "Wait, what happened next?",
    description:
      "You’ve got time for the gist. Ayo, please continue. Between that and talking to your best friend, we may have to remind you there’s a birthday website open.",
    traits: [
      { label: "Gist", value: 99 },
      { label: "Ayo", value: 89 },
      { label: "Studying", value: 8 },
      { label: "Best friend", value: 94 },
    ],
    palette: { bg: "#120a1c", fg: "#f6efff", accent: "#c8a2ff" },
  },
};

export const QUIZ_STORAGE_KEY = "elizabeth.chaos.v2";
