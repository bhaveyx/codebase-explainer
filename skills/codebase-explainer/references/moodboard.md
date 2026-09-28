# Moodboard

Settle the look before building 15 scenes. Make 3–4 directions, each a **single still frame** rendered from the template, showing the same content (the "whole machine" diagram + one caption) so the only variable is style.

## Dimensions to vary

| Dimension | Options |
|---|---|
| Palette | dark neon (default kit) · warm paper/editorial · high-contrast mono + one accent · pastel blueprint |
| Type | geometric display (Space Grotesk) · editorial serif headings · all-mono terminal |
| Background | drifting grid · flat colour · paper grain · blueprint lines |
| Motion character | springy/playful · precise/eased · typewriter/terminal |
| Humour level | memes + skeptic face · skeptic only · none (formal) |

## Suggested directions

1. **Midnight Lab** — the kit default: dark, neon accents, drifting grid, springy motion, memes on.
2. **Field Notes** — cream paper, ink-black type, one red accent, serif headings, hand-drawn arrows, no memes.
3. **Terminal** — black, green/amber mono everything, typewriter reveals, ASCII-style diagrams.
4. **Blueprint** — deep blue, white line art, dimension-line arrows, technical and calm.

## How

- Theme tokens live in `template/src/kit/theme.ts`; fonts load via `@remotion/google-fonts`.
- Create `src/moodboard.tsx` with one composition per direction (override `C` and fonts via props), render each with `npx remotion still`, and combine into a contact sheet with ffmpeg `hstack`/`vstack`.
- Show the sheet to the user and ask them to pick (or mix: "palette from 2, motion from 1").
- Record the choice in the style guide.
