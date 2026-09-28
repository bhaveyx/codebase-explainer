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
4. It writes a script with two voices: a narrator who explains, and a curious sidekick who asks the questions you'd probably ask.
5. It shows you a few visual styles to choose from, then plans each scene.
6. It records the voiceover and builds the animations.
7. It renders the final video.

You get an MP4 with narration, captions, diagrams, and music, plus the research notes it was built from.

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

## How long it takes

A 20-minute video usually takes an hour or two from start to finish. Most of that is research and building scenes. The final render takes around 15 minutes on a modern laptop.

## Privacy

The skill reads your whole codebase to understand it, and everything it produces stays on your machine. If your code is private, review the video and notes before sharing them.

## Built with

[Remotion](https://www.remotion.dev) for animation and [Kokoro](https://huggingface.co/hexgrad/Kokoro-82M) for text-to-speech.

## License

MIT
