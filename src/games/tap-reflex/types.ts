export type TapPhase = "intro" | "playing" | "over";

export interface Target {
  id: number;
  /** Center position in px, relative to the playfield. */
  x: number;
  y: number;
  r: number;
  /** epoch ms when it appeared. */
  born: number;
  /** ms it stays alive. */
  life: number;
  /** Palette index for the target colour. */
  tone: number;
}

export interface ScorePop {
  id: number;
  x: number;
  y: number;
  text: string;
  accent: string;
}

export interface Burst {
  id: number;
  x: number;
  y: number;
  r: number;
  accent: string;
}

export interface RunStats {
  score: number;
  hits: number;
  misses: number;
  bestCombo: number;
  /** Average reaction time across all hits, ms. */
  avgReactionMs: number;
  /** 0..100 */
  accuracy: number;
}
