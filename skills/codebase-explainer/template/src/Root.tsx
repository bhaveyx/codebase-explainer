import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import { TOTAL_FRAMES } from "./timeline";
import { FPS, H, W } from "./kit/theme";

export const Root: React.FC = () => (
  <Composition id="Explainer" component={Video} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
);
