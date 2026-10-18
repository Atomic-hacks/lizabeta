# DRAGON® | THE BIRTHDAY ISSUE

An immersive editorial birthday experience in fourteen chapters — built for one
person.

```
DRAGON®                                      VOL. 01

                THE
             BIRTHDAY
                ISSUE

       AN ENTIRE UNIVERSE
          FOR ONE PERSON.
```

Next.js 16 · React 19 · TypeScript · Tailwind v4 · GSAP 3.15 (ScrollTrigger,
SplitText, Flip) · Lenis · React Three Fiber · Supabase (optional) · Spotify
embed API.

---

## 1. Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

Nothing needs configuring to run. Every feature works without environment
variables, with two honest downgrades:

| Without config | What happens |
| --- | --- |
| No Supabase | The time capsule saves a **local draft** and says so plainly. It does not claim to be sealed. |
| No Spotify login | Spotify's player serves 30-second previews. Full tracks play once the listener is signed in to Spotify in the same browser. |

```bash
npm run build        # production build
npm run lint         # eslint — currently clean
npm run typecheck    # tsc --noEmit
```

---

## 2. Make it hers — edit these files only

Everything personal lives in `src/content/`. You should not need to open
`src/components/` at all.

| File | What's in it |
| --- | --- |
| `birthday.ts` | Her name, issue number, year, cover headline, hero image, **and the chapter order + per-chapter colour palettes** |
| `memories.ts` | The Friendship Archives. Each memory is a stop on the map; `coordinates` are percentages, and the road is generated through them — move a pin and the route redraws |
| `encyclopedia.ts` | The specimen sheet: the fact register and the numbered annotations (`anchor` positions them over the photograph) |
| `awards.ts` | The award categories. **Order matters** — the last one is staged alone as the finale, so keep the sincere one there |
| `cake.ts` | Shapes, tiers, sponges, frostings, colours, decorations, candles. Add a flavour here and it appears in the 3D studio, the 2D fallback and the export |
| `quiz.ts` | The Chaos Index questions, answer weights and the five results. Scoring is deterministic — her answers decide the outcome |
| `playlist.ts` | **Paste Spotify track URLs here.** Titles and artwork are fetched from Spotify at runtime; the dedications are yours |
| `messages.ts` | The Wall of Love. One entry per envelope |
| `letter.ts` | The final letter. Write this one properly — it is the point of the whole thing |
| `eggs.ts` | Where the five dragon eggs hide, their hints, and the hidden chapter they unlock |
| `frames.ts` | Photo booth frames and their editable text slots |

Placeholders are written as `[Replace with …]` so they are obvious and
greppable:

```bash
grep -rn "\[Replace" src/content/
```

### The playlist

```ts
export const dragonPlaylist: Track[] = [
  {
    id: "track-01",
    spotifyUrl: "https://open.spotify.com/track/...",  // the only required field
    dedication: "This one reminds me of you.",          // she will actually read this
    momentImage: "/images/gallery/song-01.jpg",         // Director's Cut photo
    momentCaption: "Where we were when this was playing.",
  },
];
```

The five URLs currently in the file are **real songs used as placeholders** —
replace them. Spotify's oEmbed endpoint returns the title and artwork but *not*
the artist, so set `artist` yourself if you want it shown; nothing is invented.

---

## 3. Photographs

Drop files in and they appear. Until then every image slot renders a typeset
placeholder naming the file it wants — never a broken image icon.

```
public/images/
  dragon/
    hero.jpg          # the cover portrait — portrait crop, the one big image
    specimen.jpg      # the encyclopedia plate (any photo of her works)
    letter.jpg        # the closing portrait
  memories/
    01.jpg … 06.jpg   # one per stop in memories.ts
  gallery/
    song-01.jpg …     # Director's Cut photos, per playlist entry
```

**Checklist:** `hero.jpg` and `letter.jpg` are the two images the loader waits
for, so keep them reasonably sized (≤ 500KB each, ~1600px on the long edge).
Everything else loads lazily. JPEG or WebP; the app serves AVIF/WebP variants
automatically.

---

## 4. Optional: the time capsule in the cloud

Without Supabase the capsule is a local draft. To make it a real capsule that
survives a new device:

```bash
cp .env.example .env.local
```

```ini
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=…      # server-only. never prefix with NEXT_PUBLIC_
TIME_CAPSULE_UNLOCK_DATE=2027-03-14
```

Then run the migration (SQL editor, or `supabase db push`):

```
supabase/migrations/0001_time_capsules.sql
```

**How it is protected**

- RLS is **on with no policies**, and privileges are revoked from `anon` and
  `authenticated` — the public key cannot read or write the table at all.
- All access goes through `/api/capsule/*`, which runs server-side with the
  service-role key. The key is never sent to the browser.
- Sealing returns a 20-character recovery code (~100 bits). Only its SHA-256
  hash is stored, so a database leak does not open the capsule, and a capsule
  cannot be found without the code.
- The unlock date is checked **on the server** before any content is returned.
  A locked capsule returns `{locked: true}` and nothing else — a client clock
  cannot move it.
- Field lengths, the photo size (1.4MB) and its MIME type are validated
  server-side, not just in the form.
- Best-effort in-memory rate limiting on both routes. It is per-instance; put a
  real limiter in front if you deploy this widely.

**Recovery matters.** The code is shown exactly once, with a copy button. If she
loses it, the capsule is gone — that is the trade for nobody else being able to
read it. Tell her to paste it somewhere permanent.

What is deliberately *not* here: no public submission endpoint for the Wall of
Love (messages come from `messages.ts`), no uploading her photo booth pictures,
no storing her wish. The wish stays in the textarea unless she saves it, and
then only to her own browser.

---

## 5. Optional: Spotify

No setup needed — the player wraps Spotify's official embed, which needs no keys.

- Controls shown are only the ones the embed API actually supports: play, pause,
  previous, next and seek. **There is no volume slider**, because the embed
  exposes no volume — a fake one would be a lie.
- Playback state (position, duration, playing) comes from Spotify's own
  `playback_update` events, so the progress bar and the spinning record are
  telling the truth.
- The visualiser is decorative and tied to playback *state*. Spotify gives third
  parties no audio data, so nothing here claims to analyse the waveform.
- If Spotify is blocked or fails, the chapter still works and offers "open this
  song in Spotify".
- No audio is extracted, proxied or downloaded anywhere in this codebase.

`NEXT_PUBLIC_SPOTIFY_CLIENT_ID` is reserved for an authenticated Web Playback
SDK path (Premium only). The adapter boundary is in `src/lib/radio.tsx`; the
embed path is the default and the only one wired up.

---

## 6. Deploy

```bash
npm i -g vercel
vercel          # preview
vercel --prod
```

Add the environment variables in **Project → Settings → Environment Variables**
(not in the repo). `SUPABASE_SERVICE_ROLE_KEY` must be Production/Preview only
and must never carry the `NEXT_PUBLIC_` prefix.

The site sets `robots: noindex, nofollow` — it is for one person, not for search
engines.

---

## 7. How it is put together

```
src/
  app/
    layout.tsx            fonts, metadata, the single stylesheet
    globals.css           design tokens, editorial type scale, texture
    api/spotify/          oEmbed proxy (cached, open.spotify.com only)
    api/capsule/          status · seal · open  (server-validated)
  components/
    Experience.tsx        stage machine + chapter stack + lazy boundaries
    chrome/               masthead, chapter index, cursor, toast
    opening/              loader, countdown, sound invitation
    chapters/             the fourteen chapters, one file each
    cake/ booth/ quiz/ wish/   the interactive studios
    music/                the persistent radio
    ui/                   Chapter, Reveal, Plate, Dialog, Egg, Confetti
  lib/
    gsap.ts               plugin registration, reduced-motion helper
    useSmoothScroll.tsx   Lenis on the single GSAP ticker
    experience.tsx        stage, sound prefs, active chapter, egg hunt
    radio.tsx             Spotify embed controller + playlist state
    sfx.ts                interface sounds, synthesised in the browser
    storage.ts            every localStorage access wrapped in try/catch
design-system/MASTER.md   the design system, and where it overrides advice
```

**Motion.** One Lenis instance driven by the single `gsap.ticker`, feeding
`ScrollTrigger.update()`. No second animation loop anywhere. Canvas loops (the
confetti, the 2D cake, the wish embers) stop the moment they settle. Every GSAP
context is reverted on unmount.

**Reduced motion.** `prefers-reduced-motion: reduce` disables pinning, scrubbing
and the countdown entirely: the opening becomes a static greeting with an
"enter" button, the archives render as an itinerary at every width, and all
content and controls stay reachable. Verified in a real browser, not assumed.

**Sound.** No audio files ship. Interface cues are synthesised with WebAudio
oscillators on first user gesture, so there are no licences, no downloads and no
autoplay fights. Sound is off until she turns it on.

**Performance.** The map, cake studio, photo booth, quiz and time capsule are
dynamic imports — three.js is not in the main bundle, and each lazy chapter's
skeleton carries its real anchor id so the chapter index keeps working while the
chunk loads.

---

## 8. Verified, not assumed

Checked in headless Chrome over the DevTools protocol:

- the loader reports real asset progress (no fake timer) and hands off to the
  countdown, which is skippable;
- all fourteen chapters present; chapter index opens, navigates, closes on
  Escape; focus moves into dialogs and returns on close;
- **no horizontal overflow at 320 / 375 / 390 / 430 / 768 / 1024 / 1440 / 1920**;
- awards reveal, cake studio (3D *and* the 2D WebGL fallback), cake PNG export,
  photo booth render + PNG export, the 7-question quiz reaching a result, the
  Director's Cut, hold-to-wish, all five eggs unlocking the hidden chapter;
- the radio showing real Spotify metadata;
- zero console errors or warnings, with reduced motion verified separately.

---

## 9. Licence & spirit

Private, unlisted, not for distribution. Circulation: one.
# lizabeta
