/** 2048 — tuning + palette. Colors follow the Satisfaction Lab mood. */

export const SIZE = 4;
export const TARGET = 2048;
export const BEST_KEY = "twenty48:best:v1";

export const ACCENT = "#5eead4";
export const ACCENT_SECONDARY = "#34d399";

/** Swipe distance (px) required before a move registers. */
export const SWIPE_THRESHOLD = 22;

/** Tile face colors — premium-casual, low glow at rest. */
export const TILE_STYLES: Record<number, { bg: string; fg: string; glow?: string }> = {
  2: { bg: "rgba(255,255,255,0.08)", fg: "rgba(255,255,255,0.82)" },
  4: { bg: "rgba(255,255,255,0.13)", fg: "rgba(255,255,255,0.9)" },
  8: { bg: "rgba(94,234,212,0.18)", fg: "#a7f3e5" },
  16: { bg: "rgba(52,211,153,0.22)", fg: "#bbf7d0" },
  32: { bg: "rgba(56,189,248,0.24)", fg: "#bae6fd" },
  64: { bg: "rgba(129,140,248,0.26)", fg: "#c7d2fe" },
  128: { bg: "rgba(192,132,252,0.28)", fg: "#e9d5ff", glow: "#c084fc" },
  256: { bg: "rgba(244,114,182,0.28)", fg: "#fbcfe8", glow: "#f472b6" },
  512: { bg: "rgba(251,146,60,0.3)", fg: "#fed7aa", glow: "#fb923c" },
  1024: { bg: "rgba(250,204,21,0.32)", fg: "#fef3c7", glow: "#facc15" },
  2048: { bg: "rgba(94,234,212,0.4)", fg: "#042f2e", glow: "#5eead4" },
};

export function tileStyle(value: number) {
  return (
    TILE_STYLES[value] ?? {
      bg: "rgba(94,234,212,0.45)",
      fg: "#042f2e",
      glow: ACCENT,
    }
  );
}

export function tileFontSize(value: number): string {
  if (value < 100) return "clamp(22px, 8vw, 34px)";
  if (value < 1000) return "clamp(18px, 6.6vw, 28px)";
  return "clamp(15px, 5.4vw, 23px)";
}
