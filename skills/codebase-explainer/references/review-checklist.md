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

## Entertainment
- [ ] The opening question is clear within 15 seconds and answered explicitly at the end.
- [ ] Every chapter opens with a problem and closes with a one-sentence answer.
- [ ] At least one turning point ("what this replaced, and why") per major chapter.
- [ ] A pattern interrupt at least every 60–90 seconds; no visual held longer than ~40 seconds.
- [ ] Each chapter has a metaphor, not only boxes and arrows.
- [ ] 2–3 real-code moments.
- [ ] Jokes are true facts, delivered deadpan; nobody is mocked.
- [ ] The fresh-viewer critique was run and its points addressed.
- [ ] The social cut makes sense on its own when watched with no context.

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
