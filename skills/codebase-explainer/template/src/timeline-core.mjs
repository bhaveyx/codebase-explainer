// Shared by the Remotion composition and tools/stills.mjs so cue frames are computed identically.
const LEAD_IN = 12;
const GAP = 9;
const SKEPTIC_GAP = 14;
const TAIL = 24;
/** Extra frames after a chapter scene's spoken title so the chapter card can play. */
const CHAPTER_HOLD = 30;

/**
 * Lays scenes and lines out on the frame timeline from measured voice durations.
 * @param {{id: string, chapter?: object, lines: {who: "N"|"S", text: string, pause?: number}[]}[]} script
 * @param {Record<string, {file: string, sec: number}[]>} timing
 */
export function buildTimeline(script, timing, fps = 30) {
  let from = 0;
  const scenes = script.map((sc) => {
    if (!timing[sc.id]) throw new Error(`no voice timing for scene ${sc.id}; run tools/tts_batch.py`);
    let t = LEAD_IN;
    const lines = sc.lines.map((l, i) => {
      const { file, sec } = timing[sc.id][i];
      const frames = Math.ceil(sec * fps);
      const start = t;
      t += frames + (l.who === "S" || sc.lines[i + 1]?.who === "S" ? SKEPTIC_GAP : GAP) + Math.round((l.pause ?? 0) * fps);
      if (i === 0 && sc.chapter) t += CHAPTER_HOLD;
      return { who: l.who, text: l.text, file, start, frames };
    });
    const frames = t + TAIL;
    const scene = { id: sc.id, chapter: sc.chapter, lines, frames, from };
    from += frames;
    return scene;
  });
  return { scenes, total: from };
}
