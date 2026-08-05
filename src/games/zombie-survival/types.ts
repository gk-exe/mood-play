export type SurvivalPhase = "intro" | "playing" | "over";

export interface Vec {
  x: number;
  y: number;
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hp: number;
  maxHp: number;
  speed: number;
  hue: string;
  /** 0..1 hit flash decay */
  flash: number;
  value: number;
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export interface ScorePop {
  x: number;
  y: number;
  life: number;
  text: string;
  color: string;
}

/** Values mirrored out of the RAF loop into React once per frame-batch. */
export interface SurvivalStats {
  score: number;
  kills: number;
  timeMs: number;
  streak: number;
  wave: number;
}
