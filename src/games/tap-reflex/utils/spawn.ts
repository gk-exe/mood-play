import type { ModeConfig } from "../constants";

/** Spawn interval tightens the longer the run goes. */
export function spawnIntervalFor(mode: ModeConfig, elapsedMs: number): number {
  const seconds = elapsedMs / 1000;
  return Math.max(
    mode.spawnMinMs,
    mode.spawnStartMs * Math.pow(mode.spawnRamp, seconds),
  );
}

/** Target lifetime shortens the longer the run goes. */
export function lifeFor(mode: ModeConfig, elapsedMs: number): number {
  const seconds = elapsedMs / 1000;
  return Math.max(
    mode.lifeMinMs,
    mode.lifeStartMs * Math.pow(mode.lifeRamp, seconds),
  );
}

export interface Placed {
  x: number;
  y: number;
}

/**
 * Pick a spot inside the playfield that doesn't overlap existing targets and
 * keeps clear of the HUD corners. Falls back to a random point after a few
 * attempts so spawning never stalls.
 */
export function pickSpot(
  width: number,
  height: number,
  r: number,
  existing: readonly Placed[],
  padTop = 78,
  padBottom = 24,
): Placed {
  const minX = r + 14;
  const maxX = Math.max(minX + 1, width - r - 14);
  const minY = r + padTop;
  const maxY = Math.max(minY + 1, height - r - padBottom);

  for (let attempt = 0; attempt < 14; attempt += 1) {
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);
    const clear = existing.every((e) => {
      const dx = e.x - x;
      const dy = e.y - y;
      return dx * dx + dy * dy > (r * 2.3) ** 2;
    });
    if (clear) return { x, y };
  }
  return {
    x: minX + Math.random() * (maxX - minX),
    y: minY + Math.random() * (maxY - minY),
  };
}

/** Reaction speed bonus, 0..1 — full marks for an instant tap. */
export function speedFactor(reactionMs: number, life: number): number {
  return Math.max(0, 1 - reactionMs / life);
}
