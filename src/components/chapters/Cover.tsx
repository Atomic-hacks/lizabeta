"use client";

import { useEffect, useRef } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { birthdayConfig } from "@/content/birthday";
import { useExperience } from "@/lib/experience";
import { useSmoothScroll } from "@/lib/useSmoothScroll";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import Chapter from "../ui/Chapter";
import Reel from "../ui/Reel";
import Plate from "../ui/Plate";
import Egg from "../ui/Egg";
import { PaperStar, BirthdayBalloons } from "../art/BirthdayArt";

export default function Cover() {
  const ref = useRef<HTMLDivElement>(null);
  const { stage, cue } = useExperience();
  const { scrollTo } = useSmoothScroll();

  useEffect(() => {
    if (stage !== "live" || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(".birthday-entrance", { y: 28, opacity: 0, duration: 0.85, stagger: 0.1 });
      gsap.from(".keepsake", { y: 45, opacity: 0, duration: 1, stagger: 0.12, delay: 0.2 });
    }, ref);
    return () => ctx.revert();
  }, [stage]);

  return (
    <Chapter id="cover" pad="none">
      <div ref={ref} className="birthday-cover">
        <div className="birthday-stars"><PaperStar size={30} /><PaperStar size={56} /></div>
        <div className="birthday-hero-grid gutter">
          <div className="birthday-greeting">
            <p className="birthday-entrance handwritten">a whole little world, just for you</p>
            <h1 className="birthday-entrance birthday-title">
              <span>happy birthday,</span>
              <strong>Elizabeth.</strong>
            </h1>
            <p className="birthday-entrance birthday-subtitle">Purple, a playlist, a little gist. All yours.</p>
            <a
              href="#chapter-room"
              className="birthday-entrance btn btn-solid birthday-enter"
              onClick={(event) => { event.preventDefault(); cue("whoosh"); scrollTo("#chapter-room", { offset: -80 }); }}
            >
              Come on in <ArrowUpRight size={23} aria-hidden />
            </a>
          </div>
          <div className="birthday-collage">
            <figure className="keepsake hero-keepsake">
              <span aria-hidden className="washi-tape" />
              <div className="hero-photo">
                <Reel src={birthdayConfig.heroVideo} poster={birthdayConfig.heroImage} label="Elizabeth, the birthday girl" ambient className="h-full w-full object-cover object-[50%_28%]" />
              </div>
              <figcaption>the birthday girl</figcaption>
            </figure>
            <figure className="keepsake little-keepsake">
              <Plate src="/images/elizabeth/funny-face3.jpg" alt="Elizabeth making a funny face" className="aspect-square w-full" sizes="(max-width: 640px) 30vw, 190px" />
              <figcaption>also the birthday girl</figcaption>
            </figure>
            <span className="keepsake paper-sticker instagram-sticker">probably on<br />Instagram</span>
            <BirthdayBalloons className="hero-balloons" />
            <PaperStar className="collage-spark" size={40} />
          </div>
        </div>
        <div className="birthday-cover-bottom gutter">
          <span className="flex items-center gap-2"><Egg id="egg-1" /><span className="text-sm">a few little surprises, too</span></span>
          <a href="#chapter-intro" onClick={(event) => { event.preventDefault(); scrollTo("#chapter-intro", { offset: -70 }); }} className="handwritten inline-flex min-h-11 items-center gap-3">keep exploring <ArrowDown size={20} aria-hidden /></a>
        </div>
      </div>
    </Chapter>
  );
}
