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
 * Neon arcade palette. Each color has a saturated fill, a slightly darker rim,
 * a bright inner shine, and a glow color used for soft outer halos.
 */
export const COLOR_MAP: Record<
  BubbleColor,
  { fill: string; rim: string; shine: string; glow: string }
> = {
  pink: { fill: "#ff5cad", rim: "#c93f87", shine: "#ffd3ec", glow: "#ff5cad" },
  orange: { fill: "#ff8a3d", rim: "#cc6620", shine: "#ffd9bb", glow: "#ffa861" },
  yellow: { fill: "#ffd83d", rim: "#caa31a", shine: "#fff3b8", glow: "#ffe871" },
  lime: { fill: "#9aff5c", rim: "#5fc227", shine: "#dcffc1", glow: "#a8ff6f" },
  mint: { fill: "#5cffc8", rim: "#28c294", shine: "#c4ffe9", glow: "#5cffc8" },
  cyan: { fill: "#5cd6ff", rim: "#2a9ecc", shine: "#c4eeff", glow: "#5cd6ff" },
  violet: { fill: "#b15cff", rim: "#7d2dcc", shine: "#e1c4ff", glow: "#c47bff" },
  coral: { fill: "#ff5c6e", rim: "#cc2f43", shine: "#ffc4cb", glow: "#ff7383" },
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
      bgTop: "#0a1a2e",
      bgBottom: "#06283d",
      accent: "#5cd6ff",
      accent2: "#5cffc8",
      cardGradient: "from-cyan-500 via-sky-600 to-teal-500",
      icon: "Waves",
    },
  },
  "combo-rush": {
    label: "Chain Blast",
    blurb: "Bigger chains, bigger pop.",
    baseColors: 4,
    maxColors: 5,
    palette: ["pink", "violet", "orange", "yellow", "cyan"],
    bubbleSpeed: 16,
    pressureEvery: 10,
    pressureRamp: 1,
    theme: {
      bgTop: "#1a0a2e",
      bgBottom: "#2a0a3a",
      accent: "#e879f9",
      accent2: "#ff8a3d",
      cardGradient: "from-fuchsia-500 via-purple-600 to-pink-500",
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
      bgTop: "#0a1f10",
      bgBottom: "#0a2b1a",
      accent: "#9aff5c",
      accent2: "#5cd6ff",
      cardGradient: "from-lime-400 via-emerald-500 to-cyan-500",
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
      bgTop: "#0a0a24",
      bgBottom: "#160a2e",
      accent: "#b15cff",
      accent2: "#5cd6ff",
      cardGradient: "from-indigo-500 via-violet-600 to-fuchsia-500",
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
