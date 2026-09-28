import React from "react";
import { AbsoluteFill } from "remotion";
import { Background } from "./kit/components";
import { C, display, mono, sans } from "./kit/theme";

export type StatsCardProps = {
  title: string;
  subtitle: string;
  stats: { label: string; value: string }[];
  footer: string;
};

export const defaultStatsCard: StatsCardProps = {
  title: "How this video was made",
  subtitle: "run `stats.py report` to fill this in",
  stats: [
    { label: "to make", value: "—" },
    { label: "video length", value: "—" },
    { label: "agents", value: "—" },
    { label: "cost", value: "—" },
  ],
  footer: "npx skills add bhaveyx/codebase-explainer",
};

/** A single-frame summary card for sharing alongside the video; props come from out/stats-card.json. */
export const StatsCard: React.FC<StatsCardProps> = ({ title, subtitle, stats, footer }) => {
  const accents = [C.amber, C.sky, C.mint, C.pink, C.violet, C.coral];
  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ padding: "110px 130px", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: display, fontWeight: 700, fontSize: 84, color: C.text, letterSpacing: -1.5 }}>{title}</div>
          <div style={{ fontFamily: sans, fontSize: 36, color: C.dim, marginTop: 14 }}>{subtitle}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(stats.length, 3)}, 1fr)`, gap: 36 }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{ background: `${accents[i % accents.length]}14`, border: `2px solid ${accents[i % accents.length]}`, borderRadius: 24, padding: "28px 34px" }}>
              <div style={{ fontFamily: display, fontWeight: 700, fontSize: 72, color: accents[i % accents.length] }}>{s.value}</div>
              <div style={{ fontFamily: sans, fontSize: 30, color: C.text, marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ fontFamily: mono, fontSize: 30, color: C.dim }}>{footer}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
