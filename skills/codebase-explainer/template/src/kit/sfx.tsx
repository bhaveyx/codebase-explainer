import React from "react";
import { Audio, Sequence, staticFile } from "remotion";

/** One-shot sound effect from public/sfx, starting at a scene-relative frame. */
export const Sfx: React.FC<{ at: number; src: "whoosh" | "pop" | "click" | "impact" | "ding" | "riser" | "buzz" | "typing"; volume?: number }> = ({ at, src, volume = 0.4 }) => (
  <Sequence from={Math.max(0, Math.round(at))} durationInFrames={60}>
    <Audio src={staticFile(`sfx/${src}.wav`)} volume={volume} />
  </Sequence>
);
