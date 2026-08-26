/** Snake — Quick Hits module tuning. */

export const ACCENT = "#4ade80";
export const ACCENT_SECONDARY = "#38bdf8";

export const STORAGE_KEY = "snake:best:v1";

/** Logical board is always square: COLS x COLS cells. */
export const COLS = 17;

export type ModeId = "chill" | "classic" | "rush";

export interface ModeConfig {
  id: ModeId;
  label: string;
  blurb: string;
  /** Starting ms per step. */
  startStepMs: number;
  /** Fastest allowed ms per step. */
  minStepMs: number;
  /** Ms shaved off each time food is eaten. */
  rampMs: number;
  /** Score multiplier. */
  multiplier: number;
  /** Walls kill (false = wrap around edges). */
  walls: boolean;
}

export const MODES: readonly ModeConfig[] = [
  {
    id: "chill",
    label: "Chill Slither",
    blurb: "Edges wrap around. No sudden endings.",
    startStepMs: 170,
    minStepMs: 110,
    rampMs: 1.5,
    multiplier: 1,
    walls: false,
  },
  {
    id: "classic",
    label: "Classic",
    blurb: "Walls bite. Speed creeps up.",
    startStepMs: 145,
    minStepMs: 70,
    rampMs: 2.5,
    multiplier: 1.5,
    walls: true,
  },
  {
    id: "rush",
    label: "Speed Rush",
    blurb: "Fast from the first bite.",
    startStepMs: 95,
    minStepMs: 48,
    rampMs: 2,
    multiplier: 2.5,
    walls: true,
  },
] as const;

export function getMode(id: ModeId): ModeConfig {
  return MODES.find((m) => m.id === id) ?? MODES[1]!;
}

/** Base points per food, before mode multiplier and speed bonus. */
export const FOOD_POINTS = 10;
