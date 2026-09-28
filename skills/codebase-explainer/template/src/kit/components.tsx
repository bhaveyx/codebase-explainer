import React, { createContext, useContext } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing, Img, staticFile } from "remotion";
import { C, sans, mono, display } from "./theme";

export type Line = { who: "N" | "S"; text: string; file: string; start: number; frames: number; highlight?: boolean };
export type SceneTiming = { lines: Line[]; frames: number };

const CueCtx = createContext<SceneTiming>({ lines: [], frames: 0 });
export const CueProvider = CueCtx.Provider;
export const useScene = () => useContext(CueCtx);
/** Start frame of line i within the scene; negative i counts from the end. */
export const useCue = () => {
  const { lines, frames } = useScene();
  return (i: number, offset = 0) => {
    const l = lines[i < 0 ? lines.length + i : i];
    return (l ? l.start : frames) + offset;
  };
};

export const ease = Easing.bezier(0.22, 1, 0.36, 1);

export const useSpring = (at: number, cfg: { damping?: number; stiffness?: number; mass?: number } = {}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - at, fps, config: { damping: 16, stiffness: 120, mass: 0.8, ...cfg } });
};

export const lerp = (frame: number, a: number, b: number, from = 0, to = 1, e = ease) =>
  interpolate(frame, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });

export const Appear: React.FC<{ at: number; out?: number; dy?: number; dx?: number; scale?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ at, out, dy = 30, dx = 0, scale = 1, style, children }) => {
  const frame = useCurrentFrame();
  const s = useSpring(at);
  const o = out !== undefined ? lerp(frame, out, out + 10, 1, 0) : 1;
  return (
    <div style={{ opacity: Math.min(s, o), transform: `translate(${(1 - s) * dx}px, ${(1 - s) * dy}px) scale(${scale + (1 - scale) * s})`, ...style }}>
      {children}
    </div>
  );
};

export const Background: React.FC<{ hue?: string }> = ({ hue = C.violet }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 1400, height: 1400, borderRadius: "50%", left: -300 + Math.sin(t * 0.15) * 120, top: -700 + Math.cos(t * 0.11) * 90, background: `radial-gradient(circle, ${hue}22 0%, transparent 60%)` }} />
      <div style={{ position: "absolute", width: 1200, height: 1200, borderRadius: "50%", right: -400 + Math.cos(t * 0.13) * 140, bottom: -700 + Math.sin(t * 0.09) * 100, background: `radial-gradient(circle, ${C.amber}14 0%, transparent 60%)` }} />
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(${C.line}33 1px, transparent 1px), linear-gradient(90deg, ${C.line}33 1px, transparent 1px)`, backgroundSize: "60px 60px", backgroundPosition: `${-t * 4}px ${-t * 2}px`, maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)" }} />
    </AbsoluteFill>
  );
};

export const Title: React.FC<{ at: number; kicker?: string; title: string; color?: string; size?: number; style?: React.CSSProperties }> = ({ at, kicker, title, color = C.amber, size = 84, style }) => {
  const frame = useCurrentFrame();
  const words = title.split(" ");
  return (
    <div style={{ ...style }}>
      {kicker && (
        <Appear at={at} dy={10}>
          <div style={{ fontFamily: mono, color, fontSize: 26, letterSpacing: 4, textTransform: "uppercase", marginBottom: 14 }}>{kicker}</div>
        </Appear>
      )}
      <div style={{ fontFamily: display, fontWeight: 700, fontSize: size, color: C.text, lineHeight: 1.05, letterSpacing: -1.5 }}>
        {words.map((w, i) => {
          const p = lerp(frame, at + 4 + i * 3, at + 16 + i * 3);
          return (
            <span key={i} style={{ display: "inline-block", opacity: p, transform: `translateY(${(1 - p) * 40}px)`, marginRight: size * 0.25 }}>{w}</span>
          );
        })}
      </div>
    </div>
  );
};

export const Node: React.FC<{ at: number; x: number; y: number; w?: number; h?: number; icon?: string; title: string; sub?: string; color?: string; active?: boolean; dim?: boolean; out?: number; small?: boolean }> = ({ at, x, y, w = 300, h = 120, icon, title, sub, color = C.sky, active, dim, out, small }) => {
  const frame = useCurrentFrame();
  const s = useSpring(at, { damping: 13 });
  const o = out !== undefined ? lerp(frame, out, out + 10, 1, 0) : 1;
  const pulse = active ? 0.5 + 0.5 * Math.sin(frame / 5) : 0;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, opacity: Math.min(s, o) * (dim ? 0.35 : 1), transform: `scale(${0.6 + 0.4 * s})`, borderRadius: 20, background: `linear-gradient(160deg, ${C.panel}, ${C.bg2})`, border: `2px solid ${active ? color : C.line}`, boxShadow: active ? `0 0 ${30 + pulse * 30}px ${color}66` : "0 10px 30px #0006", display: "flex", alignItems: "center", gap: 16, padding: "0 22px", boxSizing: "border-box" }}>
      {icon && <div style={{ fontSize: small ? 36 : 48, lineHeight: 1 }}>{icon}</div>}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: sans, fontWeight: 700, color: C.text, fontSize: small ? 22 : 28, lineHeight: 1.1 }}>{title}</div>
        {sub && <div style={{ fontFamily: mono, color, fontSize: small ? 15 : 18, marginTop: 6, lineHeight: 1.25 }}>{sub}</div>}
      </div>
    </div>
  );
};

/** Draws a line/curve from (x1,y1) to (x2,y2) and, once drawn, sends packets along it. */
export const Arrow: React.FC<{ at: number; x1: number; y1: number; x2: number; y2: number; color?: string; curve?: number; packets?: boolean; dur?: number; label?: string; out?: number; dashed?: boolean }> = ({ at, x1, y1, x2, y2, color = C.dim, curve = 0, packets = true, dur = 18, label, out, dashed }) => {
  const frame = useCurrentFrame();
  const p = lerp(frame, at, at + dur);
  const o = out !== undefined ? lerp(frame, out, out + 10, 1, 0) : 1;
  const mx = (x1 + x2) / 2 - (y2 - y1) * curve;
  const my = (y1 + y2) / 2 + (x2 - x1) * curve;
  const d = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
  const len = Math.hypot(x2 - x1, y2 - y1) * (1 + Math.abs(curve));
  const pt = (t: number) => ({ x: (1 - t) ** 2 * x1 + 2 * (1 - t) * t * mx + t * t * x2, y: (1 - t) ** 2 * y1 + 2 * (1 - t) * t * my + t * t * y2 });
  const ang = Math.atan2(y2 - my, x2 - mx);
  const packetsOn = packets && p >= 1;
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: o }} width={1} height={1}>
      <path d={d} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeDasharray={dashed ? "10 10" : `${len}`} strokeDashoffset={dashed ? -frame : len * (1 - p)} opacity={dashed ? p : 1} />
      {p > 0.98 && (
        <polygon points="0,-9 18,0 0,9" fill={color} transform={`translate(${x2 - Math.cos(ang) * 16}, ${y2 - Math.sin(ang) * 16}) rotate(${(ang * 180) / Math.PI})`} />
      )}
      {packetsOn && [0, 0.33, 0.66].map((k) => {
        const t = ((frame - at) / 45 + k) % 1;
        const q = pt(t);
        return <circle key={k} cx={q.x} cy={q.y} r={6} fill={color} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />;
      })}
      {label && p > 0.5 && (
        <text x={pt(0.5).x} y={pt(0.5).y - 14} fill={C.dim} fontFamily={mono} fontSize={18} textAnchor="middle" opacity={lerp(frame, at + dur / 2, at + dur)}>{label}</text>
      )}
    </svg>
  );
};

export const Pill: React.FC<{ color?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ color = C.amber, children, style }) => (
  <span style={{ display: "inline-block", fontFamily: mono, fontSize: 22, color, border: `2px solid ${color}88`, background: `${color}18`, borderRadius: 999, padding: "6px 16px", ...style }}>{children}</span>
);

export const Card: React.FC<{ style?: React.CSSProperties; color?: string; children: React.ReactNode }> = ({ style, color = C.line, children }) => (
  <div style={{ background: `linear-gradient(160deg, ${C.panel}, ${C.bg2})`, border: `2px solid ${color}`, borderRadius: 24, padding: 32, boxShadow: "0 20px 60px #0008", boxSizing: "border-box", ...style }}>{children}</div>
);

export const CodeCard: React.FC<{ at: number; file?: string; code: string; highlight?: number[]; style?: React.CSSProperties; fontSize?: number; cps?: number }> = ({ at, file, code, highlight = [], style, fontSize = 22, cps = 90 }) => {
  const frame = useCurrentFrame();
  const shown = Math.max(0, Math.floor(((frame - at) / 30) * cps));
  let used = 0;
  return (
    <Appear at={at} style={style}>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 8, padding: "14px 20px", borderBottom: `1px solid ${C.line}`, alignItems: "center" }}>
          {[C.coral, C.yellow, C.mint].map((c) => <div key={c} style={{ width: 13, height: 13, borderRadius: 7, background: c }} />)}
          {file && <div style={{ fontFamily: mono, fontSize: 17, color: C.dim, marginLeft: 12 }}>{file}</div>}
        </div>
        <div style={{ padding: "18px 24px", fontFamily: mono, fontSize, lineHeight: 1.5, whiteSpace: "pre" }}>
          {code.split("\n").map((ln, i) => {
            const visible = ln.slice(0, Math.max(0, shown - used));
            used += ln.length + 1;
            const hl = highlight.includes(i);
            return (
              <div key={i} style={{ color: hl ? C.text : C.dim, background: hl ? `${C.amber}1f` : "transparent", borderLeft: `3px solid ${hl ? C.amber : "transparent"}`, paddingLeft: 10, minHeight: fontSize * 1.5 }}>{colorize(visible)}</div>
            );
          })}
        </div>
      </Card>
    </Appear>
  );
};

const colorize = (s: string) => {
  const parts = s.split(/("[^"]*"?|'[^']*'?|\/\/.*$|#.*$|\b(?:const|await|return|if|for|async|function|export|import|from|SELECT|FROM|WHERE|JOIN|ORDER BY|LIMIT|MATCH)\b|\b\d+(?:\.\d+)?\b)/);
  return parts.map((p, i) => {
    if (!p) return null;
    let color: string | undefined;
    if (/^["']/.test(p)) color = C.mint;
    else if (/^(\/\/|#)/.test(p)) color = C.faint;
    else if (/^\d/.test(p)) color = C.amber;
    else if (/^(const|await|return|if|for|async|function|export|import|from|SELECT|FROM|WHERE|JOIN|ORDER BY|LIMIT|MATCH)$/.test(p)) color = C.violet;
    return <span key={i} style={{ color }}>{p}</span>;
  });
};

export const ChapterCard: React.FC<{ n: string; title: string; sub?: string; color?: string; out?: number }> = ({ n, title, sub, color = C.amber, out = 72 }) => {
  const frame = useCurrentFrame();
  const wipe = lerp(frame, 0, 14);
  const outp = lerp(frame, out - 14, out);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: color, transform: `scaleX(${wipe - outp})`, transformOrigin: outp > 0 ? "right" : "left", opacity: 0.12 }} />
      <div style={{ textAlign: "center", opacity: 1 - outp }}>
        <Appear at={4}><div style={{ fontFamily: mono, fontSize: 30, color, letterSpacing: 8 }}>CHAPTER {n}</div></Appear>
        <Title at={8} title={title} size={110} style={{ marginTop: 16 }} />
        {sub && <Appear at={20}><div style={{ fontFamily: sans, fontSize: 34, color: C.dim, marginTop: 20 }}>{sub}</div></Appear>}
      </div>
    </AbsoluteFill>
  );
};

/** Caption bar showing the currently spoken line; the skeptic's lines render as a speech bubble with an animated face. */
export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const { lines } = useScene();
  const cur = lines.find((l) => frame >= l.start && frame < l.start + l.frames + 6);
  if (!cur) return null;
  const local = frame - cur.start;
  const words = cur.text.split(" ");
  const spoken = Math.floor((local / cur.frames) * words.length * 1.05);
  const inP = lerp(local, 0, 6);
  if (cur.who === "S") {
    const talking = local < cur.frames;
    return (
      <div style={{ position: "absolute", right: 60, bottom: 60, display: "flex", alignItems: "flex-end", gap: 20, opacity: inP, transform: `translateY(${(1 - inP) * 30}px)` }}>
        <div style={{ maxWidth: 820, background: C.yellow, color: "#1a1400", fontFamily: sans, fontWeight: 600, fontSize: 32, lineHeight: 1.3, padding: "20px 28px", borderRadius: "28px 28px 6px 28px", boxShadow: "0 12px 40px #0009" }}>{cur.text}</div>
        <Skeptic talking={talking} />
      </div>
    );
  }
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 44, display: "flex", justifyContent: "center", opacity: inP }}>
      <div style={{ maxWidth: 1500, textAlign: "center", fontFamily: sans, fontWeight: 500, fontSize: 30, lineHeight: 1.4, background: "#000a", padding: "10px 24px", borderRadius: 14 }}>
        {words.map((w, i) => <span key={i} style={{ color: i < spoken ? C.text : C.faint }}>{w} </span>)}
      </div>
    </div>
  );
};

export const Skeptic: React.FC<{ talking?: boolean; size?: number }> = ({ talking = false, size = 130 }) => {
  const frame = useCurrentFrame();
  const mouth = talking ? 6 + Math.abs(Math.sin(frame / 2.2)) * 16 : 4;
  const bob = Math.sin(frame / 8) * 4;
  const blink = frame % 90 < 4 ? 0.1 : 1;
  return (
    <svg width={size} height={size} viewBox="0 0 130 130" style={{ transform: `translateY(${bob}px)`, flexShrink: 0 }}>
      <circle cx={65} cy={65} r={60} fill={C.yellow} />
      <ellipse cx={45} cy={55} rx={9} ry={11 * blink} fill="#1a1400" />
      <ellipse cx={85} cy={55} rx={9} ry={11 * blink} fill="#1a1400" />
      <path d="M 30 36 L 58 42" stroke="#1a1400" strokeWidth={6} strokeLinecap="round" />
      <path d="M 74 38 L 100 30" stroke="#1a1400" strokeWidth={6} strokeLinecap="round" />
      <ellipse cx={68} cy={90} rx={14} ry={mouth / 2} fill="#1a1400" />
    </svg>
  );
};

export const Meme: React.FC<{ at: number; src: string; caption?: string; w?: number; rot?: number; style?: React.CSSProperties; out?: number }> = ({ at, src, caption, w = 640, rot = -3, style, out }) => {
  const s = useSpring(at, { damping: 10, stiffness: 160 });
  const frame = useCurrentFrame();
  const o = out !== undefined ? lerp(frame, out, out + 8, 1, 0) : 1;
  return (
    <div style={{ position: "absolute", width: w, transform: `rotate(${rot * s}deg) scale(${0.3 + 0.7 * s})`, opacity: Math.min(1, s * 1.5) * o, background: "#fff", padding: 14, paddingBottom: caption ? 12 : 14, borderRadius: 6, boxShadow: "0 30px 80px #000c", ...style }}>
      <Img src={staticFile(src)} style={{ width: "100%", display: "block" }} />
      {caption && <div style={{ fontFamily: sans, fontWeight: 700, color: "#111", fontSize: 26, textAlign: "center", marginTop: 10 }}>{caption}</div>}
    </div>
  );
};

export const Counter: React.FC<{ at: number; to: number; dur?: number; prefix?: string; suffix?: string; decimals?: number; style?: React.CSSProperties }> = ({ at, to, dur = 40, prefix = "", suffix = "", decimals = 0, style }) => {
  const frame = useCurrentFrame();
  const v = lerp(frame, at, at + dur) * to;
  return <span style={style}>{prefix}{v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>;
};

export const Stamp: React.FC<{ at: number; text: string; color?: string; style?: React.CSSProperties }> = ({ at, text, color = C.coral, style }) => {
  const s = useSpring(at, { damping: 9, stiffness: 220 });
  return (
    <div style={{ position: "absolute", fontFamily: display, fontWeight: 700, fontSize: 64, color, border: `6px solid ${color}`, borderRadius: 12, padding: "4px 24px", transform: `rotate(-12deg) scale(${3 - 2 * s})`, opacity: s, letterSpacing: 4, ...style }}>{text}</div>
  );
};

