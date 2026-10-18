"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { ArrowRight } from "lucide-react";
import { defaultCake, type CakeConfig } from "@/content/cake";
import CakeFlat from "../cake/CakeFlat";
import { useExperience } from "@/lib/experience";
import Chapter from "../ui/Chapter";
import Dialog from "../ui/Dialog";
import Reveal from "../ui/Reveal";

/* The studio (and all of three.js with it) only downloads when she opens it. */
const CakeStudio = dynamic(() => import("../cake/CakeStudio"), {
  ssr: false,
  loading: () => (
    <div className="grid min-h-[60vh] place-items-center">
      <p className="label opacity-55">Preheating…</p>
    </div>
  ),
});

/**
 * THE CAKE LAB.
 * The chapter is an invitation; the studio is a dedicated room. Keeping them
 * separate is what lets the 3D bundle stay out of the main scroll.
 */
const birthdayCake: CakeConfig = { ...defaultCake, color: "#c8a2ff", decorations: ["bows", "stars"], message: "HAPPY BIRTHDAY FEYI" };

export default function CakeLab() {
  const [openedHere, setOpenedHere] = useState(false);
  const { cue, studioRequest, requestStudio } = useExperience();

  /* The cake in Elizabeth's room asks for this studio. Rather than copying
     that request into local state inside an effect, the open state is simply
     derived from both sources. */
  const open = openedHere || studioRequest === "cake";

  const close = useCallback(() => {
    setOpenedHere(false);
    requestStudio(null);
  }, [requestStudio]);

  return (
    <Chapter id="cake" className="birthday-bakery">
      <div className="gutter">
        <div className="grid gap-[6vh] lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal
              as="h2"
              mode="lines"
              className="display mt-5 text-[clamp(2.5rem,7.5vw,6.5rem)] leading-[0.92]"
            >
              go and build
              <br />
              your own cake.
            </Reveal>
            <p className="body-copy mt-6">
              Purple frosting? Three tiers? Bows on everything? It’s your cake.
              Make it exactly how you like it, then light the candles.
            </p>
            <button
              type="button"
              onClick={() => {
                cue("whoosh");
                setOpenedHere(true);
              }}
              className="btn btn-solid mt-8"
            >
              <span>Build your cake</span><ArrowRight size={21} aria-hidden />
            </button>
          </div>

          <aside className="cake-preview-stage lg:col-span-5">
            <span className="handwritten cake-preview-note">a little something to start with</span>
            <div className="cake-preview"><CakeFlat config={birthdayCake} lit={false} blown={false} /></div>
            <span className="paper-sticker cake-preview-sticker">extra purple,<br />please.</span>
            <p className="handwritten text-center">you get the first slice.</p>
          </aside>
        </div>
      </div>

      <Dialog open={open} onClose={close} title="The cake lab" variant="full" hideTitle>
        <CakeStudio onClose={close} />
      </Dialog>
    </Chapter>
  );
}
