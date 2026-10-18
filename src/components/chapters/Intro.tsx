"use client";

import { PaperStar } from "../art/BirthdayArt";
import Chapter from "../ui/Chapter";
import Reveal from "../ui/Reveal";
import Plate from "../ui/Plate";

export default function Intro() {
  return (
    <Chapter id="intro" className="scrapbook-intro" pad="tight">
      <div className="gutter intro-scrapbook">
        <Reveal className="intro-photograph">
          <figure className="keepsake">
            <span aria-hidden className="washi-tape" />
            <Plate src="/images/elizabeth/slay-2.jpg" alt="Elizabeth" className="aspect-[4/5] w-full" sizes="(max-width: 768px) 65vw, 330px" />
            <figcaption>yes, this is all for you.</figcaption>
          </figure>
          <span className="paper-sticker intro-purple">purple, obviously.</span>
        </Reveal>
        <Reveal className="intro-letter">
          <p className="handwritten mb-5">before you get distracted by Instagram...</p>
          <h2 className="display">I made you<br />a little world.</h2>
          <p className="body-copy mt-6">Your photos, your playlist, our memories. A cake you can decorate and a few things I hid for you to find.</p>
          <p className="body-copy mt-4">There’s a bit of everything you love in here. Your siblings, your best friend, your dogs. And yes, gossiping with Ayo made it in too.</p>
          <p className="handwritten mt-6 flex items-center gap-2">Happy birthday, Feyi.</p>
          <span className="intro-doodle"><PaperStar size={45} /></span>
        </Reveal>
      </div>
    </Chapter>
  );
}
