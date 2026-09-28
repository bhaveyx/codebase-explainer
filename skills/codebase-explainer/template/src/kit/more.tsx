import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { C, sans, mono, display } from "./theme";
import { lerp, useSpring, Appear } from "./components";

/** Renders children only inside [from, to) with a slide/fade in and out. */
export const Show: React.FC<{ from: number; to?: number; children: React.ReactNode; dy?: number; style?: React.CSSProperties }> = ({ from, to = 1e9, children, dy = 40, style }) => {
  const frame = useCurrentFrame();
  if (frame < from - 1 || frame > to + 14) return null;
  const i = lerp(frame, from, from + 14);
  const o = lerp(frame, to, to + 12, 1, 0);
  return (
    <AbsoluteFill style={{ opacity: Math.min(i, o), transform: `translateY(${(1 - i) * dy - (1 - o) * dy * 0.6}px)`, ...style }}>{children}</AbsoluteFill>
  );
};

export const Chip: React.FC<{ at: number; color?: string; children: React.ReactNode; style?: React.CSSProperties; big?: boolean }> = ({ at, color = C.sky, children, style, big }) => {
  const s = useSpring(at, { damping: 12, stiffness: 180 });
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: sans, fontWeight: 600, fontSize: big ? 30 : 24, color: C.text, background: `${color}1c`, border: `2px solid ${color}`, borderRadius: 14, padding: big ? "12px 22px" : "8px 16px", transform: `scale(${0.5 + 0.5 * s})`, opacity: s, ...style }}>{children}</div>
  );
};

export const Heading: React.FC<{ at: number; kicker?: string; children: React.ReactNode; color?: string; x?: number; y?: number; size?: number }> = ({ at, kicker, children, color = C.amber, x = 110, y = 80, size = 56 }) => (
  <div style={{ position: "absolute", left: x, top: y }}>
    <Appear at={at} dy={16}>
      {kicker && <div style={{ fontFamily: mono, fontSize: 22, color, letterSpacing: 4, textTransform: "uppercase", marginBottom: 8 }}>{kicker}</div>}
      <div style={{ fontFamily: display, fontWeight: 700, fontSize: size, color: C.text, letterSpacing: -1 }}>{children}</div>
    </Appear>
  </div>
);

export const Quote: React.FC<{ at: number; children: React.ReactNode; cite?: string; color?: string; size?: number; width?: number }> = ({ at, children, cite, color = C.amber, size = 58, width = 1400 }) => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
    <Appear at={at} scale={0.9}>
      <div style={{ width, textAlign: "center" }}>
        <div style={{ fontFamily: display, fontSize: 160, color, lineHeight: 0.6, height: 70 }}>“</div>
        <div style={{ fontFamily: display, fontWeight: 700, fontSize: size, color: C.text, lineHeight: 1.2 }}>{children}</div>
        {cite && <div style={{ fontFamily: mono, fontSize: 24, color: C.dim, marginTop: 28 }}>{cite}</div>}
      </div>
    </Appear>
  </AbsoluteFill>
);

export const Tomb: React.FC<{ at: number; name: string; dates: string; x: number; y: number; scale?: number; epitaph?: string }> = ({ at, name, dates, x, y, scale = 1, epitaph }) => {
  const s = useSpring(at, { damping: 11, stiffness: 150 });
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 240 * scale, height: 300 * scale, transform: `translateY(${(1 - s) * 200}px)`, opacity: Math.min(1, s * 2), transformOrigin: "bottom" }}>
      <div style={{ width: "100%", height: "100%", background: "linear-gradient(180deg, #5b6273, #3a404e)", borderRadius: `${120 * scale}px ${120 * scale}px 8px 8px`, border: "3px solid #737b8e", boxShadow: "0 20px 40px #000a", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 50 * scale, boxSizing: "border-box" }}>
        <div style={{ fontFamily: display, fontWeight: 700, fontSize: 30 * scale, color: "#e8eaf0" }}>RIP</div>
        <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 24 * scale, color: "#fff", textAlign: "center", marginTop: 14 * scale, padding: `0 ${14 * scale}px`, lineHeight: 1.15 }}>{name}</div>
        <div style={{ fontFamily: mono, fontSize: 16 * scale, color: "#cfd3dc", marginTop: 12 * scale }}>{dates}</div>
        {epitaph && <div style={{ fontFamily: sans, fontStyle: "italic", fontSize: 15 * scale, color: "#cfd3dc", marginTop: 10 * scale, textAlign: "center", padding: `0 ${16 * scale}px` }}>{epitaph}</div>}
      </div>
    </div>
  );
};

type MemeLabel = { text: string; x: number; y: number; w: number; size?: number; color?: string; stroke?: boolean; align?: "left" | "center" };
/** A meme template image with text boxes positioned in template-relative percent coordinates. */
export const MemeTemplate: React.FC<{ at: number; src: string; w: number; labels: MemeLabel[]; x: number; y: number; rot?: number; out?: number }> = ({ at, src, w, labels, x, y, rot = -2, out }) => {
  const s = useSpring(at, { damping: 10, stiffness: 160 });
  const frame = useCurrentFrame();
  const o = out !== undefined ? lerp(frame, out, out + 8, 1, 0) : 1;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, transform: `rotate(${rot * s}deg) scale(${0.3 + 0.7 * s})`, opacity: Math.min(1, s * 1.5) * o, background: "#fff", padding: 10, borderRadius: 6, boxShadow: "0 30px 80px #000c" }}>
      <div style={{ position: "relative" }}>
        <Img src={staticFile(src)} style={{ width: "100%", display: "block" }} />
        {labels.map((l, i) => (
          <div key={i} style={{ position: "absolute", left: `${l.x}%`, top: `${l.y}%`, width: `${l.w}%`, transform: "translateY(-50%)", fontFamily: l.stroke ? "Impact, 'Arial Black', sans-serif" : sans, fontWeight: 800, fontSize: l.size ?? 28, lineHeight: 1.1, color: l.color ?? "#111", textAlign: l.align ?? "center", textShadow: l.stroke ? "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000" : undefined, textTransform: l.stroke ? "uppercase" : undefined }}>{l.text}</div>
        ))}
      </div>
    </div>
  );
};

export const BarRow: React.FC<{ at: number; label: string; value: number; max: number; color: string; right?: string; width?: number; delay?: number }> = ({ at, label, value, max, color, right, width = 900, delay = 0 }) => {
  const frame = useCurrentFrame();
  const p = lerp(frame, at + delay, at + delay + 24);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 18, opacity: lerp(frame, at + delay, at + delay + 8) }}>
      <div style={{ width: 230, fontFamily: sans, fontWeight: 600, fontSize: 28, color: C.text, textAlign: "right" }}>{label}</div>
      <div style={{ width, height: 44, background: C.bg2, borderRadius: 10, overflow: "hidden", border: `1px solid ${C.line}` }}>
        <div style={{ width: `${(value / max) * 100 * p}%`, height: "100%", background: `linear-gradient(90deg, ${color}aa, ${color})`, borderRadius: 10 }} />
      </div>
      <div style={{ fontFamily: mono, fontSize: 26, color, minWidth: 160 }}>{right}</div>
    </div>
  );
};

export const Box: React.FC<{ x: number; y: number; w: number; h: number; children?: React.ReactNode; color?: string; at: number; style?: React.CSSProperties; out?: number }> = ({ x, y, w, h, children, color = C.line, at, style, out }) => {
  const s = useSpring(at);
  const frame = useCurrentFrame();
  const o = out !== undefined ? lerp(frame, out, out + 10, 1, 0) : 1;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, border: `2px solid ${color}`, borderRadius: 22, background: `linear-gradient(160deg, ${C.panel}ee, ${C.bg2}ee)`, opacity: Math.min(s, o), transform: `scale(${0.92 + 0.08 * s})`, boxSizing: "border-box", padding: 26, boxShadow: "0 20px 50px #0008", ...style }}>{children}</div>
  );
};

export const Label: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties; font?: "mono" | "sans" | "display" }> = ({ children, color = C.text, size = 26, style, font = "sans" }) => (
  <div style={{ fontFamily: font === "mono" ? mono : font === "display" ? display : sans, fontWeight: font === "mono" ? 400 : 600, fontSize: size, color, lineHeight: 1.3, ...style }}>{children}</div>
);

export const Waveform: React.FC<{ x: number; y: number; w: number; h: number; color?: string; bars?: number; seed?: number; silenceMask?: (i: number) => boolean; cut?: number }> = ({ x, y, w, h, color = C.mint, bars = 90, seed = 3, silenceMask, cut = 0 }) => {
  const frame = useCurrentFrame();
  const bw = w / bars;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h }}>
      {Array.from({ length: bars }).map((_, i) => {
        const silent = silenceMask?.(i) ?? false;
        const amp = silent ? 0.06 + 0.03 * Math.abs(Math.sin(i * 7.1 + seed)) : 0.25 + 0.75 * Math.abs(Math.sin(i * 0.61 + seed) * Math.cos(i * 0.23 + frame / 9));
        const gone = silent ? cut : 0;
        return <div key={i} style={{ position: "absolute", left: i * bw, top: h / 2 - (amp * h) / 2, width: bw * 0.6, height: amp * h, borderRadius: 3, background: silent ? C.coral : color, opacity: 1 - gone * 0.9, transform: `scaleY(${1 - gone})` }} />;
      })}
    </div>
  );
};

