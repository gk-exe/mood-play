/** 2048 — domain types. */

export interface Tile {
  /** Stable runtime id so React can animate movement. */
  id: number;
  value: number;
  /** Column 0..3 */
  x: number;
  /** Row 0..3 */
  y: number;
  /** True on the frame the tile was created by a merge. */
  merged?: boolean;
  /** True on the frame the tile spawned. */
  spawned?: boolean;
}

export type Direction = "up" | "down" | "left" | "right";

export type GamePhase = "intro" | "playing" | "won" | "lost";

export interface MoveResult {
  tiles: Tile[];
  moved: boolean;
  gained: number;
  reachedTarget: boolean;
}
