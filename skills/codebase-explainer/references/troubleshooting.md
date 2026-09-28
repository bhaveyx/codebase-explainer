# Troubleshooting

## Kokoro TTS: `Error processing file '.../espeak-ng-data/phontab'`
The `espeakng-loader` wheel ships with a hard-coded data path. Install system espeak-ng and point Kokoro at it — `tools/tts_batch.py` already does this for Homebrew:

```bash
brew install espeak-ng            # macOS
sudo apt-get install espeak-ng    # Debian/Ubuntu (then set ESPEAK_LIB / ESPEAK_DATA)
```

Override paths with `ESPEAK_LIB=/path/libespeak-ng.so ESPEAK_DATA=/path/espeak-ng-data`.

## First TTS run is slow
It downloads the Kokoro-82M weights (~300 MB) from Hugging Face once. Later runs are cached per line.

## Rendering stills is slow / the machine grinds
Don't launch many `npx remotion still` processes — each re-bundles the project. Use `scripts/stills.mjs`, which bundles once and renders all requested frames with one browser.

## Full render time
Roughly 40–50 fps at 1080p with `--concurrency=8` on a 10-core laptop: a 20-minute video renders in ~15 minutes.

## Audio too quiet
`scripts/finalize.sh` runs ffmpeg `loudnorm` (−16 LUFS, −1.5 dBTP) and copies the video stream untouched.

## Emoji render as boxes
Remotion uses headless Chrome; emoji come from the OS emoji font. On Linux install `fonts-noto-color-emoji`.
