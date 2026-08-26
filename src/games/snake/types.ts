export type SnakePhase = "intro" | "playing" | "paused" | "over";

export interface Cell {
  x: number;
  y: number;
}

export interface SnakeStats {
  score: number;
  length: number;
  food: number;
  timeMs: number;
}
