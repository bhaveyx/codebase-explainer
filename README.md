# Codebase Explainer

Turn any codebase into a narrated, animated video that explains how it works and why it was built that way.

It's a skill for coding agents like Claude Code, Codex, and Cursor. Point it at a repository and it researches the code and its history, double-checks what it learned, and produces a video you can watch to get up to speed.

## Who it's for

- **New team members** who want to understand a system before diving into the code.
- **Anyone returning to a project** after it has changed a lot.
- **Teams** who want to explain their architecture to others.
- **Open source maintainers** who want to give contributors a guided tour.

## What happens when you run it

1. It maps out the main parts of the codebase.
2. It researches each part in parallel, along with the project's commit and pull request history, to understand not just what the code does but why.
3. It checks the important facts against the source code, so the video doesn't state anything it can't back up.
4. It writes the script like a story, not a manual: an opening question that gets answered by the end, the turning points that shaped the code ("we used to do it this way, here's why we switched"), and the funny true moments hiding in the history. Two voices tell it: a narrator who explains, and a curious sidekick who asks the questions you'd probably ask.
5. A second agent reads the script as a first-time viewer and points out anything confusing or boring, so it gets fixed before any video is made.
6. It shows you a few visual styles to choose from, then plans each scene.
7. It records the voiceover and builds the animations.
8. It renders the final video.

You get an MP4 with narration, captions, diagrams, and music, a short highlight cut that's ready to share (in landscape or phone format), and the research notes it was built from. You also get a summary of how the video was made: how long it took, how many agents worked on it, and what it cost, plus a stats card image you can post alongside it.

## Install

With any agent that supports skills:

```bash
npx skills add bhaveyx/codebase-explainer
```

Or as a Claude Code plugin:

```bash
claude plugin marketplace add bhaveyx/codebase-explainer
claude plugin install codebase-explainer@codebase-explainer
```

Then open the repo you want explained and run `/codebase-explainer`, or just ask your agent to make an explainer video.

## Requirements

The video is rendered on your computer, so you'll need:

- Node 20 or newer, and pnpm
- ffmpeg
- [uv](https://docs.astral.sh/uv/) (for the voice tools)
- espeak-ng
- Chrome

On a Mac you can install most of these with:

```bash
brew install node pnpm ffmpeg uv espeak-ng
```

Run `skills/codebase-explainer/tools/check.sh` to see if anything is missing.

The voices, sound effects, and music are all generated locally, so there are no extra services to sign up for. The first run downloads a voice model of about 300 MB.

## Tracking what a video used

On a Claude subscription, you may want to know how much of your weekly limit a video took. The skill includes a small status line for Claude Code that shows your 5-hour and weekly usage and quietly records it, so the stats report can show the before and after. It runs on your machine and doesn't use any tokens. To turn it on, add this to `~/.claude/settings.json`:

```json
"statusLine": { "type": "command", "command": "<path-to-this-repo>/skills/codebase-explainer/tools/usage-statusline.sh" }
```

When the video is done, run this from the video's folder for a summary of time, agents, tokens, cost, and plan usage:

```bash
uv run <path-to-this-repo>/skills/codebase-explainer/tools/stats.py report --session latest --repo <path-to-the-repo-you-explained>
```

Usage limits are shared across your whole account, so for a clean number, avoid using Claude for other things while the video is being made.

## How long it takes

Videos are 8–12 minutes by default, and a video that length usually takes an hour or two from start to finish. Most of that is research and building scenes. The final render takes under 10 minutes on a modern laptop.

## Privacy

The skill reads your whole codebase to understand it, and everything it produces stays on your machine. If your code is private, review the video and notes before sharing them.

## Built with

[Remotion](https://www.remotion.dev) for animation and [Kokoro](https://huggingface.co/hexgrad/Kokoro-82M) for text-to-speech.

## License

MIT
