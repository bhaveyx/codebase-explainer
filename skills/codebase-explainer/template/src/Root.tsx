import React from "react";
import { Composition, Still } from "remotion";
import { Video } from "./Video";
import { StatsCard, defaultStatsCard } from "./StatsCard";
import { TOTAL_FRAMES } from "./timeline";
import { FPS, H, W } from "./kit/theme";

export const Root: React.FC = () => (
  <>
    <Composition id="Explainer" component={Video} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    <Still id="StatsCard" component={StatsCard} width={W} height={H} defaultProps={defaultStatsCard} />
  </>
);
