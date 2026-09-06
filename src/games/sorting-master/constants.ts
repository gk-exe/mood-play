/** Sorting Master — water-sort puzzle tuning + palette (Satisfaction Lab). */

export const ACCENT = "#5eead4";
export const ACCENT_SECONDARY = "#38bdf8";
export const BEST_KEY = "sorting-master:best:v1";

/** Segments per tube. */
export const CAPACITY = 4;

/** Undos granted per level. */
export const UNDOS_PER_LEVEL = 3;

/** Liquid colors — rich, softly saturated, no fluorescent glare. */
export const LIQUIDS: readonly string[] = [
  "#5eead4",
  "#60a5fa",
  "#f472b6",
  "#fbbf24",
  "#a78bfa",
  "#34d399",
  "#fb7185",
  "#38bdf8",
  "#facc15",
  "#c084fc",
];

export interface ModeDef {
  id: ModeId;
  label: string;
  blurb: string;
  /** Colors present in level 1. */
  startColors: number;
  /** Max colors this mode ramps to. */
  maxColors: number;
  multiplier: number;
}

export type ModeId = "easy" | "classic" | "expert";

export const MODES: readonly ModeDef[] = [
  {
    id: "easy",
    label: "Easy Flow",
    blurb: "Fewer colors. Pure calm sorting.",
    startColors: 3,
    maxColors: 6,
    multiplier: 1,
  },
  {
    id: "classic",
    label: "Classic Sort",
    blurb: "The standard pour puzzle.",
    startColors: 4,
    maxColors: 8,
    multiplier: 1.5,
  },
  {
    id: "expert",
    label: "Deep Mix",
    blurb: "Crowded tubes, tighter space.",
    startColors: 6,
    maxColors: 10,
    multiplier: 2,
  },
];

export function getMode(id: ModeId): ModeDef {
  return MODES.find((m) => m.id === id) ?? MODES[1];
}

/** Colors used at a given level for a mode. */
export function colorsForLevel(mode: ModeDef, level: number): number {
  return Math.min(mode.maxColors, mode.startColors + Math.floor((level - 1) / 2));
}

/** Free (empty) tubes offered at a given level. */
export function emptyTubesForLevel(mode: ModeDef): number {
  return mode.id === "expert" ? 1 : 2;
}

export const SCORE_PER_TUBE = 60;
export const LEVEL_CLEAR_BONUS = 240;
