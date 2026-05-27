/**
 * Bubble Shooter — domain types.
 */

export type BubbleColor = "rose" | "peach" | "sand" | "sage" | "sky";

export type GameMode = "relax" | "classic" | "challenge";

export interface Bubble {
  row: number;
  col: number;
  color: BubbleColor;
  /** Pop animation 0..1. */
  popping?: number;
}

export interface MovingBubble {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: BubbleColor;
}

export interface FallingBubble {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  color: BubbleColor;
  life: number; // 1 → 0
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: BubbleColor;
  size: number;
}

export type GamePhase = "aiming" | "firing" | "resolving" | "gameover";

export interface GameState {
  grid: Map<string, Bubble>;
  shooter: { color: BubbleColor; angle: number };
  next: BubbleColor;
  moving: MovingBubble | null;
  falling: FallingBubble[];
  particles: Particle[];
  phase: GamePhase;
  score: number;
  level: number;
  shotsSincePressure: number;
  shake: number; // current shake intensity, decays
  aimDragging: boolean;
}
