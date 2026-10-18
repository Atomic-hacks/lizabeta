"use client";

import { useState } from "react";
import { annotations, specimenFacts } from "@/content/encyclopedia";
import Chapter from "../ui/Chapter";
import Plate from "../ui/Plate";
import Reveal from "../ui/Reveal";
import Egg from "../ui/Egg";

export default function Encyclopedia() {
  const [selected, setSelected] = useState(annotations[0].id);
  const active = annotations.find((note) => note.id === selected) ?? annotations[0];

  return (
    <Chapter id="encyclopedia" className="elizabeth-notebook">
      <div className="gutter notebook-layout">
        <Reveal className="notebook-portrait">
          <figure className="keepsake">
            <span className="washi-tape" aria-hidden />
            <Plate src="/images/elizabeth/slay-1.jpg" alt="Elizabeth" className="aspect-[4/5] w-full" sizes="(max-width: 768px) 75vw, 480px" />
            <figcaption>my Dragon. your Elizabeth.</figcaption>
          </figure>
          <span className="paper-sticker notebook-sticker">dogs deserve a mention</span>
          <span className="notebook-egg"><Egg id="egg-3" /></span>
        </Reveal>
        <div className="notebook-copy">
          <Reveal>
            <p className="handwritten flex items-center gap-2">the little things I know about you</p>
            <h2 className="display mt-4">very, very<br />Elizabeth.</h2>
          </Reveal>
          <ul className="notebook-tabs" aria-label="Things about Elizabeth">
            {annotations.map((note) => {
              return (
                <li key={note.id}>
                  <button type="button" aria-pressed={selected === note.id} onClick={() => setSelected(note.id)}>
                    {note.label}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="notebook-note" aria-live="polite" aria-atomic="true">
            <h3 className="display">{active.value}</h3>
            <p className="body-copy mt-3">{active.detail}</p>
            {active.image ? <Plate src={active.image} alt={active.label} className="mt-5 aspect-[4/3] w-full" sizes="(max-width: 768px) 90vw, 420px" /> : null}
          </div>
          <dl className="notebook-facts">
            {specimenFacts.filter((fact) => ["We met", "Favourite colour", "Dogs", "Known as"].includes(fact.label)).map((fact) => (
              <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>
            ))}
          </dl>
        </div>
      </div>
    </Chapter>
  );
}
