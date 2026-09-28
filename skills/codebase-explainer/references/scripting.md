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
      { "who": "S", "text": "Why not one big database?" },
      { "who": "N", "text": "Isolation. One noisy tenant can't slow anyone else down.", "say": "Isolation. One noisy tenant can't slow anyone else down." }
    ]
  }
]
```

- `who`: `N` narrator, `S` skeptic. Voices are set in `tools/tts_batch.py`.
- `text` is what the captions show; `say` (optional) is what TTS speaks — use it for pronunciation (`"SQLite"` → `"sequel-light"`, `"HyDE"` → `"hide"`, acronyms spelled out).
- A scene with `chapter` shows a chapter card while its first line (the spoken title) plays.

## Structure that works

1. **Cold open (≤30 s)** — a few striking numbers about the codebase, then the question the video answers.
2. **The whole machine** — every subsystem on one screen, plus where it runs.
3. **Chapters** following one concrete thing through the system, in the order it flows.
4. **History** where it explains the present ("to understand today's design, meet the one that died").
5. **Cost / trade-offs** chapter if relevant.
6. **Year-in-review / graveyard** (fun, optional).
7. **Recap**: the journey in one breath, then the 3–5 principles that keep recurring.

## The skeptic

The skeptic asks what the viewer is thinking, at the moment they think it:

- "Why not just …?" before every non-obvious design choice
- "Wait, didn't we use something else last month?" before history
- "What stops X from …?" before a safeguard
- Short, conversational, a little cheeky. 1 skeptic line per ~5 narrator lines.

## Rules

- **Every number is real.** It came from code or a PR you read.
- **Inferences sound like inferences.** "No PR states the reason, but…"
- **In-flight work is labelled** ("an open PR proposes…"), never presented as current.
- **One idea per line.** If a line needs two visuals, split it.
- **~150 words per minute.** A 20-minute video is ~3,000 words.
- Avoid reading file paths aloud; show them on screen instead.
- Keep people out of it: no blaming authors, no names attached to bugs.
