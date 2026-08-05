import {
  ENEMY_BASE_SPEED,
  ENEMY_SPEED_RAMP,
  ENEMY_TIERS,
  SPAWN_MIN_MS,
  SPAWN_RAMP,
  SPAWN_START_MS,
  WAVE_MS,
} from "../constants";
import type { Enemy } from "../types";

/**
 * Pure spawn/difficulty rules.
 *
 * Curve shape (steady tightening interval + per-wave speed ramp + tier
 * unlocking) follows the conventions used by the MIT-licensed LittleJS
 * arcade samples by Frank Force (KilledByAPixel) — re-derived here as pure
 * TypeScript, no source files copied. See docs/OPEN_SOURCE_INTEGRATION.md.
 */

export function waveFor(timeMs: number): number {
  return Math.floor(timeMs / WAVE_MS) + 1;
}

export function spawnIntervalFor(timeMs: number): number {
  const seconds = timeMs / 1000;
  return Math.max(SPAWN_MIN_MS, SPAWN_START_MS * Math.pow(SPAWN_RAMP, seconds));
}

/** Which enemy tiers are allowed to appear at this point in the run. */
export function tierPoolFor(wave: number): number {
  if (wave >= 4) return 3;
  if (wave >= 2) return 2;
  return 1;
}

/** Pick a point just outside the visible rect, on a random edge. */
export function edgePoint(w: number, h: number, pad = 40): { x: number; y: number } {
  const side = Math.floor(Math.random() * 4);
  if (side === 0) return { x: Math.random() * w, y: -pad };
  if (side === 1) return { x: w + pad, y: Math.random() * h };
  if (side === 2) return { x: Math.random() * w, y: h + pad };
  return { x: -pad, y: Math.random() * h };
}

export function makeEnemy(
  id: number,
  w: number,
  h: number,
  timeMs: number,
): Enemy {
  const wave = waveFor(timeMs);
  const pool = tierPoolFor(wave);
  const tier = ENEMY_TIERS[Math.floor(Math.random() * pool)];
  const { x, y } = edgePoint(w, h);
  const speed =
    (ENEMY_BASE_SPEED + (wave - 1) * ENEMY_SPEED_RAMP) *
    (0.85 + Math.random() * 0.35) *
    (tier.r >= 20 ? 0.78 : 1);

  return {
    id,
    x,
    y,
    vx: 0,
    vy: 0,
    r: tier.r,
    hp: tier.hp,
    maxHp: tier.hp,
    speed,
    hue: tier.color,
    flash: 0,
    value: tier.value,
  };
}

/** Score for a kill given the current streak multiplier. */
export function killScore(base: number, streak: number): number {
  const mult = 1 + Math.min(streak, 20) * 0.1;
  return Math.round(base * mult);
}
