import { BUBBLE_RADIUS, CANVAS_WIDTH } from "../constants";
import type { Bubble, BubbleColor, MovingBubble } from "../types";
import { cellCenter, cellKey, snapToGrid } from "./grid";

const COLLISION_DIST = BUBBLE_RADIUS * 2 * 0.92;
const COLLISION_DIST_SQ = COLLISION_DIST * COLLISION_DIST;

export interface StepResult {
  hit: boolean;
  hitTop: boolean;
}

/** Advance one frame; bounce off side walls. Mutates `m`. */
export function stepMoving(m: MovingBubble, grid: Map<string, Bubble>): StepResult {
  m.x += m.vx;
  m.y += m.vy;

  if (m.x < BUBBLE_RADIUS) {
    m.x = BUBBLE_RADIUS;
    m.vx = Math.abs(m.vx);
  } else if (m.x > CANVAS_WIDTH - BUBBLE_RADIUS) {
    m.x = CANVAS_WIDTH - BUBBLE_RADIUS;
    m.vx = -Math.abs(m.vx);
  }

  if (m.y <= BUBBLE_RADIUS) {
    return { hit: true, hitTop: true };
  }

  for (const b of grid.values()) {
    if (b.popping !== undefined) continue;
    const c = cellCenter(b.row, b.col);
    const dx = c.x - m.x;
    const dy = c.y - m.y;
    if (dx * dx + dy * dy < COLLISION_DIST_SQ) {
      return { hit: true, hitTop: false };
    }
  }

  return { hit: false, hitTop: false };
}

export interface Trajectory {
  /** Polyline (in canvas coords) of the projectile path. */
  points: Array<{ x: number; y: number }>;
  /** Predicted snap cell — exactly where a real shot lands. */
  snap: { row: number; col: number; x: number; y: number } | null;
}

/**
 * Simulate a shot using the SAME stepMoving + snapToGrid the live shot uses.
 * Guarantees guide ↔ projectile parity.
 */
export function simulateTrajectory(
  startX: number,
  startY: number,
  angle: number,
  speed: number,
  grid: Map<string, Bubble>,
  maxSteps = 400,
): Trajectory {
  const m: MovingBubble = {
    x: startX,
    y: startY,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    color: "rose" as BubbleColor,
  };
  const points: Array<{ x: number; y: number }> = [{ x: m.x, y: m.y }];
  for (let i = 0; i < maxSteps; i++) {
    const prevVx = Math.sign(m.vx);
    const res = stepMoving(m, grid);
    // If bounce happened, add the wall-contact vertex for crisp visual.
    if (Math.sign(m.vx) !== prevVx) {
      points.push({ x: m.x, y: m.y });
    }
    if (res.hit) {
      points.push({ x: m.x, y: m.y });
      const snap = snapToGrid(m.x, m.y, grid);
      // Defensive: cell must be free; snapToGrid already ensures that.
      if (grid.has(cellKey(snap.row, snap.col))) {
        return { points, snap: null };
      }
      const c = cellCenter(snap.row, snap.col);
      return { points, snap: { row: snap.row, col: snap.col, x: c.x, y: c.y } };
    }
  }
  return { points, snap: null };
}
