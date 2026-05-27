import { BUBBLE_RADIUS, CANVAS_WIDTH } from "../constants";
import type { Bubble, MovingBubble } from "../types";
import { cellCenter } from "./grid";

const COLLISION_DIST = (BUBBLE_RADIUS * 2) * 0.92; // slight overlap = forgiving feel
const COLLISION_DIST_SQ = COLLISION_DIST * COLLISION_DIST;

export interface StepResult {
  hit: boolean;
  hitTop: boolean;
}

/** Advance the moving bubble one frame, bouncing off side walls. */
export function stepMoving(m: MovingBubble, grid: Map<string, Bubble>): StepResult {
  m.x += m.vx;
  m.y += m.vy;

  // Side walls — bounce.
  if (m.x < BUBBLE_RADIUS) {
    m.x = BUBBLE_RADIUS;
    m.vx = Math.abs(m.vx);
  } else if (m.x > CANVAS_WIDTH - BUBBLE_RADIUS) {
    m.x = CANVAS_WIDTH - BUBBLE_RADIUS;
    m.vx = -Math.abs(m.vx);
  }

  // Top wall — counts as a hit so the bubble snaps to row 0.
  if (m.y <= BUBBLE_RADIUS) {
    return { hit: true, hitTop: true };
  }

  // Collision with existing bubbles.
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
