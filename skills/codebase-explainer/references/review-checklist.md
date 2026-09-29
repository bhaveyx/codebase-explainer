# Review checklist

Run after every batch of scenes, on stills rendered at each line cue (`node scripts/stills.mjs <sheet> sceneId:line:offset …`).

## Visual
- [ ] Nothing overlaps (nodes vs panels, stamps vs text, arrows vs labels).
- [ ] Nothing enters the caption band (y > ~930) or the skeptic corner.
- [ ] No text clipped, wrapped mid-word, or overflowing a box.
- [ ] Every panel is filled with purpose — no large empty regions left over from a previous cue.
- [ ] The thing being discussed is visually emphasised (glow, highlight, colour).
- [ ] Headings don't collide when content moves (e.g. a diagram lifted to make room).
- [ ] Text is readable at 50% scale.

## Timing
- [ ] Each visual appears on (or just before) the line that mentions it, not before the previous line ends.
- [ ] Chapter cards clear before the first content line.
- [ ] No scene holds a static frame for more than ~8 s without motion.

## Does it teach?
- [ ] Watching it, could a newcomer now explain how the system works, part by part?
- [ ] Every core concept of the project is explained (check against the README and docs), in proportion to its importance.
- [ ] Chapter names say plainly what each chapter covers, and each chapter starts by saying what the part is for.
- [ ] The chapters follow the order things flow through the system.
- [ ] Every incident or anecdote explains a design decision; anything that's just trivia is gone.
- [ ] A worked example, if there is one, is carried through to its result.
- [ ] The opening says why this is worth watching, and the video delivers on it.
- [ ] The companion's questions are ones a viewer would really ask, in full sentences, and not too frequent.
- [ ] The fresh-viewer critique was run and its points addressed.

## Watchability
- [ ] No stretch feels slow, and nothing is held long without something new happening on screen.
- [ ] Humour, where there is some, comes from the explanation and doesn't pull away from it.

## Accuracy
- [ ] Every number on screen appears in a research report with a citation — and was verified.
- [ ] Examples with computed values (scores, costs) are computed correctly.
- [ ] In-flight / proposed work is labelled as such.
- [ ] No secrets, keys, customer data, or personal data on screen.
- [ ] Dates and PR numbers match the history report.

## Audio (after the full render)
- [ ] Loudness normalised (−16 LUFS integrated).
- [ ] Spot-check 3 random timestamps: captions match the voice.
- [ ] Words-per-minute outliers in TTS re-generated (garbled lines).
