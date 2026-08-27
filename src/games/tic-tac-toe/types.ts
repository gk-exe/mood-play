export type Mark = "X" | "O" | null;

export type TttPhase = "intro" | "playing" | "over";

export type Outcome = "win" | "loss" | "draw";

export interface Record {
  wins: number;
  losses: number;
  draws: number;
  streak: number;
  bestStreak: number;
}

export const EMPTY_RECORD: Record = {
  wins: 0,
  losses: 0,
  draws: 0,
  streak: 0,
  bestStreak: 0,
};
