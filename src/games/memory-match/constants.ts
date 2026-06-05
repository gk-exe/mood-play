/**
 * Memory Match — tuning constants.
 */

export const ACCENT = "#facc15";
export const ACCENT_SECONDARY = "#fb923c";

export interface LevelConfig {
  level: number;
  pairs: number;
  cols: number;
  rows: number;
}

/** Three levels with growing grid size: 4 → 6 → 8 pairs. */
export const LEVELS: LevelConfig[] = [
  { level: 1, pairs: 4, cols: 4, rows: 2 },
  { level: 2, pairs: 6, cols: 4, rows: 3 },
  { level: 3, pairs: 8, cols: 4, rows: 4 },
];

/** Unique symbols for card faces — geometric, reliable Unicode. */
export const SYMBOLS = [
  { char: "★", color: "#facc15" },
  { char: "♥", color: "#f87171" },
  { char: "◆", color: "#22d3ee" },
  { char: "●", color: "#a78bfa" },
  { char: "▲", color: "#4ade80" },
  { char: "■", color: "#fb923c" },
  { char: "☀", color: "#f472b6" },
  { char: "☽", color: "#60a5fa" },
] as const;

/** How long to stay in checking phase before resolving (ms). */
export const CHECK_DELAY = 500;
/** Pause between level complete and next level deal (ms). */
export const LEVEL_TRANSITION_MS = 1400;
/** How long the intro stagger lasts before cards become interactive (ms). */
export const INTRO_DELAY_MS = 900;
/** Per-card stagger delay during entrance (ms). */
export const STAGGER_MS = 55;
