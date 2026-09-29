---
name: codebase-explainer
description: Makes a narrated, animated video explaining how a codebase works and why it was built that way. Researches the code and its git/PR history with parallel agents, checks every claim against the source, writes a script for a narrator and an on-screen companion, then animates it in Remotion with local text-to-speech. Use when someone wants to understand, onboard onto, or present a codebase, e.g. "explain this repo", "make a video about how our system works", "onboarding video for new engineers".
---

# Codebase Explainer

Produce an explainer video of a codebase that a new or returning engineer can watch once and come away understanding **what happens, where, and why**. It should be accurate enough to trust and entertaining enough to finish.

The point is understanding, and the video is just the format. Each phase below protects one of two things: accuracy (nothing on screen is invented) and clarity (the viewer can explain the system afterwards). Keeping it enjoyable matters too, but in service of those.

## How it's invoked

`/codebase-explainer <github-url or local path> [--review] [--stats] [anything else the user adds]`

With no target, explain the repository in the current directory. **The user should not have to say anything else.** Everything below runs on its own from start to finished MP4; only stop to ask when something blocks you (the repo can't be cloned, a required tool is missing).

- `--review`: pause twice for the user's approval, after the script outline and after the moodboard. Without it, make those calls yourself and keep going.
- `--stats`: track per-phase stats as the run goes (see below).
- Anything else the user writes (an audience, a length, an angle, a focus) overrides the defaults. Follow it, but still do all the research yourself.

`<skill>` below means the directory containing this SKILL.md.

## Before you start

1. Run `<skill>/tools/check.sh`. If anything required is missing, tell the user the exact install command and stop (see [references/troubleshooting.md](references/troubleshooting.md)).
2. Create the working directory `./<repo-name>-explainer/` next to where the user is (never inside the repo being explained), copy `<skill>/template/` into it, and make `research/` there.
3. Get the code into `./<repo-name>-explainer/repo`: for a GitHub URL, `git clone --filter=blob:none <url> repo` (full history, lighter download); for a local path, use it in place and don't write into it.
4. Defaults, unless the user said otherwise: an audience of engineers new to the codebase, the whole system, history included. There is no target length: make it as short as it can be without dropping anything the viewer needs or letting it drag (see "Length" in storytelling.md).
- **Stats are opt-in.** Only if the user asked for tracked stats (e.g. invoked with `--stats`): tell them it adds a small cost (each tracking call is an extra agent turn), then run `uv run <skill>/tools/stats.py start --repo <path-to-repo>` from that directory, and chain `stats.py mark <phase>` onto the first command of each phase (map, research, verify, script, critique, moodboard, voice, build, review, render) and `stats.py note checkin` onto each `--review` stop, so they don't add turns of their own. Otherwise don't run the stats tool at all.

## Phase 1 — Map

Read the README, top-level layout, docs/, package manifests and CI config. Produce a one-screen map: 4–6 subsystems, the data flow between them, and the external services. This map becomes both the research split and the video's "whole machine" scene.

## Phase 2 — Research (parallel)

Spawn one research agent per subsystem, **one history agent, and one public-context agent** (news, reception, rivals, talks and posts by the maintainers, and anything else from outside the code that belongs in the video), all in parallel, using the briefs in [references/research-briefs.md](references/research-briefs.md) with `{OUT_DIR}` set to the project's `research/` folder. Each writes a report to disk with `file:line` citations and marks anything inferred as `UNVERIFIED`.

The briefs ask for the core concepts a user must understand, the *why* (code comments, PR descriptions, commit messages), concrete numbers (thresholds, limits, model names, timeouts), turning points (what was replaced and why), and a worked example.

## Phase 3 — Verify

Before writing a single line of script, personally re-check the load-bearing claims against source: every number that will appear on screen, every "X calls Y", every "we chose A because B". Grep for the constant; read the line. Where the rationale is inferred, the script must say so ("no PR states the reason, but the shape of the move suggests…").

This phase is non-negotiable. A confident video with one wrong number loses the audience's trust in all the others.

## Phase 4 — Script

Read [references/storytelling.md](references/storytelling.md) first; it's guidance, not a checklist. The goal is that the viewer can explain how the system works and why afterwards. Then write `script.json` following [references/scripting.md](references/scripting.md). In short:

- **Coverage first.** List the concepts a user of this project must understand and explain every one, in proportion to its importance.
- **A clear structure**: an opening that says why this is worth watching and what they'll understand, the whole machine on one screen, then one chapter per major part in the order things flow through the system, then a recap.
- **Plain chapter names** that say what the chapter covers ("The Gateway", "Memory and Skills"), never puns or buzzwords. Each chapter starts by saying what the part is for.
- **History and incidents only where they explain the design**: what it used to be, what went wrong, what changed.
- **Two voices.** A narrator explains; a companion who stays on screen asks the questions a viewer would genuinely have, in full sentences, and not too often.
- If you follow an example through the system, carry it to the end.
- Numbers are real. Inferences are phrased as inferences. Add `say` fields for pronunciation, and `pause`/`speed` where delivery matters.

Then run the **fresh-viewer critique** (brief in storytelling.md) with a subagent that has never seen the code. If it can't explain how the system works after reading, or it names core concepts that were skipped, revise before going further.

With `--review`, show the user the script outline (chapter list + one line each) and wait for approval before generating audio. Otherwise, check the outline yourself (clear chapter names, every core concept covered, flow order makes sense) and continue.

## Phase 5 — Moodboard and storyboard

1. **Moodboard** — build 3–4 contrasting style directions (palette, typography, motion character, background, one sample scene) as single still frames using the template kit; see [references/moodboard.md](references/moodboard.md). With `--review`, let the user pick one. Otherwise pick the direction that best fits the codebase and the story (a terse systems library suits a different look than a playful consumer app), note why in the style guide, and continue. Cheap to make either way, and it settles taste before hours of scene work.
2. **Storyboard** — write `STORYBOARD.md`: for every scene and line cue, what is on screen, what animates, and which sound plays. Make each visual explain its line: animate flows, show the data, and use a metaphor where it helps an idea click. Plan 2–3 glimpses of real code. Check that no cue leaves the screen nearly empty and that text will be readable.
3. **Style guide** — fill in [references/style-guide.md](references/style-guide.md) for this video so parallel scene-builders stay consistent.

## Phase 6 — Voice

From the working copy of the template: `uv run <skill>/tools/tts_batch.py script.json public/vo src/timing.json` renders every line with Kokoro (local, free), caches by text hash, and writes per-line durations. **Audio drives timing**: scenes key their animations off line cues, so visuals always land on the words. Check speaking rates for outliers (a garbled line shows up as an abnormal words-per-minute).

## Phase 7 — Build scenes

In the working directory (your copy of `template/`), run `pnpm install`, generate sound effects with `uv run <skill>/tools/sfx.py public/sfx`, and build one component per scene using the kit (`Node`, `Arrow`, `CodeCard`, `Chip`, `Show`, `Heading`, `Quote`, `Tomb`, `MemeTemplate`, `BarRow`, `Waveform`, `Skeptic`…). Scenes read cue frames with `useCue()` — `cue(3)` is the frame where line 3 starts.

For long videos, split scenes across parallel subagents, each given the storyboard section and the style guide. Patterns that work are in [references/visual-patterns.md](references/visual-patterns.md).

## Phase 8 — Review loop

Render contact sheets of stills at line cues: `node scripts/stills.mjs review s03_storage:2:60 s03_storage:5:120 …` (sceneId:line:frameOffset), then read the sheets in `out/stills/`. Inspect them visually and fix overlaps, clipping, captions covering content, empty panels, and text too small. Repeat until clean. Use the checklist in [references/review-checklist.md](references/review-checklist.md) — it includes an accuracy pass, not just a visual one.

## Phase 9 — Render and deliver

`scripts/finalize.sh <name>` renders the MP4 and loudness-normalises to −16 LUFS. If stats were tracked, run `uv run <skill>/tools/stats.py report` (writes `out/STATS.md` with time per phase, agents, tokens, API-equivalent cost, video and research stats, plus `out/stats-card.json`) and render the card with `npx remotion still src/index.ts StatsCard out/stats-card.png --props=out/stats-card.json`. If they weren't, tell the user they can get the same totals for free (and that they describe the whole session, so a session used only for this video gives the cleanest numbers) by running, in their own terminal from the project directory, `uv run <skill>/tools/stats.py report --session latest --repo <path-to-repo>` followed by the card command. Either way, suggest cross-checking tokens and cost with `/usage`, since the tool reads Claude Code's internal transcript format. If the user is on a subscription and wants to know how much of their weekly limit the video used, point them to `tools/usage-statusline.sh` (setup is in its header); with it installed, the report includes the before/after of the 5-hour and weekly limits.

Deliver: the MP4 path (plus STATS.md and the stats card if tracked), chapter timestamps, what was verified vs inferred, anything that surprised you in the code (security issues, dead code, stale docs) — reported to the user, **not** put in the video unless asked.

## Principles

- **Accuracy over polish.** Cut a beautiful scene before shipping a wrong claim.
- **The code is a snapshot.** Put the commit hash on the end card.
- **Explain the why, not the file tree.** Nobody remembers directory names; everyone remembers "we batch writes because the database bills per request".
- **Private stays private.** Research reports and scripts contain the codebase's internals. Never publish them without the owner's explicit approval, and never put secrets found during research on screen.
