import type { BubbleColor, GameMode } from "./types";

/** Logical (CSS pixel) canvas dimensions. */
export const CANVAS_WIDTH = 360;
export const CANVAS_HEIGHT = 600;

export const BUBBLE_RADIUS = 18;
export const BUBBLE_DIAMETER = BUBBLE_RADIUS * 2;
export const ROW_HEIGHT = BUBBLE_RADIUS * Math.sqrt(3);

export const GRID_COLS = 9;
export const INITIAL_ROWS = 5;
export const MAX_ROWS = 13;

export const GRID_OFFSET_X = (CANVAS_WIDTH - GRID_COLS * BUBBLE_DIAMETER) / 2 + BUBBLE_RADIUS;
export const GRID_OFFSET_Y = BUBBLE_RADIUS + 12;

export const SHOOTER_Y = CANVAS_HEIGHT - 56;
export const SHOOTER_X = CANVAS_WIDTH / 2;

export const MIN_MATCH = 3;

/**
 * Premium-casual palette.
 *
 * Tuned for long-session comfort: rich saturated bodies, gentle highlights,
 * controlled rim contrast. No fluorescent peaks. Glow is used selectively
 * during impact only — at rest these read as solid, satisfying candies.
 *
 * References: Candy Crush, Brawl Stars, Clash Royale.
 */
export const COLOR_MAP: Record<
  BubbleColor,
  { fill: string; rim: string; shine: string; glow: string }
> = {
  pink:   { fill: "#ec4a8a", rim: "#a72360", shine: "#ffd3e4", glow: "#ff6aa8" },
  orange: { fill: "#f08237", rim: "#a4501a", shine: "#ffd5b3", glow: "#ff9a5c" },
  yellow: { fill: "#f0c233", rim: "#a07a18", shine: "#fff0b8", glow: "#ffd866" },
  lime:   { fill: "#7cc24a", rim: "#3e7d22", shine: "#d6f3bd", glow: "#9adb6a" },
  mint:   { fill: "#3fc7a3", rim: "#1b7a64", shine: "#bff0e2", glow: "#5fd9bc" },
  cyan:   { fill: "#3fb6db", rim: "#1c6f8c", shine: "#bfe6f2", glow: "#5cc8e8" },
  violet: { fill: "#9466d6", rim: "#5a3399", shine: "#dccaf2", glow: "#a982e6" },
  coral:  { fill: "#ed5e63", rim: "#a3262d", shine: "#ffcccd", glow: "#ff7a80" },
};

/** Master pool — modes sample subsets from this. */
export const ALL_COLORS: readonly BubbleColor[] = [
  "pink",
  "cyan",
  "yellow",
  "lime",
  "violet",
  "orange",
  "mint",
  "coral",
] as const;

export interface ModeTheme {
  /** Top-of-canvas backdrop color (hex). */
  bgTop: string;
  /** Bottom-of-canvas backdrop color (hex). */
  bgBottom: string;
  /** Accent used for glows, HUD chips, mode card. */
  accent: string;
  /** Secondary accent for gradients. */
  accent2: string;
  /** Tailwind gradient classes for mode card. */
  cardGradient: string;
  /** Icon name from lucide-react for mode card. */
  icon: "Waves" | "Zap" | "Flame" | "Sparkles";
}

export interface ModeConfig {
  label: string;
  blurb: string;
  baseColors: number;
  maxColors: number;
  /** Subset of ALL_COLORS this mode draws from. */
  palette: readonly BubbleColor[];
  bubbleSpeed: number;
  /** Shots between pressure (row drops). 0 = never. */
  pressureEvery: number;
  pressureRamp: number;
  theme: ModeTheme;
}

/**
 * Mode labels are emotionally direct — pace + vibe in two words max.
 * Backdrops are deep but never black-on-neon; each pairs an accent with a
 * desaturated counterpart so the bubbles always win the visual fight.
 */
export const MODES: Record<GameMode, ModeConfig> = {
  "chill-pop": {
    label: "Easy Pop",
    blurb: "Take it slow.",
    baseColors: 3,
    maxColors: 4,
    palette: ["cyan", "mint", "violet", "pink"],
    bubbleSpeed: 14,
    pressureEvery: 0,
    pressureRamp: 0,
    theme: {
      bgTop: "#142440",
      bgBottom: "#0d1a30",
      accent: "#5cc8e8",
      accent2: "#5fd9bc",
      cardGradient: "from-sky-500 via-cyan-600 to-teal-500",
      icon: "Waves",
    },
  },
  "combo-rush": {
    label: "Combo Pop",
    blurb: "Bigger chains, bigger wins.",
    baseColors: 4,
    maxColors: 5,
    palette: ["pink", "violet", "orange", "yellow", "cyan"],
    bubbleSpeed: 16,
    pressureEvery: 10,
    pressureRamp: 1,
    theme: {
      bgTop: "#2a1438",
      bgBottom: "#1d0e2a",
      accent: "#d97aae",
      accent2: "#f09a5c",
      cardGradient: "from-fuchsia-500 via-purple-600 to-rose-500",
      icon: "Sparkles",
    },
  },
  "neon-burst": {
    label: "Pop Rush",
    blurb: "Fast hands win.",
    baseColors: 5,
    maxColors: 6,
    palette: ["lime", "cyan", "yellow", "pink", "violet", "mint"],
    bubbleSpeed: 18,
    pressureEvery: 7,
    pressureRamp: 1,
    theme: {
      bgTop: "#13301f",
      bgBottom: "#0d2218",
      accent: "#9adb6a",
      accent2: "#5cc8e8",
      cardGradient: "from-lime-500 via-emerald-500 to-cyan-500",
      icon: "Zap",
    },
  },
  "zen-blast": {
    label: "Endless Pop",
    blurb: "No end. No pressure.",
    baseColors: 3,
    maxColors: 4,
    palette: ["violet", "pink", "cyan", "mint"],
    bubbleSpeed: 13,
    pressureEvery: 0,
    pressureRamp: 0,
    theme: {
      bgTop: "#1a153a",
      bgBottom: "#120f28",
      accent: "#a982e6",
      accent2: "#5cc8e8",
      cardGradient: "from-indigo-500 via-violet-500 to-fuchsia-500",
      icon: "Flame",
    },
  },
};

export const MODE_ORDER: GameMode[] = [
  "chill-pop",
  "combo-rush",
  "neon-burst",
  "zen-blast",
];

export function colorPoolForLevel(mode: GameMode, level: number): readonly BubbleColor[] {
  const cfg = MODES[mode];
  const n = Math.min(cfg.maxColors, cfg.baseColors + Math.floor((level - 1) / 2));
  return cfg.palette.slice(0, n);
}

export function pickFrom<T>(pool: readonly T[]): T {
  return pool[Math.floor(Math.random() * pool.length)];
}

export const BEST_SCORE_KEY = "bubble-shooter:best:v2";
