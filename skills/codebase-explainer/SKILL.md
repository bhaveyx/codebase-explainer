---
name: codebase-explainer
description: Makes a narrated, animated video explaining how a codebase works and why it was built that way. Researches the code and its git/PR history with parallel agents, checks every claim against the source, writes a script for a narrator and a skeptic, then animates it in Remotion with local text-to-speech. Use when someone wants to understand, onboard onto, or present a codebase, e.g. "explain this repo", "make a video about how our system works", "onboarding video for new engineers".
---

# Codebase Explainer

Produce an explainer video (8–12 minutes by default) of a codebase that a new or returning engineer can watch once and come away understanding **what happens, where, and why**. It should be accurate enough to trust and entertaining enough to finish.

The point is understanding, and the video is just the format. Each phase below protects one of two things: accuracy (nothing on screen is invented) and watchability (pacing, visuals, humour).

## Before you start

- Run `tools/check.sh` — it verifies Node 20+, pnpm, ffmpeg, uv, Chrome, espeak-ng. Fix anything missing before researching (see [references/troubleshooting.md](references/troubleshooting.md)).
- Ask the user, in one message: audience (new hire / founder / public), target length, which subsystems matter most, and whether history ("how we got here") is wanted. Defaults: engineers, 8–12 min, everything, yes.
- Work in a scratch directory **outside** the target repo. Never commit video artefacts into the codebase being explained.

## Phase 1 — Map

Read the README, top-level layout, docs/, package manifests and CI config. Produce a one-screen map: 4–6 subsystems, the data flow between them, and the external services. This map becomes both the research split and the video's "whole machine" scene.

## Phase 2 — Research (parallel)

Spawn one research agent per subsystem **plus one history agent**, all in parallel, using the briefs in [references/research-briefs.md](references/research-briefs.md). Each writes a report to disk with `file:line` citations and marks anything inferred as `UNVERIFIED`.

The briefs ask for the *why* (code comments, PR descriptions, commit messages), concrete numbers (thresholds, limits, model names, timeouts), failure stories, turning points (what was replaced and why), absurd-but-true moments, and a worked example. These are what make a video memorable.

## Phase 3 — Verify

Before writing a single line of script, personally re-check the load-bearing claims against source: every number that will appear on screen, every "X calls Y", every "we chose A because B". Grep for the constant; read the line. Where the rationale is inferred, the script must say so ("no PR states the reason, but the shape of the move suggests…").

This phase is non-negotiable. A confident video with one wrong number loses the audience's trust in all the others.

## Phase 4 — Script

Write `script.json` following [references/scripting.md](references/scripting.md) and [references/storytelling.md](references/storytelling.md):

- **A mystery** posed in the first 15 seconds and paid off at the end.
- **Chapters open with a problem**, not a name, and close with a one-sentence answer.
- **Turning points**: tell how each part got to be this way, what it replaced and why. This is what makes the video feel personal.
- **Comedy from true facts**, delivered deadpan. A pattern interrupt every 60–90 seconds.
- **Voice direction** with `pause` and `speed`; mark 6–10 `highlight` lines for the social cut.

- **Two voices.** A narrator explains; a skeptic interrupts with the question the viewer is thinking — usually "why?". Most of the understanding, and most of the humour, comes from the skeptic.
- **Follow one concrete thing through the system** (one request, one sentence, one file upload). Abstractions hang off the example.
- **Chapters**, each opening with a spoken title. ~150 words per minute of video.
- Numbers are real and on screen. Inferences are phrased as inferences. History appears where it explains the present.
- Add `say` fields for pronunciation (acronyms, product names).

Then run the **fresh-viewer critique** (brief in storytelling.md) with a subagent that has never seen the code, and revise for confusion, boredom, and jokes that fell flat.

Show the user the script outline (chapter list + one line each) before generating audio.

## Phase 5 — Moodboard and storyboard

1. **Moodboard** — build 3–4 contrasting style directions (palette, typography, motion character, background, one sample scene) as single still frames using the template kit; see [references/moodboard.md](references/moodboard.md). Let the user pick one. Cheap to make, and it settles taste before hours of scene work.
2. **Storyboard** — write `STORYBOARD.md`: for every scene and line cue, what is on screen, what animates, and which sound plays. Give every chapter a physical metaphor before falling back on boxes and arrows, and plan 2–3 real-code moments. Review it for density (one idea per cue), variety (not five diagrams in a row), and pacing (no composition held longer than ~40 seconds).
3. **Style guide** — fill in [references/style-guide.md](references/style-guide.md) for this video so parallel scene-builders stay consistent.

## Phase 6 — Voice

From the working copy of the template: `uv run <skill>/tools/tts_batch.py script.json public/vo src/timing.json` renders every line with Kokoro (local, free), caches by text hash, and writes per-line durations. **Audio drives timing**: scenes key their animations off line cues, so visuals always land on the words. Check speaking rates for outliers (a garbled line shows up as an abnormal words-per-minute).

## Phase 7 — Build scenes

Copy `template/` to the working directory, `pnpm install`, generate sound effects with `uv run <skill>/tools/sfx.py public/sfx`, and build one component per scene using the kit (`Node`, `Arrow`, `CodeCard`, `Chip`, `Show`, `Heading`, `Quote`, `Tomb`, `MemeTemplate`, `BarRow`, `Waveform`, `Skeptic`…). Scenes read cue frames with `useCue()` — `cue(3)` is the frame where line 3 starts.

For long videos, split scenes across parallel subagents, each given the storyboard section and the style guide. Patterns that work are in [references/visual-patterns.md](references/visual-patterns.md).

## Phase 8 — Review loop

Render contact sheets of stills at line cues: `node scripts/stills.mjs review s03_storage:2:60 s03_storage:5:120 …` (sceneId:line:frameOffset), then read the sheets in `out/stills/`. Inspect them visually and fix overlaps, clipping, captions covering content, empty panels, and text too small. Repeat until clean. Use the checklist in [references/review-checklist.md](references/review-checklist.md) — it includes an accuracy pass, not just a visual one.

## Phase 9 — Render and deliver

`scripts/finalize.sh <name>` renders the MP4 and loudness-normalises to −16 LUFS. Then `node scripts/social-cut.mjs --in out/<name>.mp4` makes a 60–90 s highlight cut from the `highlight` lines (add `--vertical` for a 9:16 phone version). Deliver: the MP4 and social cut paths, chapter timestamps, what was verified vs inferred, anything that surprised you in the code (security issues, dead code, stale docs) — reported to the user, **not** put in the video unless asked.

## Principles

- **Accuracy over polish.** Cut a beautiful scene before shipping a wrong claim.
- **The code is a snapshot.** Put the commit hash on the end card.
- **Explain the why, not the file tree.** Nobody remembers directory names; everyone remembers "we batch writes because the database bills per request".
- **Private stays private.** Research reports and scripts contain the codebase's internals. Never publish them without the owner's explicit approval, and never put secrets found during research on screen.
