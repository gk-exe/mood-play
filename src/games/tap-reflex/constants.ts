/** Quick Hits accent — matches the mood gradient in features/moods/data.ts. */
export const ACCENT = "#fb923c";
export const ACCENT_SECONDARY = "#f87171";
export const DANGER = "#ef4444";

export const STORAGE_KEY = "tap-reflex:best:v1";

export type ModeId = "classic" | "speed" | "precision";

export interface ModeConfig {
  id: ModeId;
  label: string;
  blurb: string;
  /** Session length in ms. */
  durationMs: number;
  /** Spawn interval at the start of a run. */
  spawnStartMs: number;
  /** Spawn interval floor. */
  spawnMinMs: number;
  /** How fast spawn interval tightens per second survived. */
  spawnRamp: number;
  /** Target lifetime at the start of a run. */
  lifeStartMs: number;
  lifeMinMs: number;
  lifeRamp: number;
  /** Target radius in px. */
  radius: number;
  /** Score multiplier for the mode. */
  multiplier: number;
  /** Max simultaneous targets on screen. */
  maxTargets: number;
}

export const MODES: readonly ModeConfig[] = [
  {
    id: "classic",
    label: "Classic",
    blurb: "Tap them before they fade.",
    durationMs: 45_000,
    spawnStartMs: 820,
    spawnMinMs: 380,
    spawnRamp: 0.985,
    lifeStartMs: 1500,
    lifeMinMs: 850,
    lifeRamp: 0.99,
    radius: 38,
    multiplier: 1,
    maxTargets: 4,
  },
  {
    id: "speed",
    label: "Speed Rush",
    blurb: "Faster spawns. Bigger points.",
    durationMs: 40_000,
    spawnStartMs: 560,
    spawnMinMs: 240,
    spawnRamp: 0.978,
    lifeStartMs: 1150,
    lifeMinMs: 620,
    lifeRamp: 0.986,
    radius: 36,
    multiplier: 1.6,
    maxTargets: 5,
  },
  {
    id: "precision",
    label: "Precision",
    blurb: "Small targets. Don't miss.",
    durationMs: 45_000,
    spawnStartMs: 900,
    spawnMinMs: 460,
    spawnRamp: 0.988,
    lifeStartMs: 1700,
    lifeMinMs: 1000,
    lifeRamp: 0.992,
    radius: 24,
    multiplier: 2,
    maxTargets: 3,
  },
] as const;

export const DEFAULT_MODE: ModeId = "classic";

/** Scoring. */
export const BASE_POINTS = 10;
/** Extra points awarded for a lightning-fast tap (scaled by remaining life). */
export const SPEED_BONUS = 20;
export const MISS_PENALTY = 5;
export const MAX_COMBO_MULT = 3;

export function comboMultiplier(combo: number): number {
  return Math.min(1 + Math.max(0, combo - 1) * 0.1, MAX_COMBO_MULT);
}

export function getMode(id: ModeId): ModeConfig {
  return MODES.find((m) => m.id === id) ?? MODES[0];
}

export function formatTime(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${total}s`;
}
