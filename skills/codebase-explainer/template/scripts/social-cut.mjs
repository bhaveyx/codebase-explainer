// Stitch every line marked "highlight": true into a short social cut of the rendered video.
// Usage: node scripts/social-cut.mjs [--in out/explainer.mp4] [--out out/explainer-social.mp4] [--vertical]
// --vertical produces 1080x1920 with the video centred over a blurred copy of itself.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { buildTimeline } from "../src/timeline-core.mjs";

const FPS = 30;
const LEAD = 8; // frames kept before a highlighted line starts
const TRAIL = 15; // frames kept after it ends
const FADE = 0.25; // seconds

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};
const input = flag("--in", "out/explainer.mp4");
const vertical = args.includes("--vertical");
const output = flag("--out", input.replace(/\.mp4$/, vertical ? "-social-vertical.mp4" : "-social.mp4"));
if (!existsSync(input)) {
  console.error(`missing ${input}; render the full video first (scripts/finalize.sh)`);
  process.exit(1);
}

const script = JSON.parse(readFileSync("script.json", "utf8"));
const timing = JSON.parse(readFileSync("src/timing.json", "utf8"));
const { scenes } = buildTimeline(script, timing, FPS);

const ranges = [];
for (const sc of scenes) {
  for (const l of sc.lines) {
    if (!l.highlight) continue;
    const start = Math.max(0, sc.from + l.start - LEAD);
    const end = sc.from + l.start + l.frames + TRAIL;
    const prev = ranges[ranges.length - 1];
    if (prev && start <= prev[1] + FPS) prev[1] = end; // merge neighbours so we don't cut mid-thought
    else ranges.push([start, end]);
  }
}
if (ranges.length === 0) {
  console.error('no lines marked "highlight": true in script.json');
  process.exit(1);
}

const parts = ranges.map(([a, b], i) => {
  const s = (a / FPS).toFixed(3);
  const e = (b / FPS).toFixed(3);
  const d = ((b - a) / FPS).toFixed(3);
  const out = (Number(d) - FADE).toFixed(3);
  return (
    `[0:v]trim=${s}:${e},setpts=PTS-STARTPTS,fade=in:d=${FADE},fade=out:st=${out}:d=${FADE}[v${i}];` +
    `[0:a]atrim=${s}:${e},asetpts=PTS-STARTPTS,afade=in:d=${FADE},afade=out:st=${out}:d=${FADE}[a${i}];`
  );
});
const concatInputs = ranges.map((_, i) => `[v${i}][a${i}]`).join("");
let graph = parts.join("") + `${concatInputs}concat=n=${ranges.length}:v=1:a=1[cv][ca]`;
if (vertical) {
  graph +=
    ";[cv]split[bg][fg];[bg]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=30:3,eq=brightness=-0.15[bgb];" +
    "[fg]scale=1080:-2[fgs];[bgb][fgs]overlay=(W-w)/2:(H-h)/2[outv]";
}
execFileSync("ffmpeg", [
  "-loglevel", "error", "-y", "-i", input,
  "-filter_complex", graph,
  "-map", vertical ? "[outv]" : "[cv]", "-map", "[ca]",
  "-c:v", "libx264", "-crf", "20", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
  output,
]);
const total = ranges.reduce((acc, [a, b]) => acc + (b - a), 0) / FPS;
console.log(`${output}: ${ranges.length} clips, ${total.toFixed(1)} s`);
