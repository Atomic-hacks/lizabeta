# Page override — ELIZABETH'S ROOM

Overrides `MASTER.md` for the room chapter only.

## What it is
A hub, not a scene for its own sake: the room's objects open other chapters
(record player → the radio, photo album → the archives, calendar → the capsule,
cake → the cake lab, posters → the fan-made cards, present → a surprise).

## Build constraints (brief)
- **2D layered composition, not 3D.** SVG geometry, CSS transforms, GSAP. No
  WebGL in this chapter — three.js stays inside the cake studio.
- Parallax is pointer- and scroll-driven at **±18px maximum**, applied with
  `gsap.quickTo` to transforms only. **No React state from pointer events.**
- The parallax listener attaches on pointer-fine devices only, is gated by an
  IntersectionObserver, and detaches when the room scrolls out of view.
- No pinning. The room is a normal-flow section.

## Layout
- **Desktop:** one wide composition, objects positioned as percentages of the
  scene so nothing needs re-authoring per breakpoint.
- **Mobile (<768px):** the same scene scaled down, plus an explicit list of the
  objects beneath it. The list is the primary interface on a phone — hotspots
  alone are not discoverable at 375px, and the skill calls mobile fallback
  essential for this pattern.

## Objects
Every object is a `<button>` with a text label, in DOM order matching reading
order. Each carries a persistent numbered tag so it is visibly interactive
without hover. Hidden collectibles are the one exception and are still real
44×44 buttons with accessible names.

## Colour
Darkest ground in the issue (`--night` walls, `--dusk` floor, `--surface`
furniture), with the fairy lights and the lamp as the only light sources.
Light comes from flat shapes and low-opacity radial fills — **no box-shadow
glows, no filter: blur, no backdrop-filter.**
