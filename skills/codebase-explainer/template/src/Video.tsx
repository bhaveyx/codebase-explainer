import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { scenes } from "./timeline";
import { Background, Captions, ChapterCard, CueProvider } from "./kit/components";
import { C } from "./kit/theme";
import { SCENES } from "./scenes";

const Fade: React.FC<{ frames: number; children: React.ReactNode }> = ({ frames, children }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 10, frames - 10, frames], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

/** Holds the scene content back until the chapter card (shown during the spoken title) clears. */
const ChapterGate: React.FC<{ content: React.ReactNode; card: React.ReactNode; until: number }> = ({ content, card, until }) => {
  const f = useCurrentFrame();
  const contentIn = interpolate(f, [until - 12, until + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <AbsoluteFill style={{ opacity: contentIn }}>{content}</AbsoluteFill>
      {f < until + 4 && card}
    </>
  );
};

export const Video: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Background />
    <Audio src={staticFile("sfx/music.wav")} volume={0.1} loop />
    {scenes.map((sc) => {
      const Scene = SCENES[sc.id];
      if (!Scene) throw new Error(`scene ${sc.id} is in script.json but not registered in src/scenes/index.ts`);
      const cardEnd = sc.chapter && sc.lines[1] ? sc.lines[1].start - 4 : 0;
      return (
        <Sequence key={sc.id} from={sc.from} durationInFrames={sc.frames} name={sc.id}>
          <CueProvider value={sc}>
            <Fade frames={sc.frames}>
              {sc.chapter ? (
                <ChapterGate until={cardEnd} content={<Scene />} card={<ChapterCard {...sc.chapter} out={cardEnd} />} />
              ) : (
                <Scene />
              )}
              <Captions />
            </Fade>
            {sc.lines.map((l) => (
              <Sequence key={l.file} from={l.start} durationInFrames={l.frames + 6}>
                <Audio src={staticFile(`vo/${l.file}`)} />
              </Sequence>
            ))}
            <Sequence durationInFrames={30}>
              <Audio src={staticFile(sc.chapter ? "sfx/impact.wav" : "sfx/whoosh.wav")} volume={sc.chapter ? 0.5 : 0.35} />
            </Sequence>
          </CueProvider>
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
