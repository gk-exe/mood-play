import { BOARD_SIZE } from "../constants";
import type { BoardCell, BlockColor, PieceShape } from "../types";

export function makeEmptyBoard(): BoardCell[] {
  return new Array(BOARD_SIZE * BOARD_SIZE).fill(null);
}

export const idx = (col: number, row: number) => row * BOARD_SIZE + col;

export function canPlace(board: BoardCell[], shape: PieceShape, col: number, row: number): boolean {
  for (const [dc, dr] of shape.cells) {
    const c = col + dc;
    const r = row + dr;
    if (c < 0 || r < 0 || c >= BOARD_SIZE || r >= BOARD_SIZE) return false;
    if (board[idx(c, r)] !== null) return false;
  }
  return true;
}

export function place(
  board: BoardCell[],
  shape: PieceShape,
  col: number,
  row: number,
  color: BlockColor,
): BoardCell[] {
  const next = board.slice();
  for (const [dc, dr] of shape.cells) next[idx(col + dc, row + dr)] = color;
  return next;
}

export interface ClearResult {
  next: BoardCell[];
  clearedRows: number[];
  clearedCols: number[];
  clearedCells: Array<{ col: number; row: number; color: BlockColor }>;
}

export function clearLines(board: BoardCell[]): ClearResult {
  const rows: number[] = [];
  const cols: number[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    let full = true;
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[idx(c, r)] === null) { full = false; break; }
    }
    if (full) rows.push(r);
  }
  for (let c = 0; c < BOARD_SIZE; c++) {
    let full = true;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (board[idx(c, r)] === null) { full = false; break; }
    }
    if (full) cols.push(c);
  }

  if (!rows.length && !cols.length) {
    return { next: board, clearedRows: [], clearedCols: [], clearedCells: [] };
  }

  const next = board.slice();
  const clearedCells: ClearResult["clearedCells"] = [];
  const rowSet = new Set(rows);
  const colSet = new Set(cols);
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (rowSet.has(r) || colSet.has(c)) {
        const color = next[idx(c, r)];
        if (color !== null) clearedCells.push({ col: c, row: r, color });
        next[idx(c, r)] = null;
      }
    }
  }
  return { next, clearedRows: rows, clearedCols: cols, clearedCells };
}

/** Whether any of the given shapes fits anywhere on the board. */
export function anyPieceFits(board: BoardCell[], shapes: PieceShape[]): boolean {
  for (const s of shapes) {
    for (let r = 0; r <= BOARD_SIZE - s.h; r++) {
      for (let c = 0; c <= BOARD_SIZE - s.w; c++) {
        if (canPlace(board, s, c, r)) return true;
      }
    }
  }
  return false;
}
