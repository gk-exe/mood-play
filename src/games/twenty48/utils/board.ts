/**
 * Pure 2048 board math.
 *
 * Rules adapted from the original open-source 2048 by Gabriele Cirulli (MIT).
 * Rewritten in TypeScript as pure functions so the engine stays testable and
 * free of DOM/React concerns.
 */
import { SIZE, TARGET } from "../constants";
import type { Direction, MoveResult, Tile } from "../types";

let nextId = 1;
function makeTile(x: number, y: number, value: number, spawned = false): Tile {
  return { id: nextId++, x, y, value, spawned };
}

function emptyCells(tiles: Tile[]): Array<{ x: number; y: number }> {
  const taken = new Set(tiles.map((t) => `${t.x},${t.y}`));
  const free: Array<{ x: number; y: number }> = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (!taken.has(`${x},${y}`)) free.push({ x, y });
    }
  }
  return free;
}

export function spawnTile(tiles: Tile[]): Tile[] {
  const free = emptyCells(tiles);
  if (free.length === 0) return tiles;
  const cell = free[Math.floor(Math.random() * free.length)];
  return [...tiles, makeTile(cell.x, cell.y, Math.random() < 0.9 ? 2 : 4, true)];
}

export function createBoard(): Tile[] {
  return spawnTile(spawnTile([]));
}

function traversalOrder(dir: Direction) {
  const xs = [...Array(SIZE).keys()];
  const ys = [...Array(SIZE).keys()];
  if (dir === "right") xs.reverse();
  if (dir === "down") ys.reverse();
  return { xs, ys };
}

const VECTORS: Record<Direction, { dx: number; dy: number }> = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

function gridOf(tiles: Tile[]): (Tile | null)[][] {
  const grid: (Tile | null)[][] = Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => null),
  );
  for (const t of tiles) grid[t.y][t.x] = t;
  return grid;
}

/** Slide + merge every tile one step in `dir`. Pure — returns a new tile list. */
export function move(tiles: Tile[], dir: Direction): MoveResult {
  const grid = gridOf(tiles.map((t) => ({ ...t, merged: false, spawned: false })));
  const { xs, ys } = traversalOrder(dir);
  const { dx, dy } = VECTORS[dir];
  const mergedIds = new Set<number>();
  let moved = false;
  let gained = 0;
  let reachedTarget = false;

  for (const y of ys) {
    for (const x of xs) {
      const tile = grid[y][x];
      if (!tile) continue;

      let cx = x;
      let cy = y;
      // Slide as far as possible.
      while (true) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx < 0 || nx >= SIZE || ny < 0 || ny >= SIZE) break;
        const target = grid[ny][nx];
        if (!target) {
          grid[ny][nx] = tile;
          grid[cy][cx] = null;
          cx = nx;
          cy = ny;
          moved = true;
          continue;
        }
        // Merge once per tile per move.
        if (target.value === tile.value && !mergedIds.has(target.id) && !mergedIds.has(tile.id)) {
          target.value *= 2;
          target.merged = true;
          mergedIds.add(target.id);
          grid[cy][cx] = null;
          gained += target.value;
          if (target.value >= TARGET) reachedTarget = true;
          moved = true;
        }
        break;
      }
      tile.x = cx;
      tile.y = cy;
    }
  }

  const out: Tile[] = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const t = grid[y][x];
      if (t) out.push({ ...t, x, y });
    }
  }

  return { tiles: out, moved, gained, reachedTarget };
}

/** True when no slide or merge is possible in any direction. */
export function isGameOver(tiles: Tile[]): boolean {
  if (tiles.length < SIZE * SIZE) return false;
  const grid = gridOf(tiles);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const v = grid[y][x]?.value;
      if (v === undefined) return false;
      if (x + 1 < SIZE && grid[y][x + 1]?.value === v) return false;
      if (y + 1 < SIZE && grid[y + 1][x]?.value === v) return false;
    }
  }
  return true;
}

export function highestTile(tiles: Tile[]): number {
  return tiles.reduce((max, t) => (t.value > max ? t.value : max), 0);
}
