# ELIZABETH'S UNIVERSE — Design System (Master)

Revision 2. Source of truth for every visual decision.
Derived from the project brief, reconciled against `ui-ux-pro-max`
(`--design-system`, domains `typography` / `ux`).

> **Revision note.** v1 was a cream-and-ink print editorial ("The Birthday
> Issue"). The brief has moved to a purple-and-black interactive universe built
> around Elizabeth. The *architecture* of v1 survives — chapter registry,
> per-chapter atmospheres, one Lenis ticker, content-driven everything. The
> *skin and the tone* are replaced. Where a v1 rule still holds it is marked
> KEPT, so nothing was overwritten blindly.

## Who it is for
**Elizabeth.** She is the subject of the site and the name used throughout.
**"Dragon"** is one person's nickname for her, so it appears sparingly and only
where it reads as affection or as a joke — the files, the quiz, the egg hunt,
the odd aside. It is never the name of the site and never the default label for
a section.

## Pattern — ADOPTED from skill
**Immersive / Interactive Experience.** Dark ground for focus, interactive
elements clearly highlighted, a skip option on anything timed, and — the skill's
own words — *"mobile fallback essential"*. Every interactive object in the room
must therefore have a real tap target and a layout that works at 320px.

## Style — ADOPTED WITH LIMITS
The skill proposed **Parallax Storytelling** and flagged it
**Performance: ❌ Poor, Accessibility: ❌ Poor (motion)**. The brief demands
performance first, so the aesthetic is adopted and the mechanics are capped:

1. **At most two pinned sections in the whole site**, desktop only.
2. **Parallax is subtle and transform-only** — depth of ±24px, never full-height
   layer scrolling, never scroll-jacking.
3. **Scroll-driven work is gated by visibility.** Any rAF loop or pointer
   parallax runs only while its section is on screen, and stops when it leaves.
4. **No continuous ambient animation.** Nothing loops forever "for atmosphere".
5. Reduced motion removes pinning, scrubbing and parallax entirely.

Rejected from v1: print grain at `mix-blend-mode: multiply` (invisible on
near-black and costly full-screen), the custom cursor (below), and
`backdrop-filter` on dialog chrome.

## Colour — BRIEF (authoritative)
```
--night      #08060F   primary background
--dusk       #140D24   secondary background
--surface    #1B1230   cards, panels, raised objects
--violet     #9D4EDD   primary purple, interactive accent
--lavender   #C8A2FF   highlights, secondary accent
--softwhite  #F5F1FF   primary text
--muted      #9690A8   secondary text
```
The skill's monochrome-plus-blue palette is **rejected**: the brief specifies
its own.

**Contrast gates (non-negotiable, skill priority 1).**
`--softwhite` on `--night` ≈ 17:1. `--muted` on `--night` ≈ 6.4:1 — fine for
secondary text, **never** for anything below 14px that matters.
`--violet` on `--night` ≈ 4.6:1, so violet is legal for text but is preferred
for borders, rules and fills; **`--lavender` is the accent colour for small
text**. Violet text on `--surface` ≈ 3.4:1 — **not allowed for body copy**.

**Variety rule (brief).** Purple-and-black is the foundation, but the issue must
not be one colour end to end. Two or three chapters go deliberately light
(lavender-white), and each chapter declares its own ground in
`src/content/birthday.ts`. No gradients as decoration; no permanent glow.

## Typography — SKILL-INFORMED, ADJUSTED
The skill's top pairing was **Caveat + Quicksand** ("handwritten, personal,
warm"). Caveat is **rejected as a display face**: handwriting at 8rem fails
legibility and the brief asks for cinematic, not scrapbook. Its own alternate
pairing — *Playful Creative* — is adopted instead, and v1's serif is retained
as a second register so the emotional chapters can read differently from the
funny ones.

```
Display   Fredoka            playful, rounded, holds up at 10rem   (skill)
Serif     Cormorant Garamond the dreamy / emotional register       (KEPT v1)
Body      Nunito             warm, highly readable on dark         (skill)
Label     Geist Mono         uppercase 0.2em HUD meta              (KEPT v1)
```

Two display faces, used by register and never mixed in one headline:
- **Fredoka** — the cover, the room, the games, the awards, anything loud.
- **Cormorant italic** — the wish, the letter, the capsule, anything quiet.

Body ≥16px, line-height 1.6–1.7, measure ≤62ch. KEPT from v1.

## Anime influences — SCOPE LIMIT
Elizabeth likes anime, white-haired characters among them. These are *her
interests*, not the site's identity, so they appear only as objects in her room:
posters, a pair of fan-made birthday cards, a hidden collectible.

- The cards are **clearly labelled fan-made and unofficial** — they are not
  presented as messages from any character, studio or creator.
- Motifs are **abstract and original**: an infinity figure for one, a lightning
  arc for the other. No character likenesses are drawn or reproduced; poster art
  is typographic and geometric.
- Budget: anime references stay under roughly one tenth of the site's surface.

## Motion rules — KEPT from v1, tightened
1. **1–2 animated elements per view, maximum.**
2. **ease-out entering, ease-in exiting**; house curve
   `cubic-bezier(0.16, 1, 0.3, 1)`. Never linear.
3. Micro-interactions 150–300ms; narrative beats 400–900ms.
4. **transform and opacity only.** Never width/height/top/left/filter.
5. `prefers-reduced-motion` disables pinning, scrubbing, parallax and the
   countdown; every chapter still renders complete and reachable.
6. One Lenis instance on the single `gsap.ticker`. **No second rAF loop.**
7. Every GSAP context reverted on unmount; every listener removed.
8. `will-change` is never applied speculatively.
9. No two chapters share the same transition treatment.

## Interaction — UPDATED
- **No custom cursor.** v1's cursor updated React state from pointer events,
  which is the exact anti-pattern the brief calls out; it is removed, not
  rescued. The native cursor is used, with `cursor: pointer` on everything
  clickable and real `:focus-visible` rings.
- Hover is never the only way to reach information (skill priority 1).
- Minimum 44×44px targets, 8px apart (skill priority 2).
- Interactive objects in the room read as interactive without hover: a visible
  label, a highlight, or a persistent affordance.

## Non-negotiables (skill pre-delivery checklist)
- Lucide SVG icons only; no emoji as iconography.
- Visible focus states; labelled inputs; alt text on meaningful images; colour
  never the sole indicator.
- No horizontal scroll at 320 / 375 / 390 / 430 / 768 / 1024 / 1440 / 1920.
- Reserve space for async content; no layout shift.
- z-index scale: content 0–10, chrome 20–40, overlays 50, texture 60.

## Page overrides
`design-system/pages/*.md` overrides this file for a single chapter.
