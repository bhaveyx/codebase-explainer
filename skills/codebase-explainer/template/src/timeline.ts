import script from "../script.json";
import timing from "./timing.json";
import { buildTimeline } from "./timeline-core.mjs";
import { FPS } from "./kit/theme";
import type { Line } from "./kit/components";

export type Chapter = { n: string; title: string; sub?: string; color?: string };
export type TimedScene = { id: string; chapter?: Chapter; lines: Line[]; frames: number; from: number };

const built = buildTimeline(script as never, timing as never, FPS) as { scenes: TimedScene[]; total: number };
export const scenes = built.scenes;
export const TOTAL_FRAMES = built.total;
