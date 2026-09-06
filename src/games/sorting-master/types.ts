export type SortPhase = "intro" | "playing" | "levelClear" | "over";

/** A tube is a bottom-to-top stack of color indices. */
export type Tube = number[];

export type Board = Tube[];

export interface SortStats {
  score: number;
  level: number;
  moves: number;
  timeMs: number;
}
