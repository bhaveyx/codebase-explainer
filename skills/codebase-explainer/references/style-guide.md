# Style guide (fill in per video)

Give this to every scene-building subagent together with its storyboard section.

## Canvas
- 1920×1080, 30 fps.
- Safe area: x 110–1810, y 70–900. Captions own y 940–1060; the companion sits in the bottom-right corner the whole time (x > 1650, y > 820), so keep content clear of it.
- Heading at top-left (`<Heading>`), kicker in mono caps above it.

## Palette & type
- Chosen moodboard direction: `____`
- Accent per subsystem (keep consistent across the whole video):
  - `____` → `C.coral` · `____` → `C.sky` · `____` → `C.amber` · `____` → `C.mint` · `____` → `C.violet`
- Display font for titles, sans for body, mono for code, numbers, paths and labels.
- Minimum on-screen text: 20 px for labels and code, 26 px for body text. If it doesn't fit at that size, show less.
- No near-empty frames: if a line has nothing new to show, keep the previous visual and build on it.

## Motion
- Enter with `Appear`/`Show` (spring, ~14 frames). Never pop content in without motion; never animate for more than ~1 s.
- Stagger lists 8–25 frames per item.
- Everything keys off `cue(i)` — never hard-coded absolute frames.
- One focal element per cue; dim or remove the previous panel with `Show from/to`.

## Components
- Flows: `Node` + `Arrow` (packets flow once drawn).
- Code: `CodeCard` (typing effect; highlight the line being discussed).
- Lists of tech: `Chip`. Principles/quotes: `Quote`. Removed things: `Tomb`. Comparisons: `BarRow`.
- Humour: `MemeTemplate` at most once per chapter; `Stamp` for punchlines.

## Sound
- Scene change: whoosh. Chapter card: impact. Reveals: pop/click (quiet, 0.2–0.3). Punchlines: impact. Resolution: ding.
- Music stays under the voice (≈0.1 volume).

## Don'ts
- No text over the caption band.
- No more than ~12 words of body text per visual beat.
- No invented numbers in visuals — if it's on screen, it's in the research.
