/* The Dragon Files — the one chapter where the nickname is official.
 * Written the way you'd actually say it. Swap any of it. */

export type Annotation = {
  id: string;
  number: string;
  label: string;
  value: string;
  detail: string;
  anchor: { x: number; y: number };
  image?: string;
};

export const specimenFacts: { label: string; value: string }[] = [
  { label: "Name", value: "Elizabeth" },
  { label: "Known as", value: "Dragon" },
  { label: "We met", value: "9 February 2023" },
  { label: "Favourite colour", value: "Purple" },
  { label: "Her people", value: "Her siblings and her best friend" },
  { label: "Usually on", value: "Instagram" },
  { label: "Gist partner", value: "Ayo" },
  { label: "Dogs", value: "Lots of them" },
];

export const annotations: Annotation[] = [
  {
    id: "a1",
    number: "01",
    label: "Her siblings",
    value: "She loves them a lot",
    detail: "Talking to your siblings had to be in here. You love them so much, and I love that about you.",
    anchor: { x: 62, y: 24 },
  },
  {
    id: "a2",
    number: "02",
    label: "Gossiping with Ayo",
    value: "There’s gist",
    detail: "If you’re not scrolling Instagram or sleeping, there’s always gossiping with Ayo. Or talking to your best friend.",
    anchor: { x: 28, y: 40 },
  },
  {
    id: "a3",
    number: "03",
    label: "Scrolling Insta",
    value: "Again",
    detail: "Scrolling Instagram. Sleeping. Back to Instagram. Studying? Leemaooo.",
    anchor: { x: 70, y: 55 },
  },
  {
    id: "a4",
    number: "04",
    label: "Purple",
    value: "Your favourite",
    detail: "The website is purple. The Porsche is purple. This was the easiest decision in the whole project.",
    anchor: { x: 34, y: 69 },
  },
  {
    id: "a5",
    number: "05",
    label: "The dogs",
    value: "Yes, plural",
    detail: "You have so many dogs. They deserve a mention on your birthday website too.",
    anchor: { x: 56, y: 84 },
  },
];
