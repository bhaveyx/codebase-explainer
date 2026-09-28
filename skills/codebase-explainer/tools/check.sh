#!/usr/bin/env bash
# Verify the local toolchain the skill needs; prints what's missing and how to install it.
missing=0
need() { if command -v "$1" >/dev/null 2>&1; then printf "ok   %-10s %s\n" "$1" "$($1 --version 2>&1 | head -1)"; else printf "MISS %-10s %s\n" "$1" "$2"; missing=1; fi; }
need node   "https://nodejs.org (v20+)"
need pnpm   "npm i -g pnpm"
need ffmpeg "brew install ffmpeg | apt-get install ffmpeg"
need uv     "curl -LsSf https://astral.sh/uv/install.sh | sh"
need espeak-ng "brew install espeak-ng | apt-get install espeak-ng"
need gh     "optional: https://cli.github.com (PR history research)"
if [ -d "/Applications/Google Chrome.app" ] || command -v google-chrome >/dev/null 2>&1 || command -v chromium >/dev/null 2>&1; then echo "ok   chrome"; else echo "note chrome not found — Remotion will download a headless shell on first render"; fi
exit $missing
