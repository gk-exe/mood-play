/**
 * Bubble Shooter — domain types.
 * Kept tiny: only what gameplay actually needs.
 */

/** Soft, calming palette — 5 colors keeps matches frequent (satisfying). */
export type BubbleColor = "rose" | "peach" | "sand" | "sage" | "sky";

export interface Bubble {
  /** Hex grid row (0 = top). */
  row: number;
  /** Hex grid column. */
  col: number;
  color: BubbleColor;
  /** Pop animation progress 0..1, undefined when alive. */
  popping?: number;
}

export interface MovingBubble {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: BubbleColor;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 0..1, decays each frame
  color: BubbleColor;
  size: number;
}

export type GamePhase = "aiming" | "firing" | "resolving" | "gameover";

export interface GameState {
  grid: Map<string, Bubble>; // key = `${row},${col}`
  shooter: {
    color: BubbleColor;
    angle: number; // radians, -PI..0 (pointing upward hemisphere)
  };
  next: BubbleColor;
  moving: MovingBubble | null;
  particles: Particle[];
  phase: GamePhase;
  score: number;
  aimDragging: boolean;
}
