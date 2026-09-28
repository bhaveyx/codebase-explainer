import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "../kit/theme";
import { Arrow, Node, Title, Appear, useCue } from "../kit/components";
import { Chip, Heading, Quote, Show } from "../kit/more";
import { Sfx } from "../kit/sfx";

export const Intro: React.FC = () => {
  const cue = useCue();
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ textAlign: "center", marginTop: -120 }}>
          <Title at={cue(0)} kicker="template" title="Codebase Explainer" size={120} />
        </div>
      </AbsoluteFill>
      <Show from={cue(2)}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", justifyContent: "center", gap: 20 }}>
          {["researched", "verified", "narrated", "animated"].map((t, i) => (
            <Chip key={t} at={cue(2) + 20 + i * 18} color={[C.sky, C.mint, C.amber, C.pink][i]} big>{t}</Chip>
          ))}
        </div>
      </Show>
    </AbsoluteFill>
  );
};

const PHASES = [
  { icon: "🗺️", title: "Map", color: C.sky },
  { icon: "🔎", title: "Research", color: C.violet },
  { icon: "✅", title: "Verify", color: C.mint },
  { icon: "✍️", title: "Script", color: C.amber },
  { icon: "🎙️", title: "Voice", color: C.coral },
];

export const Pipeline: React.FC = () => {
  const cue = useCue();
  const at = (i: number) => (i < 2 ? cue(1) + i * 40 : cue(2) + (i - 2) * 40);
  return (
    <AbsoluteFill>
      <Heading at={cue(1)} kicker="chapter 1 · the pipeline" color={C.amber}>From repo to video</Heading>
      {PHASES.map((p, i) => (
        <React.Fragment key={p.title}>
          <Node at={at(i)} x={250 + i * 355} y={420} w={280} h={130} icon={p.icon} title={p.title} color={p.color} active />
          {i < PHASES.length - 1 && <Arrow at={at(i) + 15} x1={395 + i * 355} y1={420} x2={460 + i * 355} y2={420} color={p.color} />}
          <Sfx at={at(i)} src="pop" volume={0.2} />
        </React.Fragment>
      ))}
      <Show from={cue(4)}>
        <Appear at={cue(4) + 10} style={{ position: "absolute", left: 110, top: 620 }}>
          <Chip at={cue(4) + 10} color={C.coral} big>🎙️ voice timing → every visual cue</Chip>
        </Appear>
      </Show>
    </AbsoluteFill>
  );
};

export const Outro: React.FC = () => {
  const cue = useCue();
  return <Quote at={cue(0)} cite="the two rules">Accuracy over polish.<br />Explain the why, not the file tree.</Quote>;
};
