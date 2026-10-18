"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import { characterCards, presentSurprise, roomObjects, type RoomObject } from "@/content/room";
import type { ChapterId } from "@/content/birthday";
import { useExperience } from "@/lib/experience";
import { useRadio } from "@/lib/radio";
import { useSmoothScroll } from "@/lib/useSmoothScroll";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import Chapter from "../ui/Chapter";
import Dialog from "../ui/Dialog";
import Reveal from "../ui/Reveal";
import Confetti from "../ui/Confetti";
import Egg from "../ui/Egg";
import RoomScene from "../room/RoomScene";
import CharacterCard from "../room/CharacterCard";

export default function ElizabethsRoom() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [card, setCard] = useState<string | null>(null);
  const [surprise, setSurprise] = useState(false);
  const [bursts, setBursts] = useState(0);

  const { cue, collectEgg, requestStudio } = useExperience();
  const { activate, setPanelOpen } = useRadio();
  const { scrollTo } = useSmoothScroll();

  // Art and hotspots move together, so their alignment survives the small
  // pointer tilt. No global pointer listener or React updates per frame.
  useEffect(() => {
    const scene = sceneRef.current;
    const world = scene?.querySelector<HTMLElement>(".room-world");
    if (!scene || !world || prefersReducedMotion() ||
        !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let moveX: ReturnType<typeof gsap.quickTo>;
    let moveY: ReturnType<typeof gsap.quickTo>;
    const ctx = gsap.context(() => {
      moveX = gsap.quickTo(world, "x", { duration: 0.8, ease: "power2.out" });
      moveY = gsap.quickTo(world, "y", { duration: 0.8, ease: "power2.out" });
    }, scene);
    const move = (event: PointerEvent) => {
      const bounds = scene.getBoundingClientRect();
      moveX((event.clientX - bounds.left) / bounds.width * 6 - 3);
      moveY((event.clientY - bounds.top) / bounds.height * 4 - 2);
    };
    const reset = () => { moveX(0); moveY(0); };
    scene.addEventListener("pointermove", move, { passive: true });
    scene.addEventListener("pointerleave", reset);
    return () => {
      scene.removeEventListener("pointermove", move);
      scene.removeEventListener("pointerleave", reset);
      ctx.revert();
    };
  }, []);

  /* --- what each object does ------------------------------------------- */
  const handle = useCallback(
    (object: RoomObject) => {
      const action = object.action;
      switch (action.kind) {
        case "radio":
          cue("click");
          activate();
          setPanelOpen(true);
          break;
        case "chapter":
          cue("whoosh");
          scrollTo(`#chapter-${action.target as ChapterId}`, { offset: -8 });
          break;
        case "studio":
          cue("whoosh");
          // The cake chapter owns the studio; ask it to open, then go there.
          requestStudio("cake");
          scrollTo("#chapter-cake", { offset: -8 });
          break;
        case "card":
          cue("chime");
          setCard(action.target);
          break;
        case "surprise":
          cue("sparkle");
          setSurprise(true);
          setBursts((b) => b + 1);
          break;
        case "egg":
          collectEgg(action.target);
          break;
      }
    },
    [activate, collectEgg, cue, requestStudio, scrollTo, setPanelOpen],
  );

  const activeCard = characterCards.find((c) => c.id === card) ?? null;

  return (
    <Chapter id="room" pad="tight" className="bedroom-chapter">
      <div className="gutter room-heading">
        <Reveal>
          <p className="handwritten">make yourself at home</p>
          <h2 className="display mt-3">Elizabeth’s room.</h2>
          <p className="body-copy mt-4">Put a record on. Look behind the posters. That present is yours, too.</p>
        </Reveal>
        <span className="handwritten room-heading-hint">go on, touch things <ArrowDown size={23} aria-hidden /></span>
      </div>
      <div className="room-illustration" ref={sceneRef}>
        <div className="room-world">
          <RoomScene />
          {roomObjects.map((object) => {
            if (object.hidden) return (
              <div key={object.id} className="room-egg" style={{ left: object.at.x + "%", top: object.at.y + "%" }}>
                <Egg id="egg-2" />
              </div>
            );
            return (
              <button
                key={object.id}
                type="button"
                onClick={() => handle(object)}
                aria-label={object.name + ": " + object.hint}
                className="room-hotspot"
                style={{ left: object.at.x + "%", top: object.at.y + "%" }}
              >
                <span className="room-hotspot-marker" aria-hidden>{object.tag}</span>
                <span className="room-hotspot-label">{object.name}</span>
              </button>
            );
          })}
        </div>
        <Confetti fire={bursts} />
      </div>
      <div className="gutter room-object-shelf">
        <p className="handwritten">or pick something here</p>
        <ul>
          {roomObjects.filter((object) => !object.hidden).map((object) => {
            return (
              <li key={object.id}>
                <button type="button" onClick={() => handle(object)}>
                  <span className="room-object-number" aria-hidden>{object.tag}</span><span>{object.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="room-secret-hint">psst. have a look in the plant.</p>
      </div>

      {/* --- the fan-made cards ---------------------------------------- */}
      <Dialog
        open={activeCard !== null}
        onClose={() => setCard(null)}
        title={activeCard ? `Fan-made card — ${activeCard.title}` : "Card"}
        variant="full"
        hideTitle
      >
        {activeCard ? <CharacterCard card={activeCard} /> : null}
      </Dialog>

      {/* --- the present ------------------------------------------------ */}
      <Dialog
        open={surprise}
        onClose={() => setSurprise(false)}
        title="The present"
        variant="sheet"
        className="md:max-w-2xl"
      >
        <div className="px-[clamp(1.25rem,3vw,2.5rem)] pb-[10vh]">
          <p className="label text-lavender">{presentSurprise.label}</p>
          <h3 className="display mt-4 text-[clamp(1.75rem,4.5vw,3rem)] leading-tight">
            {presentSurprise.title}
          </h3>
          <div className="mt-6 space-y-4">
            {presentSurprise.lines.map((line, i) => (
              <p key={i} className="body-copy">
                {line}
              </p>
            ))}
          </div>
          <p className="quiet mt-8 text-[clamp(1.25rem,2.6vw,1.75rem)] text-lavender">
            {presentSurprise.signoff}
          </p>
        </div>
      </Dialog>
    </Chapter>
  );
}
