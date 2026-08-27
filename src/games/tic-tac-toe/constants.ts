/** Tic-Tac-Toe — Brain Boost module tuning. */

export const ACCENT = "#facc15";
export const ACCENT_SECONDARY = "#38bdf8";

export const STORAGE_KEY = "tic-tac-toe:record:v1";

export type ModeId = "casual" | "sharp" | "perfect";

export interface ModeConfig {
  id: ModeId;
  label: string;
  blurb: string;
  /** Probability the AI plays the optimal move (rest are random legal moves). */
  smartness: number;
}

export const MODES: readonly ModeConfig[] = [
  {
    id: "casual",
    label: "Warm Up",
    blurb: "The bot slips up often. Easy wins.",
    smartness: 0.35,
  },
  {
    id: "sharp",
    label: "Sharp",
    blurb: "It punishes lazy moves.",
    smartness: 0.75,
  },
  {
    id: "perfect",
    label: "Flawless",
    blurb: "Perfect play. A draw is a win.",
    smartness: 1,
  },
] as const;

export function getMode(id: ModeId): ModeConfig {
  return MODES.find((m) => m.id === id) ?? MODES[1]!;
}

export const AI_DELAY_MS = 380;
