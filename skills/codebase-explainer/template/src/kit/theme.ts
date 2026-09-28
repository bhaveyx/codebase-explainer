import { loadFont as loadSans } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadDisplay } from "@remotion/google-fonts/SpaceGrotesk";

export const sans = loadSans("normal", { weights: ["400", "500", "600", "700", "800"], subsets: ["latin"] }).fontFamily;
export const mono = loadMono("normal", { weights: ["400", "600"], subsets: ["latin"] }).fontFamily;
export const display = loadDisplay("normal", { weights: ["500", "700"], subsets: ["latin"] }).fontFamily;

export const C = {
  bg: "#0B0D12",
  bg2: "#12151D",
  panel: "#171B25",
  line: "#2A3040",
  text: "#EEF0F5",
  dim: "#8A93A6",
  faint: "#4A5263",
  amber: "#FFB547",
  coral: "#FF6B5B",
  mint: "#4BE3AC",
  sky: "#5CC8FF",
  violet: "#A98BFF",
  pink: "#FF7AC6",
  yellow: "#FFE066",
};

export const FPS = 30;
export const W = 1920;
export const H = 1080;
