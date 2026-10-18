/* The clips. Captions are yours to rewrite — these are placeholders written
 * the way you talk, not the way a brochure talks. */

export type Clip = {
  id: string;
  src: string;
  caption: string;
  /** Optional still shown before it plays. */
  poster?: string;
};

export const clips: Clip[] = [
  {
    id: "c1",
    src: "/videos/VIDEO-2026-10-06-00-03-33.mp4",
    caption: "no context, no explanation, no regrets",
    poster: "/images/elizabeth/funny-face1.jpg",
  },
  {
    id: "c2",
    src: "/videos/VIDEO-2026-08-09-09-14-11.mp4",
    caption: "this one still makes me laugh out loud",
    poster: "/images/elizabeth/funny-face2.jpg",
  },
  {
    id: "c3",
    src: "/videos/VIDEO-2026-10-06-00-03-35 2.mp4",
    caption: "exhibit A in the case for you being a menace",
    poster: "/images/elizabeth/funny-face3.jpg",
  },
  {
    id: "c4",
    src: "/videos/VIDEO-2026-08-09-09-12-59.mp4",
    caption: "the face you make when you already know you're right",
    poster: "/images/elizabeth/funny-face4.jpg",
  },
  {
    id: "c5",
    src: "/videos/VIDEO-2026-07-26-09-10-10.mp4",
    caption: "whatever was happening here, it was your idea",
    poster: "/images/elizabeth/funny-face5.jpg",
  },
  {
    id: "c6",
    src: "/videos/VIDEO-2026-08-09-09-14-39.mp4",
    caption: "keeping this one forever, sorry",
    poster: "/images/elizabeth/slay-1.jpg",
  },
  {
    id: "c7",
    src: "/videos/VIDEO-2026-10-06-00-03-33 2.mp4",
    caption: "dragon behaviour, documented",
    poster: "/images/elizabeth/slay-2.jpg",
  },
  {
    id: "c8",
    src: "/videos/VIDEO-2026-08-09-09-14-41.mp4",
    caption: "i have watched this more times than i'll admit",
    poster: "/images/elizabeth/funny-face1.jpg",
  },
  {
    id: "c9",
    src: "/videos/VIDEO-2026-07-26-09-10-11.mp4",
    caption: "short, loud, very you",
    poster: "/images/elizabeth/funny-face2.jpg",
  },
];
