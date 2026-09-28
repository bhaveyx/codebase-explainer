# /// script
# requires-python = ">=3.10,<3.13"
# dependencies = ["kokoro>=0.9", "soundfile", "numpy"]
# ///
"""Render every script line to a wav with Kokoro and write per-line durations.

Usage: uv run tools/tts_batch.py script.json <out_dir> <timing.json>

Lines are cached by a hash of (voice, speed, spoken text), so editing one line
only re-renders that line. Timing drives every visual cue in the video.
"""
import hashlib
import json
import os
import platform
import sys

import numpy as np
import soundfile as sf

# The espeakng-loader wheel bakes in a data path from its build machine, which
# breaks phonemization; point it at a system espeak-ng instead.
_DEFAULTS = {
    "Darwin": ("/opt/homebrew/lib/libespeak-ng.dylib", "/opt/homebrew/share/espeak-ng-data"),
    "Linux": ("/usr/lib/x86_64-linux-gnu/libespeak-ng.so.1", "/usr/lib/x86_64-linux-gnu/espeak-ng-data"),
}
lib, data = _DEFAULTS.get(platform.system(), (None, None))
lib = os.environ.get("ESPEAK_LIB", lib)
data = os.environ.get("ESPEAK_DATA", data)
if lib and data and os.path.exists(lib):
    import espeakng_loader
    from phonemizer.backend.espeak.wrapper import EspeakWrapper

    espeakng_loader.get_library_path = lambda: lib
    espeakng_loader.get_data_path = lambda: data
    EspeakWrapper.set_library(lib)
    EspeakWrapper.set_data_path(data)

from kokoro import KPipeline  # noqa: E402

# Narrator and skeptic. Browse voices: https://huggingface.co/hexgrad/Kokoro-82M
VOICES = {"N": ("af_heart", 1.05), "S": ("am_puck", 1.08)}

script_path, out_dir, timing_path = sys.argv[1:4]
os.makedirs(out_dir, exist_ok=True)
script = json.load(open(script_path))
pipelines: dict[str, KPipeline] = {}
timing = {}

for scene in script:
    rows = []
    for i, line in enumerate(scene["lines"]):
        voice, speed = VOICES[line["who"]]
        spoken = line.get("say", line["text"])
        digest = hashlib.sha1(f"{voice}|{speed}|{spoken}".encode()).hexdigest()[:10]
        name = f"{scene['id']}_{i:02d}_{digest}.wav"
        path = os.path.join(out_dir, name)
        if not os.path.exists(path):
            lang = voice[0]
            if lang not in pipelines:
                pipelines[lang] = KPipeline(lang_code=lang, repo_id="hexgrad/Kokoro-82M")
            chunks = [a.numpy() if hasattr(a, "numpy") else a for _, _, a in pipelines[lang](spoken, voice=voice, speed=speed)]
            audio = np.concatenate(chunks)
            audio = audio / (np.max(np.abs(audio)) or 1) * 0.89
            sf.write(path, audio.astype(np.float32), 24000)
            print("rendered", name, flush=True)
        seconds = sf.info(path).duration
        words = len(spoken.split())
        wpm = words / seconds * 60 if seconds else 0
        if words > 4 and not 90 <= wpm <= 230:
            print(f"check {name}: {wpm:.0f} wpm looks off — listen or rephrase", flush=True)
        rows.append({"file": name, "sec": round(seconds, 3)})
    timing[scene["id"]] = rows

json.dump(timing, open(timing_path, "w"), indent=1)
total = sum(r["sec"] for rows in timing.values() for r in rows)
print(f"ok: {total / 60:.1f} min of voice across {len(timing)} scenes")
