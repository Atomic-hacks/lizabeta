/* The timeline. Real dates. Written plainly — no editorialising. */

export type Memory = {
  id: string;
  title: string;
  locationName: string;
  date?: string;
  description: string;
  quote?: string;
  images: string[];
  video?: string;
  audio?: string;
  /** A stretch of time rather than a single moment. */
  interlude?: boolean;
  coordinates: { x: number; y: number };
};

export const memories: Memory[] = [
  {
    id: "first-met",
    title: "We met",
    locationName: "A CODM group",
    date: "9 February 2023",
    description:
      "Online, in a Call of Duty Mobile group. That is genuinely where this starts.",
    images: ["/images/elizabeth/funny-face1.jpg"],
    video: "/videos/VIDEO-2026-07-26-09-10-06.mp4",
    coordinates: { x: 6, y: 64 },
  },
  {
    id: "you-asked",
    title: "You asked me out",
    locationName: "Seventeen days later",
    date: "26 February 2023",
    description:
      "You asked first. I made you let me ask it back properly, so it was done the right way round.",
    images: ["/images/elizabeth/funny-face2.jpg"],
    coordinates: { x: 18, y: 32 },
  },
  {
    id: "my-birthday",
    title: "My birthday",
    locationName: "The failed prank",
    date: "12 April 2023",
    description:
      "You sent me money. Moses tried to prank me the same day and it did not work at all.",
    images: ["/images/elizabeth/funny-face3.jpg"],
    video: "/videos/VIDEO-2026-07-26-09-10-08.mp4",
    coordinates: { x: 30, y: 68 },
  },
  {
    id: "breakup",
    title: "We broke up",
    locationName: "June",
    date: "June 2023",
    description: "A bad month for both of us.",
    images: ["/images/elizabeth/funny-face4.jpg"],
    coordinates: { x: 42, y: 26 },
  },
  {
    id: "your-birthday",
    title: "Your birthday",
    locationName: "October",
    date: "October 2023",
    description: "I sent money and tried to make the day feel like something.",
    images: ["/images/elizabeth/funny-face5.jpg"],
    video: "/videos/VIDEO-2026-08-09-09-12-38.mp4",
    coordinates: { x: 54, y: 70 },
  },
  {
    id: "weird",
    title: "Tons of weird moments",
    locationName: "Undocumented",
    date: "2024 — 2025",
    description: "Too much to list. Most of it unprintable.",
    interlude: true,
    images: ["/images/elizabeth/funny-face1.jpg"],
    coordinates: { x: 66, y: 34 },
  },
  {
    id: "no-contact-1",
    title: "Broke no contact",
    locationName: "December",
    date: "December 2025",
    description: "After a long stretch of really weird stuff, somebody caved.",
    images: ["/images/elizabeth/funny-face2.jpg"],
    video: "/videos/VIDEO-2026-09-12-13-37-29.mp4",
    coordinates: { x: 78, y: 66 },
  },
  {
    id: "no-contact-2",
    title: "Broke it again",
    locationName: "May",
    date: "May 2026",
    description: "Same thing, after a horrible misunderstanding.",
    images: ["/images/elizabeth/funny-face3.jpg"],
    coordinates: { x: 88, y: 30 },
  },
  {
    id: "present",
    title: "Present day",
    locationName: "The dragon embers",
    date: "Today",
    description: "Confusion in the dragon embers, lmao. Also: your birthday.",
    images: ["/images/elizabeth/funny-face4.jpg"],
    video: "/videos/VIDEO-2026-10-06-00-03-34.mp4",
    coordinates: { x: 96, y: 58 },
  },
];
