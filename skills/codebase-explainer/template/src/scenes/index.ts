import type React from "react";
import { Intro, Outro, Pipeline } from "./demo";

/** Maps every scene id in script.json to its component. */
export const SCENES: Record<string, React.FC> = {
  s00_intro: Intro,
  s01_pipeline: Pipeline,
  s02_outro: Outro,
};
