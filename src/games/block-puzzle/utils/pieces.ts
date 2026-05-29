import { ALL_COLORS, PIECES, PIECE_WEIGHTS } from "../constants";
import type { BlockColor, PieceShape, TrayPiece } from "../types";

let uidCounter = 0;
const nextUid = () => `p${++uidCounter}`;

function weightedPickShape(): PieceShape {
  let total = 0;
  for (const p of PIECES) total += PIECE_WEIGHTS[p.id] ?? 1;
  let r = Math.random() * total;
  for (const p of PIECES) {
    r -= PIECE_WEIGHTS[p.id] ?? 1;
    if (r <= 0) return p;
  }
  return PIECES[0];
}

function pickColor(): BlockColor {
  return ALL_COLORS[Math.floor(Math.random() * ALL_COLORS.length)];
}

export function newTrayPiece(): TrayPiece {
  return { uid: nextUid(), shape: weightedPickShape(), color: pickColor() };
}

export function newTray(n = 3): TrayPiece[] {
  return Array.from({ length: n }, () => newTrayPiece());
}
