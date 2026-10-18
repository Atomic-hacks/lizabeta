"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download, RotateCcw } from "lucide-react";
import {
  QUIZ_STORAGE_KEY,
  questions,
  results,
  type ResultId,
} from "@/content/quiz";
import { useExperience } from "@/lib/experience";
import { readJSONExact, writeJSON } from "@/lib/storage";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { exportResultCard } from "./exportCard";

type Answers = Record<string, string>;

/** Deterministic: every answer's weights are summed and the top total wins.
 *  Ties break by the order results are declared, so the same answers always
 *  give the same dragon. */
function score(answers: Answers): ResultId {
  const totals = new Map<ResultId, number>();
  (Object.keys(results) as ResultId[]).forEach((id) => totals.set(id, 0));

  questions.forEach((q) => {
    const chosen = q.answers.find((a) => a.id === answers[q.id]);
    if (!chosen) return;
    (Object.entries(chosen.weights) as [ResultId, number][]).forEach(([id, weight]) => {
      totals.set(id, (totals.get(id) ?? 0) + weight);
    });
  });

  let best: ResultId = "chaotic-good";
  let bestScore = -1;
  (Object.keys(results) as ResultId[]).forEach((id) => {
    const value = totals.get(id) ?? 0;
    if (value > bestScore) {
      best = id;
      bestScore = value;
    }
  });
  return best;
}

export default function QuizStudio({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const { cue } = useExperience();

  useEffect(() => {
    const saved = readJSONExact<{ answers: Answers; finished: boolean }>(QUIZ_STORAGE_KEY, {
      answers: {},
      finished: false,
    });
    if (saved.finished && Object.keys(saved.answers).length === questions.length) {
      /* Hydrating a finished attempt from localStorage — not readable during
         render without breaking SSR. */
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAnswers(saved.answers);
      setFinished(true);
    }
  }, []);

  const result = useMemo(() => results[score(answers)], [answers]);
  const question = questions[step];

  /* Each question enters from the right; the stack never cross-fades. */
  useEffect(() => {
    if (prefersReducedMotion() || !stageRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".quiz-enter", {
        x: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.05,
        ease: "power3.out",
      });
    }, stageRef.current);
    return () => ctx.revert();
  }, [step, finished]);

  const choose = (answerId: string) => {
    cue("click");
    const next = { ...answers, [question.id]: answerId };
    setAnswers(next);

    if (step === questions.length - 1) {
      setFinished(true);
      writeJSON(QUIZ_STORAGE_KEY, { answers: next, finished: true });
      cue("reveal");
    } else {
      setStep(step + 1);
    }
  };

  const restart = () => {
    cue("click");
    setAnswers({});
    setStep(0);
    setFinished(false);
    writeJSON(QUIZ_STORAGE_KEY, { answers: {}, finished: false });
  };

  const save = async () => {
    try {
      setError(null);
      await exportResultCard(result);
      cue("sparkle");
    } catch {
      setError("Saving didn't work in this browser. A screenshot works too.");
    }
  };

  if (finished) {
    return (
      <div
        ref={stageRef}
        className="min-h-[calc(100dvh-5rem)] px-[clamp(1.25rem,4vw,4rem)] pb-[12vh] pt-[4vh]"
        style={{ backgroundColor: result.palette.bg, color: result.palette.fg }}
      >
        <p className="quiz-enter label opacity-60">Your result</p>
        <h3 className="quiz-enter display mt-5 text-[clamp(2.5rem,9vw,7rem)] leading-[0.92]">
          {result.title}
        </h3>
        <p
          className="quiz-enter display mt-3 text-[clamp(1.25rem,3vw,2.25rem)] italic"
          style={{ color: result.palette.accent }}
        >
          {result.subtitle}
        </p>

        <div className="quiz-enter mt-[6vh] grid gap-[6vh] lg:grid-cols-12">
          <p className="body-copy lg:col-span-6" style={{ color: "inherit", opacity: 0.85 }}>
            {result.description}
          </p>

          <dl className="lg:col-span-5 lg:col-start-8">
            {result.traits.map((trait) => (
              <div key={trait.label} className="py-3">
                <div className="flex items-baseline justify-between">
                  <dt className="label opacity-60">{trait.label}</dt>
                  <dd className="label tabular-nums">{trait.value}</dd>
                </div>
                <div className="mt-2 h-[3px] w-full" style={{ backgroundColor: "currentColor", opacity: 0.18 }}>
                  <div
                    className="h-full"
                    style={{ width: `${trait.value}%`, backgroundColor: result.palette.accent, opacity: 1 }}
                  />
                </div>
              </div>
            ))}
          </dl>
        </div>

        <div className="quiz-enter mt-[8vh] flex flex-wrap gap-3">
          <button type="button" onClick={save} className="btn" style={{ borderColor: "currentColor" }}>
            <Download size={14} aria-hidden />
            <span>Save the card</span>
          </button>
          <button type="button" onClick={restart} className="btn">
            <RotateCcw size={14} aria-hidden />
            <span>Take it again</span>
          </button>
          <button type="button" onClick={onClose} className="label h-11 cursor-pointer px-2 opacity-60">
            Back to the issue
          </button>
        </div>
        {error ? (
          <p role="status" className="mt-4 text-sm">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div
      ref={stageRef}
      className="quiz-studio flex min-h-[calc(100dvh-5rem)] flex-col px-[clamp(1.25rem,4vw,4rem)] pb-[8vh] pt-[2vh]"
    >
      {/* Progress: a rule, not a pill. */}
      <div className="flex items-center gap-4">
        <p className="label shrink-0 opacity-55 tabular-nums">
          {question.number} / {String(questions.length).padStart(2, "0")}
        </p>
        <div className="h-[1px] flex-1 bg-current/20">
          <div
            className="h-full bg-[var(--stage-accent)] transition-[width] duration-500"
            style={{ width: `${(step / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center py-[6vh]">
        <h3 className="quiz-enter display max-w-[22ch] text-[clamp(2rem,6.5vw,5rem)] leading-[0.98]">
          {question.prompt}
        </h3>
        {question.note ? (
          <p className="quiz-enter label mt-5 max-w-[42ch] opacity-50">{question.note}</p>
        ) : null}

        <ul className="quiz-enter mt-[6vh] max-w-4xl">
          {question.answers.map((answer, i) => (
            <li key={answer.id}>
              <button
                type="button"
                onClick={() => choose(answer.id)}
                className="group flex w-full cursor-pointer items-baseline gap-5 border-t border-current/15 py-[clamp(0.9rem,2.2vh,1.5rem)] text-left transition-colors duration-200 hover:bg-current/[0.04]"
              >
                <span className="label shrink-0 opacity-40">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="display text-[clamp(1.25rem,3.2vw,2.25rem)] leading-tight">
                  {answer.label}
                </span>
                <span
                  aria-hidden
                  className="ml-auto h-[1px] w-6 shrink-0 self-center bg-current opacity-30 transition-all duration-300 group-hover:w-12 group-hover:opacity-80"
                />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="label h-11 cursor-pointer px-2 opacity-60 disabled:cursor-default disabled:opacity-25"
        >
          Back
        </button>
        <button type="button" onClick={onClose} className="label h-11 cursor-pointer px-2 opacity-60">
          Close the quiz
        </button>
      </div>
    </div>
  );
}
