# Elizabeth's birthday playground

## Direction

A personal purple birthday scrapbook that opens into a cosy illustrated room.
Elizabeth is the subject; Dragon remains an affectionate nickname. Keep the
existing activities, real photographs, history, final letter, section IDs and
Spotify integration.

Design variance 8, motion intensity 6, visual density 4. Native CSS, Tailwind and
the existing GSAP setup; no new animation or UI dependencies.

## Audit and changes

The old composition repeated large headings, explanatory paragraphs and ruled
lists. Numbered chapter navigation, a specimen-sheet portrait, empty booth frame
outlines and a text-only cake menu made the page feel like a publication.

The redesign uses taped instant photographs, paper notes, illustrated scenery,
rounded buttons with a pressed state, photo strips and a grooved vinyl sleeve.
The quiet letter and wish keep their space in the story. Purple and black remain
the foundation; occasional pale lilac scenes follow the original brief.

Each chapter now owns its background, foreground and local theme variables.
Scrolling still updates the fixed chrome's atmosphere, but no longer changes the
contrast of an adjacent section.

## Image references and translation

Generated with the built-in imagegen tool, not the API/CLI.

- hero-reference.png: an asymmetric purple scrapbook hero. A roughly equal
  text/photo split, cream instant-photo frames, lilac tape, a large lavender name,
  a single plump lavender action, and sparse paw/heart/orbit decoration. The
  implementation uses Elizabeth's real photos and video, not the generated
  placeholder person. Desktop greeting/name scale is approximately 1:2;
  collage notes are secondary. On phones the text and collage stack.
- quiz-reference.png: a violet paper scene with cream rounded headings and four
  large notes. Phone, message, moon and book icons match the actual answers.
  Lavender, cream, butter and rose papers are limited to these illustrative
  objects; the CTA remains readable and separate.
- public/images/world/elizabeth-room.webp: the actual illustrated bedroom.
  Two posters upper left, dogs/bed lower left, cake/record/album on the desk,
  present on the floor, calendar and plant on the right. Hotspots were repositioned
  from the generated artwork. The source is 1586 × 992; WebP is about 493 KB.

The reference PNGs are design documentation, not runtime website downloads.

## Generation briefs

Hero: One readable desktop hero for Elizabeth's Universe, midnight-purple
scrapbook birthday playground; rounded lavender “happy birthday, Elizabeth.”
typography, real-photo-style instant frames, lilac tape, “probably on Instagram”
note, paw stickers, sparse orbit/stars, “Come on in” button. No glassmorphism,
neon glow, technical metadata or boxed feature grids.

Bedroom: One full-bleed 16:10 hand-painted 2D cosy purple bedroom, no UI or text.
Anime-inspired white-haired boy posters, fairy lights, pinned snapshots, lavender
bed with two sleeping illustrated dogs, desk with record player/photo album/cake,
wrapped purple present, starry window, calendar and leafy plant with hidden egg.
Readable objects, purple ambient and small warm highlights, no humans or 3D.

Quiz: One landscape quiz invitation section in matte violet with torn-paper edges.
Cream rounded “be honest, what are you doing?” heading, a cream “Take the quiz”
button, four tilted sticky notes for scrolling Insta, gossiping with Ayo, sleeping,
and studying (leemaooo). Lilac tape, phone/message/moon/book doodles, sparse paw
stickers. No diagnosis list, nested panels, stock photos or glow.

## Interaction and performance

- Hero entrance starts when the opening sequence finishes, with a static
  reduced-motion fallback. The old extra pinned hero scroll is removed.
- Bedroom painting and hotspots move together by only a few pixels on fine
  pointers. Events are attached to the room, not the window; GSAP is cleaned up.
- Touch users have 44px hotspot targets plus an object shelf. At narrow widths,
  album and record-player targets are separated.
- Cake preview uses the existing static 2D canvas; the 3D studio stays lazy.
- Photo frame choices open the actual selected frame.
- Existing quiz scoring, memories, music controls, wish, capsule and letter remain.
- Browser control was unavailable during this session. The design references and
  artwork were inspected, but rendered desktop/mobile screenshots were not.

## Verification

Run npm run lint, npm run typecheck, node --test scripts/*.test.mjs, and
npm run build -- --webpack. Webpack is used because this environment previously
denied Turbopack's internal port binding.

## Ornament refinement

The scrapbook compositions are preserved. Decorative library hearts, paws,
planets, sparkles and activity icons were removed. BirthdayArt.tsx now holds
original inline SVG paper stars, a two-balloon illustration and an award seal.
These are static, aria-hidden artwork with no pointer events or image requests.
Room objects use numbered markers and matching text labels. Notebook tabs use
plain labels; quiz papers use small personal annotations. Functional controls
such as play/pause, sound, close and directional arrows remain.

Paper rotations, tape, sticker edges and hard shadows were reduced to make the
materials more consistent. No sections or activities were removed. The SVG
artwork was rendered for inspection; browser screenshots remain unverified.
