// Render review stills at line cues and tile them into 2x2 contact sheets.
// Usage: node scripts/stills.mjs <sheetName> <sceneId>:<line>[:<frameOffset>] ...
// Bundles once and reuses one browser, which is far faster than repeated `remotion still` calls.
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { buildTimeline } from "../src/timeline-core.mjs";

const [, , sheet, ...specs] = process.argv;
if (!sheet || specs.length === 0) {
  console.error("usage: node scripts/stills.mjs <sheetName> <sceneId>:<line>[:<offset>] ...");
  process.exit(1);
}
const script = JSON.parse(readFileSync("script.json", "utf8"));
const timing = JSON.parse(readFileSync("src/timing.json", "utf8"));
const { scenes } = buildTimeline(script, timing);
const frameOf = (spec) => {
  const [id, line, offset = "45"] = spec.split(":");
  const sc = scenes.find((s) => s.id === id);
  if (!sc) throw new Error(`unknown scene ${id}`);
  const l = sc.lines[Number(line)];
  if (!l) throw new Error(`scene ${id} has no line ${line}`);
  return sc.from + l.start + Number(offset);
};

const outDir = path.resolve("out/stills");
mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: "Explainer" });
const files = [];
for (const spec of specs) {
  const output = path.join(outDir, `${spec.replaceAll(":", "_")}.png`);
  await renderStill({ serveUrl, composition, frame: frameOf(spec), output, scale: 0.5 });
  files.push(output);
}
for (let i = 0; i < files.length; i += 4) {
  const group = files.slice(i, i + 4);
  while (group.length < 4) group.push(group[group.length - 1]);
  const sheetPath = path.join(outDir, `${sheet}_${i / 4}.jpg`);
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...group.flatMap((f) => ["-i", f]), "-filter_complex", "[0][1]hstack[a];[2][3]hstack[b];[a][b]vstack", sheetPath]);
  console.log(sheetPath);
}
