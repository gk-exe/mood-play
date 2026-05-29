/** Block Puzzle — domain types. */

export type BlockColor =
  | "rose"
  | "amber"
  | "lemon"
  | "lime"
  | "teal"
  | "sky"
  | "indigo"
  | "violet";

/** A piece shape — array of [col, row] cell offsets relative to its origin. */
export interface PieceShape {
  id: string;
  cells: ReadonlyArray<readonly [number, number]>;
  /** Logical width in cells. */
  w: number;
  /** Logical height in cells. */
  h: number;
}

export interface TrayPiece {
  /** unique runtime id */
  uid: string;
  shape: PieceShape;
  color: BlockColor;
  /** Set true while user is dragging this tray slot. */
  used?: boolean;
}

export interface FallingCell {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  color: BlockColor;
  life: number;
}

export interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: BlockColor;
  size: number;
  life: number;
}

export interface ScorePop {
  x: number;
  y: number;
  text: string;
  life: number;
  color: string;
  big?: boolean;
}

export interface FlashRow {
  /** row index when type='row', col index when type='col' */
  index: number;
  type: "row" | "col";
  /** 1 -> 0 */
  life: number;
  color: BlockColor;
}

export type BoardCell = BlockColor | null;
