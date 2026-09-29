# Scripting

## Format

`script.json` is an array of scenes. Each scene has an `id`, optional `chapter`, and `lines`:

```json
[
  {
    "id": "s02_storage",
    "chapter": { "n": "2", "title": "Storage", "sub": "where bytes go to live" },
    "lines": [
      { "who": "N", "text": "Chapter two. Storage." },
      { "who": "N", "text": "Every write lands in a per-tenant SQLite file first." },
      { "who": "S", "text": "Why not one big database?", "speed": 1.1 },
      { "who": "N", "text": "They tried that. For a year.", "pause": 0.8 },
      { "who": "N", "text": "One noisy tenant slowed everyone else down, so they split it." }
    ]
  }
]
```

- `who`: `N` narrator, `S` skeptic. Voices are set in `tools/tts_batch.py`.
- `text` is what the captions show; `say` (optional) is what TTS speaks — use it for pronunciation (`"SQLite"` → `"sequel-light"`, `"HyDE"` → `"hide"`, acronyms spelled out).
- `speed` (optional) overrides the voice's default speed for that line (0.92–1.15 is the useful range).
- `pause` (optional) adds that many seconds of silence after the line, before the next one. Use it before reveals and after punchlines.
- A scene with `chapter` shows a chapter card while its first line (the spoken title) plays.

## Structure that works

See [storytelling.md](storytelling.md) for the reasoning. A shape that works for most codebases:

1. **Opening (under 30 s)**: what the project is, why it's worth watching, and what the viewer will understand by the end.
2. **The whole machine**: every major part on one screen, plus where it runs.
3. **Chapters**, one per major part, in the order data or control flows through the system. Plain names. Each opens by saying what the part is for.
4. **History** where it explains the present.
5. **Cost / trade-offs** chapter if relevant.
6. **Recap**: the journey in one breath, then the few ideas that keep coming back.

## The companion

The second voice is a companion watching alongside the viewer. The template keeps them on screen the whole time, so they don't need to speak often to feel present.

- They ask what a viewer would genuinely wonder at that moment, as a natural sentence: "Hang on, if nothing ever resets, doesn't the conversation just grow forever?" rather than "Why?".
- A few per chapter at most. Some chapters need none.
- The narrator answers and lands the key ideas. The companion can put it in their own words at the end, once they've understood.

## Rules

- **Every number is real.** It came from code or a PR you read.
- **Inferences sound like inferences.** "No PR states the reason, but…"
- **In-flight work is labelled** ("an open PR proposes…"), never presented as current.
- **One idea per line.** If a line needs two visuals, split it.
- **~150 words per minute.** Use it to check length: if the script runs long, cut ideas the viewer won't miss rather than speeding up delivery.
- Avoid reading file paths aloud; show them on screen instead.
- Keep people out of it: no blaming authors, no names attached to bugs.
