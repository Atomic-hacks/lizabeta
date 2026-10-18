"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { questions } from "@/content/quiz";
import { useExperience } from "@/lib/experience";
import Chapter from "../ui/Chapter";
import Dialog from "../ui/Dialog";
import Reveal from "../ui/Reveal";

const QuizStudio = dynamic(() => import("../quiz/QuizStudio"), {
  ssr: false,
  loading: () => <div className="grid min-h-[60vh] place-items-center"><p className="handwritten">Finding the questions…</p></div>,
});

const notes = [
  { text: "scrolling Insta", aside: "just one more reel", className: "note-lilac" },
  { text: "gossiping with Ayo", aside: "Ayo, please continue", className: "note-cream" },
  { text: "sleeping", aside: "do not disturb", className: "note-yellow" },
  { text: "studying (leemaooo)", aside: "allegedly", className: "note-pink" },
];

export default function ChaosIndex() {
  const [open, setOpen] = useState(false);
  const { cue } = useExperience();

  return (
    <Chapter id="chaos" className="quiz-playground" pad="tight">
      <div className="gutter quiz-invitation">
        <Reveal className="quiz-invitation-copy">
          <h2 className="display">be honest,<br />what are<br />you doing?</h2>
          <p className="body-copy mt-6">Scrolling Insta, sleeping, gossiping with Ayo. I have my guesses.</p>
          <button type="button" onClick={() => { cue("whoosh"); setOpen(true); }} className="btn quiz-start mt-7">
            Take the quiz <ArrowRight size={23} aria-hidden />
          </button>
          <p className="handwritten mt-5">{questions.length} questions. No studying required.</p>
        </Reveal>
        <Reveal className="quiz-note-board" delay={0.1}>
          <ul className="quiz-notes">
            {notes.map(({ text, aside, className }) => (
              <li key={text} className={"sticky-note " + className}>
                <span aria-hidden className="washi-tape" />
                <span>{text}</span>
                <span className="note-aside">{aside}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} title="A little Elizabeth quiz" variant="full" hideTitle>
        <QuizStudio onClose={() => setOpen(false)} />
      </Dialog>
    </Chapter>
  );
}
