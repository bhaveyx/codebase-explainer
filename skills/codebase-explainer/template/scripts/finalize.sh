#!/usr/bin/env bash
# Render the full video, then loudness-normalise audio to -16 LUFS without re-encoding video.
# Usage: scripts/finalize.sh [output-name]   (run from the project directory)
set -euo pipefail
name="${1:-explainer}"
mkdir -p out
npx remotion render src/index.ts Explainer "out/${name}-raw.mp4" --codec=h264 --crf=20 --audio-codec=aac --concurrency="${CONCURRENCY:-8}"
ffmpeg -loglevel error -y -i "out/${name}-raw.mp4" -c:v copy -af loudnorm=I=-16:TP=-1.5:LRA=11 -c:a aac -b:a 192k -movflags +faststart "out/${name}.mp4"
rm "out/${name}-raw.mp4"
ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "out/${name}.mp4" | awk '{printf "done: out/'"${name}"'.mp4 (%d:%02d)\n", $1/60, $1%60}'
