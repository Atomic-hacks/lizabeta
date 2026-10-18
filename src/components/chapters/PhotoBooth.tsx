"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import Plate from "../ui/Plate";
import { frames, type FrameId } from "@/content/frames";
import { useExperience } from "@/lib/experience";
import Chapter from "../ui/Chapter";
import Dialog from "../ui/Dialog";
import Reveal from "../ui/Reveal";

const BoothStudio = dynamic(() => import("../booth/BoothStudio"), {
  ssr: false,
  loading: () => (
    <div className="grid min-h-[60vh] place-items-center">
      <p className="label opacity-55">Loading the frames…</p>
    </div>
  ),
});

/**
 * THE PHOTO BOOTH.
 * The chapter previews the five frames as flat typographic thumbnails — the
 * canvas machinery stays behind the door until she opens it.
 */
export default function PhotoBooth() {
  const [open, setOpen] = useState(false);
  const [frameChoice, setFrameChoice] = useState<FrameId | undefined>();
  const { cue } = useExperience();

  return (
    <Chapter id="booth" className="birthday-photo-booth">
      <div className="gutter">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Reveal
              as="h2"
              mode="lines"
              className="display mt-5 text-[clamp(2.5rem,7.5vw,6.5rem)] leading-[0.92]"
            >
              okay, one more
              <br />
              photo.
            </Reveal>
          </div>
          <button
            type="button"
            onClick={() => {
              cue("whoosh");
              setFrameChoice(undefined);
              setOpen(true);
            }}
            className="btn btn-solid"
          >
            <span>Step inside</span>
          </button>
        </div>

        <p className="body-copy mt-6">
          Pick a photo, pick a frame, keep the picture. Another one for Instagram?
        </p>

        <div className="booth-preview-wall">
          <div className="photo-strip">
            <span className="washi-tape" aria-hidden />
            {["funny-face1.jpg", "funny-face3.jpg", "funny-face5.jpg"].map((photo) => (
              <Plate key={photo} src={"/images/elizabeth/" + photo} alt="Elizabeth making a funny face" className="aspect-[4/3] w-full" sizes="(max-width: 768px) 40vw, 220px" />
            ))}
            <p className="handwritten">Elizabeth</p>
          </div>
          <div className="booth-frame-menu">
            <p className="handwritten mb-5">which one are we keeping?</p>
            <ul>
              {frames.map((frame) => (
                <li key={frame.id}>
                  <button type="button" onClick={() => { cue("click"); setFrameChoice(frame.id); setOpen(true); }}>
                    <span className="display">{frame.name}</span><ArrowRight size={20} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm opacity-70">Your photo stays on your device.</p>
          </div>
        </div>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} title="The photo booth" variant="full" hideTitle>
        <BoothStudio initialFrame={frameChoice} onClose={() => setOpen(false)} />
      </Dialog>
    </Chapter>
  );
}
