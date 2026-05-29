import type { BlockColor, PieceShape } from "./types";

/* ============== Logical canvas ============== */

export const BOARD_SIZE = 8;
export const CELL = 40;
export const BOARD_PX = BOARD_SIZE * CELL; // 320
export const BOARD_PAD = 12; // padding around the board rectangle

export const CANVAS_WIDTH = BOARD_PX + BOARD_PAD * 2; // 344
export const TRAY_HEIGHT = 150;
export const TRAY_PAD_TOP = 14;
export const HUD_TOP = 64; // reserved area for HUD chips above the board
export const CANVAS_HEIGHT = HUD_TOP + BOARD_PX + BOARD_PAD * 2 + TRAY_HEIGHT;

export const BOARD_X = BOARD_PAD;
export const BOARD_Y = HUD_TOP + BOARD_PAD;

/* ============== Palette ============== */

/**
 * Premium-casual palette — saturated bodies with soft shines.
 * Tuned for long-session pattern reading: high distinguishability, low glare.
 */
export const COLOR_MAP: Record<
  BlockColor,
  { base: string; rim: string; shine: string; glow: string }
> = {
  rose:   { base: "#ef5a8c", rim: "#a32260", shine: "#ffd7e5", glow: "#ff7aa6" },
  amber:  { base: "#f59e3c", rim: "#a55b14", shine: "#ffe1b8", glow: "#ffb766" },
  lemon:  { base: "#f1cb3a", rim: "#a18118", shine: "#fff1b8", glow: "#ffdc66" },
  lime:   { base: "#7fc94c", rim: "#3f7a22", shine: "#d8f3bd", glow: "#9bdb6a" },
  teal:   { base: "#3fc7a8", rim: "#1b7a66", shine: "#bff0e2", glow: "#5fd9bc" },
  sky:    { base: "#46b8e0", rim: "#1d6d8a", shine: "#c2e7f4", glow: "#5ec8e8" },
  indigo: { base: "#6f7ce6", rim: "#2f3aa6", shine: "#d2d7f6", glow: "#8a96f0" },
  violet: { base: "#9a6ad8", rim: "#5a3399", shine: "#dfccf2", glow: "#b48aea" },
};

export const ALL_COLORS: readonly BlockColor[] = [
  "rose", "amber", "lemon", "lime", "teal", "sky", "indigo", "violet",
];

/* ============== Piece library ============== */

function shape(id: string, cells: ReadonlyArray<readonly [number, number]>): PieceShape {
  let w = 0, h = 0;
  for (const [c, r] of cells) {
    if (c + 1 > w) w = c + 1;
    if (r + 1 > h) h = r + 1;
  }
  return { id, cells, w, h };
}

/** A handcrafted, balanced library — mix of small, line, square, and L pieces. */
export const PIECES: readonly PieceShape[] = [
  // Singles & small
  shape("1x1", [[0, 0]]),
  shape("2x1", [[0, 0], [1, 0]]),
  shape("1x2", [[0, 0], [0, 1]]),
  shape("3x1", [[0, 0], [1, 0], [2, 0]]),
  shape("1x3", [[0, 0], [0, 1], [0, 2]]),
  shape("4x1", [[0, 0], [1, 0], [2, 0], [3, 0]]),
  shape("1x4", [[0, 0], [0, 1], [0, 2], [0, 3]]),
  shape("5x1", [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]]),
  shape("1x5", [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]]),

  // Squares
  shape("2x2", [[0, 0], [1, 0], [0, 1], [1, 1]]),
  shape("3x3", [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [1, 2], [2, 2]]),

  // L variants (4 rotations of 3-cell L)
  shape("L-tl", [[0, 0], [0, 1], [1, 1]]),
  shape("L-tr", [[1, 0], [1, 1], [0, 1]]),
  shape("L-bl", [[0, 0], [1, 0], [0, 1]]),
  shape("L-br", [[0, 0], [1, 0], [1, 1]]),

  // Bigger L (5 cells)
  shape("BL-tl", [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]]),
  shape("BL-tr", [[2, 0], [2, 1], [0, 2], [1, 2], [2, 2]]),
  shape("BL-bl", [[0, 0], [1, 0], [2, 0], [0, 1], [0, 2]]),
  shape("BL-br", [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]]),

  // Diagonals
  shape("D2", [[0, 0], [1, 1]]),
  shape("D2-i", [[1, 0], [0, 1]]),
  shape("D3", [[0, 0], [1, 1], [2, 2]]),
  shape("D3-i", [[2, 0], [1, 1], [0, 2]]),
];

/** Weighted draws — small/medium pieces favored for satisfying flow. */
export const PIECE_WEIGHTS: Record<string, number> = {
  "1x1": 6,
  "2x1": 8, "1x2": 8,
  "3x1": 7, "1x3": 7,
  "4x1": 4, "1x4": 4,
  "5x1": 2, "1x5": 2,
  "2x2": 7,
  "3x3": 2,
  "L-tl": 5, "L-tr": 5, "L-bl": 5, "L-br": 5,
  "BL-tl": 2, "BL-tr": 2, "BL-bl": 2, "BL-br": 2,
  "D2": 3, "D2-i": 3,
  "D3": 1, "D3-i": 1,
};

/* ============== Persistence ============== */

export const BEST_SCORE_KEY = "block-puzzle:best:v1";
