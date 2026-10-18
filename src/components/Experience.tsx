"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect } from "react";
import type { ChapterId } from "@/content/birthday";
import { ExperienceProvider, useExperience } from "@/lib/experience";
import { RadioProvider } from "@/lib/radio";
import { SmoothScrollProvider, useSmoothScroll } from "@/lib/useSmoothScroll";
import { ScrollTrigger } from "@/lib/gsap";

import Masthead from "./chrome/Masthead";
import ChapterIndex from "./chrome/ChapterIndex";
import Toast from "./chrome/Toast";
import Loader from "./opening/Loader";
import Countdown from "./opening/Countdown";
import SoundInvite from "./opening/SoundInvite";

import Cover from "./chapters/Cover";
import Intro from "./chapters/Intro";
import Encyclopedia from "./chapters/Encyclopedia";
import Awards from "./chapters/Awards";
import MusicArchives from "./chapters/MusicArchives";
import MakeAWish from "./chapters/MakeAWish";
import FinalLetter from "./chapters/FinalLetter";
import Colophon from "./chapters/Colophon";
import FloatingRadio from "./music/FloatingRadio";

/* Heavy chapters are split out: 3D, canvas work and the map never block the
 * editorial core. The skeleton carries the real chapter id and reserves height,
 * so chapter-index links resolve and nothing shifts when the chunk lands. */
const skeleton = (id: ChapterId, label: string) => (
  <section id={`chapter-${id}`} aria-busy="true" className="gutter py-[18vh]">
    <p className="label opacity-45">{label}</p>
    <div className="mt-6 h-[42vh] w-full animate-pulse bg-current/5" />
  </section>
);

const ElizabethsRoom = dynamic(() => import("./chapters/ElizabethsRoom"), {
  ssr: false,
  loading: () => skeleton("room", "Elizabeth's room — turning on the lights"),
});
const Archives = dynamic(() => import("./chapters/Archives"), {
  ssr: false,
  loading: () => skeleton("archives", "The archives — loading the map"),
});
const CakeLab = dynamic(() => import("./chapters/CakeLab"), {
  ssr: false,
  loading: () => skeleton("cake", "The cake lab — warming the ovens"),
});
const PhotoBooth = dynamic(() => import("./chapters/PhotoBooth"), {
  ssr: false,
  loading: () => skeleton("booth", "The photo booth — loading the frames"),
});
const ChaosIndex = dynamic(() => import("./chapters/ChaosIndex"), {
  ssr: false,
  loading: () => skeleton("chaos", "Loading the quiz"),
});
const TimeCapsule = dynamic(() => import("./chapters/TimeCapsule"), {
  ssr: false,
  loading: () => skeleton("capsule", "The time capsule — folding paper"),
});
const SecretChapter = dynamic(() => import("./chapters/SecretChapter"), { ssr: false });

function Stage() {
  const { stage, setStage, hasVisited, reducedMotion, allEggsFound } = useExperience();
  const { stop, start, scrollTo } = useSmoothScroll();

  /* The opening owns the scroll position until it's finished. */
  useEffect(() => {
    if (stage === "live") {
      start();
      // Layout settles after the overlays leave; triggers need the new heights.
      requestAnimationFrame(() => ScrollTrigger.refresh());
    } else {
      stop();
      // Through Lenis, so its internal position and ScrollTrigger agree.
      scrollTo(0, { immediate: true });
    }
  }, [stage, start, stop, scrollTo]);

  const afterLoad = useCallback(() => {
    // A repeat visitor who has already seen the fireworks goes straight in.
    setStage(hasVisited && reducedMotion ? "live" : "countdown");
  }, [hasVisited, reducedMotion, setStage]);

  return (
    <>
      <a
        href="#chapter-cover"
        className="sr-only-focusable"
        onClick={(e) => {
          e.preventDefault();
          scrollTo("#chapter-cover", { offset: -8 });
        }}
      >
        Skip to the start
      </a>

      <Masthead />
      <ChapterIndex />
      <Toast />
      <FloatingRadio />

      <main id="issue" aria-hidden={stage !== "live"} className="pb-24 sm:pb-0">
        <Cover />
        <Intro />
        <ElizabethsRoom />
        <Archives />
        <Encyclopedia />
        <Awards />
        <CakeLab />
        <PhotoBooth />
        <ChaosIndex />
        <MusicArchives />
        <MakeAWish />
        <TimeCapsule />
        <FinalLetter />
        {allEggsFound ? <SecretChapter /> : null}
        <Colophon />
      </main>

      {stage === "loading" ? <Loader onDone={afterLoad} /> : null}
      {stage === "countdown" ? <Countdown onDone={() => setStage("invite")} /> : null}
      {stage === "invite" ? <SoundInvite onDone={() => setStage("live")} /> : null}
    </>
  );
}

export default function Experience() {
  return (
    <ExperienceProvider>
      <SmoothScrollProvider>
        <RadioProvider>
          <Stage />
        </RadioProvider>
      </SmoothScrollProvider>
    </ExperienceProvider>
  );
}
