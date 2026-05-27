import type { BubbleColor, GameMode } from "./types";

/** Logical (CSS pixel) canvas dimensions. */
export const CANVAS_WIDTH = 360;
export const CANVAS_HEIGHT = 560;

export const BUBBLE_RADIUS = 18;
export const BUBBLE_DIAMETER = BUBBLE_RADIUS * 2;
export const ROW_HEIGHT = BUBBLE_RADIUS * Math.sqrt(3);

export const GRID_COLS = 9;
export const INITIAL_ROWS = 5;
export const MAX_ROWS = 12;

export const GRID_OFFSET_X = (CANVAS_WIDTH - GRID_COLS * BUBBLE_DIAMETER) / 2 + BUBBLE_RADIUS;
export const GRID_OFFSET_Y = BUBBLE_RADIUS + 8;

export const SHOOTER_Y = CANVAS_HEIGHT - 48;
export const SHOOTER_X = CANVAS_WIDTH / 2;

export const MIN_MATCH = 3;

/** Soft palette. Match-count sweet spot at 4–5 colors. */
export const COLOR_MAP: Record<BubbleColor, { fill: string; rim: string; shine: string }> = {
  rose: { fill: "#f4a8a0", rim: "#d98c83", shine: "#fcd9d3" },
  peach: { fill: "#f5c79a", rim: "#dba872", shine: "#fde4c8" },
  sand: { fill: "#ead9a8", rim: "#c9b67f", shine: "#f6ecca" },
  sage: { fill: "#a7cdb0", rim: "#7fae8b", shine: "#d2e7d6" },
  sky: { fill: "#a8c5e2", rim: "#7fa3c5", shine: "#d3e1f0" },
};

export const ALL_COLORS: readonly BubbleColor[] = ["rose", "sage", "sky", "peach", "sand"] as const;

export interface ModeConfig {
  label: string;
  blurb: string;
  baseColors: number; // colors used at level 1
  maxColors: number;
  bubbleSpeed: number;
  /** Shots between pressure (row drops). 0 = never. */
  pressureEvery: number;
  /** Decrease pressureEvery by this per level (min 3). */
  pressureRamp: number;
}

export const MODES: Record<GameMode, ModeConfig> = {
  relax: {
    label: "Relax",
    blurb: "No pressure. Just pop.",
    baseColors: 3,
    maxColors: 4,
    bubbleSpeed: 14,
    pressureEvery: 0,
    pressureRamp: 0,
  },
  classic: {
    label: "Classic",
    blurb: "Balanced rhythm.",
    baseColors: 4,
    maxColors: 5,
    bubbleSpeed: 16,
    pressureEvery: 10,
    pressureRamp: 1,
  },
  challenge: {
    label: "Challenge",
    blurb: "Faster, denser.",
    baseColors: 5,
    maxColors: 5,
    bubbleSpeed: 19,
    pressureEvery: 6,
    pressureRamp: 1,
  },
};

export function colorPoolForLevel(mode: GameMode, level: number): readonly BubbleColor[] {
  const cfg = MODES[mode];
  const n = Math.min(cfg.maxColors, cfg.baseColors + Math.floor((level - 1) / 2));
  return ALL_COLORS.slice(0, n);
}

export function pickFrom<T>(pool: readonly T[]): T {
  return pool[Math.floor(Math.random() * pool.length)];
}

export const BEST_SCORE_KEY = "bubble-shooter:best";
