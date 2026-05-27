import {
  BUBBLE_DIAMETER,
  BUBBLE_RADIUS,
  GRID_COLS,
  GRID_OFFSET_X,
  GRID_OFFSET_Y,
  ROW_HEIGHT,
} from "../constants";
import type { Bubble, BubbleColor } from "../types";

export const cellKey = (row: number, col: number) => `${row},${col}`;

/** Even rows are flush-left; odd rows are shifted right by r (offset hex). */
export function cellCenter(row: number, col: number): { x: number; y: number } {
  const xShift = row % 2 === 0 ? 0 : BUBBLE_RADIUS;
  return {
    x: GRID_OFFSET_X + col * BUBBLE_DIAMETER + xShift,
    y: GRID_OFFSET_Y + row * ROW_HEIGHT,
  };
}

/** Columns count is one fewer on odd rows to stay inside canvas. */
export function colsInRow(row: number): number {
  return row % 2 === 0 ? GRID_COLS : GRID_COLS - 1;
}

const EVEN_NEIGHBORS: ReadonlyArray<[number, number]> = [
  [0, -1], [0, 1],
  [-1, -1], [-1, 0],
  [1, -1], [1, 0],
];
const ODD_NEIGHBORS: ReadonlyArray<[number, number]> = [
  [0, -1], [0, 1],
  [-1, 0], [-1, 1],
  [1, 0], [1, 1],
];

export function neighborsOf(row: number, col: number): Array<[number, number]> {
  const set = row % 2 === 0 ? EVEN_NEIGHBORS : ODD_NEIGHBORS;
  const out: Array<[number, number]> = [];
  for (const [dr, dc] of set) {
    const r = row + dr;
    const c = col + dc;
    if (r < 0) continue;
    if (c < 0 || c >= colsInRow(r)) continue;
    out.push([r, c]);
  }
  return out;
}

/** Snap a free (x, y) point to the nearest empty hex cell. */
export function snapToGrid(
  x: number,
  y: number,
  grid: Map<string, Bubble>,
): { row: number; col: number } {
  // Estimate row from y, then scan nearby rows/cols for nearest empty cell.
  const approxRow = Math.max(0, Math.round((y - GRID_OFFSET_Y) / ROW_HEIGHT));
  let best: { row: number; col: number; d: number } | null = null;
  for (let dr = -1; dr <= 1; dr++) {
    const row = approxRow + dr;
    if (row < 0) continue;
    const cols = colsInRow(row);
    for (let col = 0; col < cols; col++) {
      if (grid.has(cellKey(row, col))) continue;
      const c = cellCenter(row, col);
      const d = (c.x - x) ** 2 + (c.y - y) ** 2;
      if (!best || d < best.d) best = { row, col, d };
    }
  }
  return best ?? { row: approxRow, col: 0 };
}

/** Flood-fill same-color cluster starting from (row, col). */
export function findCluster(
  grid: Map<string, Bubble>,
  row: number,
  col: number,
  color: BubbleColor,
): Array<[number, number]> {
  const visited = new Set<string>();
  const stack: Array<[number, number]> = [[row, col]];
  const out: Array<[number, number]> = [];
  while (stack.length) {
    const [r, c] = stack.pop()!;
    const k = cellKey(r, c);
    if (visited.has(k)) continue;
    visited.add(k);
    const b = grid.get(k);
    if (!b || b.color !== color) continue;
    out.push([r, c]);
    for (const n of neighborsOf(r, c)) stack.push(n);
  }
  return out;
}

/** After a pop, any bubble disconnected from row 0 should drop. */
export function findFloating(grid: Map<string, Bubble>): Array<[number, number]> {
  const connected = new Set<string>();
  const stack: Array<[number, number]> = [];
  // Seed: all bubbles in row 0
  for (let c = 0; c < colsInRow(0); c++) {
    if (grid.has(cellKey(0, c))) stack.push([0, c]);
  }
  while (stack.length) {
    const [r, c] = stack.pop()!;
    const k = cellKey(r, c);
    if (connected.has(k)) continue;
    if (!grid.has(k)) continue;
    connected.add(k);
    for (const n of neighborsOf(r, c)) stack.push(n);
  }
  const floating: Array<[number, number]> = [];
  for (const k of grid.keys()) {
    if (!connected.has(k)) {
      const [r, c] = k.split(",").map(Number);
      floating.push([r, c]);
    }
  }
  return floating;
}

export function colorsRemaining(grid: Map<string, Bubble>): Set<BubbleColor> {
  const s = new Set<BubbleColor>();
  for (const b of grid.values()) s.add(b.color);
  return s;
}
