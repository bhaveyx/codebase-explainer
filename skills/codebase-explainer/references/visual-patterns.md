# Visual patterns that work

| Content | Pattern | Kit pieces |
|---|---|---|
| Request/data flow | Nodes left→right, arrows draw on and carry packets; active node glows while it's being discussed | `Node`, `Arrow` |
| "Every user gets their own…" | Grid of rows (one per tenant) × columns (services) | `Appear`, chips |
| Thresholds / tiers | Gauge or bar with labelled marks; an animated needle | custom + `Appear` |
| Buffer / batching | A tank filling, with trigger lines at each threshold | `lerp` widths |
| Platform limits | Budget bar vs a hard red limit line ("80 of 100 ms") | `lerp` |
| Parallel fan-out | N lanes filling, one dashed "spare" lane | flex boxes |
| Before vs after | Two boxes side by side, red then green; stamp between | `Box`, `Stamp` |
| Pipeline with many stages | Left rail listing stages; the current one lights up; main panel swaps per cue | `Show`, rail |
| Code quote | Typing `CodeCard` with the relevant line highlighted | `CodeCard` |
| A design rule | Full-screen quote over a dimmed scene | `Quote` |
| Ranking/fusion | Several ranked lists slide together into one fused list with scores | `Appear`, `lerp` |
| Calibration ("why this threshold?") | Histogram of noise vs signal with the threshold line in the gap | bars + `lerp` |
| Timeline / eras | Horizontal line, milestone dots, era bands | `Appear` |
| Removed feature | Tombstone rising from below, with dates and the PR that killed it | `Tomb` |
| Model/tool churn | Rapid chips with strike-through, one click sound each; the current one in green | `Chip`, `Sfx` |
| Recap | Chips for each verb of the journey lighting up in sync with the narration | `lerp` per chip |

## Humour that lands in technical videos
Use these when they fit the explanation, not to fill a quota:
- A meme template that sums up an idea the video just explained (expanding-brain for increasingly clever stages of an algorithm; distracted-boyfriend for a dependency swap the video explains).
- The companion's reactions: it's on screen the whole time, so a look or a short remark lands naturally.
- A stamp on a real turning point ("DEPRECATED", "REWRITTEN").
- A graveyard of removed features, when their removal explains today's design.

Meme images are not bundled (copyright). Download templates yourself (e.g. from imgflip) into `public/img/` and position captions with `MemeTemplate` labels (percent coordinates).
