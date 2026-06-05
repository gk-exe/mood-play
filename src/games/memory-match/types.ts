/** Memory Match — domain types. */

export interface Card {
  id: number;
  symbol: string;
  matched: boolean;
}

export type GamePhase =
  | "idle"
  | "playing"
  | "checking"
  | "levelComplete"
  | "gameComplete";

export interface GameState {
  phase: GamePhase;
  levelIndex: number;
  cards: Card[];
  flipped: number[];
  matchedPairs: number;
  totalMoves: number;
  streak: number;
  bestStreak: number;
  elapsedMs: number;
  soundOn: boolean;
}
