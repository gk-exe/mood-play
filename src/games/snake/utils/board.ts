import { COLS } from "../constants";
import type { Cell } from "../types";

/** Pure board helpers — no React, no canvas. */

export function sameCell(a: Cell, b: Cell): boolean {
  return a.x === b.x && a.y === b.y;
}

export function wrap(v: number): number {
  return (v + COLS) % COLS;
}

export function outOfBounds(c: Cell): boolean {
  return c.x < 0 || c.y < 0 || c.x >= COLS || c.y >= COLS;
}

/** Random free cell not occupied by the snake. */
export function spawnFood(snake: readonly Cell[]): Cell {
  const taken = new Set(snake.map((c) => `${c.x},${c.y}`));
  const free: Cell[] = [];
  for (let y = 0; y < COLS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (!taken.has(`${x},${y}`)) free.push({ x, y });
    }
  }
  if (free.length === 0) return { x: 0, y: 0 };
  return free[Math.floor(Math.random() * free.length)]!;
}

export function initialSnake(): Cell[] {
  const mid = Math.floor(COLS / 2);
  return [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid },
  ];
}
