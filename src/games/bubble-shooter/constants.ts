import type { BubbleColor } from "./types";

/** Logical (CSS pixel) canvas dimensions. Scaled by DPR internally. */
export const CANVAS_WIDTH = 360;
export const CANVAS_HEIGHT = 560;

export const BUBBLE_RADIUS = 18;
export const BUBBLE_DIAMETER = BUBBLE_RADIUS * 2;
/** Hex row vertical step ≈ r * sqrt(3). */
export const ROW_HEIGHT = BUBBLE_RADIUS * Math.sqrt(3);

export const GRID_COLS = 9;
/** Initial filled rows at start. */
export const INITIAL_ROWS = 5;
/** Hard floor — touching this row ends the game. */
export const MAX_ROWS = 12;

export const GRID_OFFSET_X = (CANVAS_WIDTH - GRID_COLS * BUBBLE_DIAMETER) / 2 + BUBBLE_RADIUS;
export const GRID_OFFSET_Y = BUBBLE_RADIUS + 8;

export const SHOOTER_Y = CANVAS_HEIGHT - 48;
export const SHOOTER_X = CANVAS_WIDTH / 2;

export const BUBBLE_SPEED = 16; // px / frame at 60fps

export const MIN_MATCH = 3;

/** Soft, low-saturation palette — matches the cozy app vibe. */
export const COLOR_MAP: Record<BubbleColor, { fill: string; rim: string; shine: string }> = {
  rose: { fill: "#f4a8a0", rim: "#d98c83", shine: "#fcd9d3" },
  peach: { fill: "#f5c79a", rim: "#dba872", shine: "#fde4c8" },
  sand: { fill: "#ead9a8", rim: "#c9b67f", shine: "#f6ecca" },
  sage: { fill: "#a7cdb0", rim: "#7fae8b", shine: "#d2e7d6" },
  sky: { fill: "#a8c5e2", rim: "#7fa3c5", shine: "#d3e1f0" },
};

export const COLORS: readonly BubbleColor[] = ["rose", "peach", "sand", "sage", "sky"] as const;

export function randomColor(pool?: readonly BubbleColor[]): BubbleColor {
  const src = pool && pool.length > 0 ? pool : COLORS;
  return src[Math.floor(Math.random() * src.length)];
}
