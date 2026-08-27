import type { Mark } from "../types";

/** Pure game rules + minimax opponent. No React, no DOM. */

export const LINES: readonly (readonly [number, number, number])[] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export type Board = Mark[];

export function winnerLine(board: Board): readonly number[] | null {
  for (const l of LINES) {
    const [a, b, c] = l;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return l;
  }
  return null;
}

export function winnerOf(board: Board): Mark {
  const l = winnerLine(board);
  return l ? board[l[0]!]! : null;
}

export function isFull(board: Board): boolean {
  return board.every((c) => c !== null);
}

export function legalMoves(board: Board): number[] {
  const out: number[] = [];
  board.forEach((c, i) => {
    if (!c) out.push(i);
  });
  return out;
}

/** Negamax-ish score from the perspective of `me`. Boards are tiny — no memo needed. */
function score(board: Board, me: Mark, turn: Mark, depth: number): number {
  const w = winnerOf(board);
  if (w === me) return 10 - depth;
  if (w) return depth - 10;
  if (isFull(board)) return 0;

  const other: Mark = turn === "X" ? "O" : "X";
  const results = legalMoves(board).map((i) => {
    const next = board.slice();
    next[i] = turn;
    return score(next, me, other, depth + 1);
  });
  return turn === me ? Math.max(...results) : Math.min(...results);
}

export function bestMove(board: Board, me: Mark): number {
  const other: Mark = me === "X" ? "O" : "X";
  let best = -Infinity;
  let move = legalMoves(board)[0] ?? 0;
  for (const i of legalMoves(board)) {
    const next = board.slice();
    next[i] = me;
    const s = score(next, me, other, 0);
    if (s > best) {
      best = s;
      move = i;
    }
  }
  return move;
}

/** Optimal move with probability `smartness`, otherwise a random legal move. */
export function chooseMove(board: Board, me: Mark, smartness: number): number {
  const moves = legalMoves(board);
  if (moves.length === 0) return -1;
  if (Math.random() <= smartness) return bestMove(board, me);
  return moves[Math.floor(Math.random() * moves.length)]!;
}
