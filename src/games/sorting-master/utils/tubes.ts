/**
 * Pure water-sort rules.
 *
 * Rules re-derived from the MIT-licensed open-source "Water Sort Puzzle"
 * family of browser implementations (e.g. github.com/topics/water-sort-puzzle).
 * No source files were imported — this is an original TypeScript rewrite.
 */

import { CAPACITY } from "../constants";
import type { Board, Tube } from "../types";

export function topColor(tube: Tube): number | null {
  return tube.length ? tube[tube.length - 1] : null;
}

/** How many identical segments sit on top of the tube. */
export function topRun(tube: Tube): number {
  if (!tube.length) return 0;
  const c = tube[tube.length - 1];
  let n = 1;
  for (let i = tube.length - 2; i >= 0; i--) {
    if (tube[i] === c) n++;
    else break;
  }
  return n;
}

export function isComplete(tube: Tube): boolean {
  return tube.length === CAPACITY && tube.every((c) => c === tube[0]);
}

export function isEmpty(tube: Tube): boolean {
  return tube.length === 0;
}

export function canPour(board: Board, from: number, to: number): boolean {
  if (from === to) return false;
  const src = board[from];
  const dst = board[to];
  if (!src?.length || !dst) return false;
  if (dst.length >= CAPACITY) return false;
  if (isComplete(src)) return false;
  const t = topColor(dst);
  return t === null || t === topColor(src);
}

/** Returns a new board with the pour applied, plus how many segments moved. */
export function pour(
  board: Board,
  from: number,
  to: number,
): { board: Board; moved: number } {
  if (!canPour(board, from, to)) return { board, moved: 0 };
  const next = board.map((t) => [...t]);
  const color = topColor(next[from])!;
  const amount = Math.min(topRun(next[from]), CAPACITY - next[to].length);
  next[from].length = next[from].length - amount;
  for (let i = 0; i < amount; i++) next[to].push(color);
  return { board: next, moved: amount };
}

export function isSolved(board: Board): boolean {
  return board.every((t) => isEmpty(t) || isComplete(t));
}

export function completedCount(board: Board): number {
  return board.filter(isComplete).length;
}

/** Is there any legal, non-pointless move left? */
export function hasMoves(board: Board): boolean {
  for (let a = 0; a < board.length; a++) {
    for (let b = 0; b < board.length; b++) {
      if (!canPour(board, a, b)) continue;
      // Pouring a whole tube into an empty one changes nothing useful.
      if (isEmpty(board[b]) && topRun(board[a]) === board[a].length) continue;
      return true;
    }
  }
  return false;
}

function key(board: Board): string {
  return board
    .map((t) => t.join(","))
    .sort()
    .join("|");
}

/** Depth-first solvability check with a visited set and a node budget. */
export function isSolvable(board: Board, budget = 60_000): boolean {
  const seen = new Set<string>();
  const stack: Board[] = [board];
  let nodes = 0;
  while (stack.length) {
    const cur = stack.pop()!;
    if (isSolved(cur)) return true;
    if (++nodes > budget) return false;
    const k = key(cur);
    if (seen.has(k)) continue;
    seen.add(k);
    for (let a = 0; a < cur.length; a++) {
      for (let b = 0; b < cur.length; b++) {
        if (!canPour(cur, a, b)) continue;
        if (isEmpty(cur[b]) && topRun(cur[a]) === cur[a].length) continue;
        stack.push(pour(cur, a, b).board);
      }
    }
  }
  return false;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Build a shuffled, verified-solvable level. */
export function generateLevel(colors: number, emptyTubes: number): Board {
  for (let attempt = 0; attempt < 40; attempt++) {
    const deck: number[] = [];
    for (let c = 0; c < colors; c++) {
      for (let i = 0; i < CAPACITY; i++) deck.push(c);
    }
    const mixed = shuffle(deck);
    const board: Board = [];
    for (let i = 0; i < colors; i++) {
      board.push(mixed.slice(i * CAPACITY, (i + 1) * CAPACITY));
    }
    for (let i = 0; i < emptyTubes; i++) board.push([]);
    if (isSolved(board)) continue;
    if (isSolvable(board)) return board;
  }
  // Fallback: near-solved board (always solvable).
  const board: Board = [];
  for (let c = 0; c < colors; c++) board.push(Array(CAPACITY).fill(c));
  const swapA = board[0];
  const swapB = board[1 % colors];
  const tmp = swapA[CAPACITY - 1];
  swapA[CAPACITY - 1] = swapB[CAPACITY - 1];
  swapB[CAPACITY - 1] = tmp;
  for (let i = 0; i < emptyTubes; i++) board.push([]);
  return board;
}
