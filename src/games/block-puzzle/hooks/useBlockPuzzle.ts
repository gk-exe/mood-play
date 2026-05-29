import { useCallback, useEffect, useRef, useState } from "react";
import {
  BEST_SCORE_KEY,
  BOARD_PX,
  BOARD_SIZE,
  BOARD_X,
  BOARD_Y,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CELL,
  COLOR_MAP,
  HUD_TOP,
  TRAY_HEIGHT,
} from "../constants";
import {
  anyPieceFits,
  canPlace,
  clearLines,
  makeEmptyBoard,
  place as placeOnBoard,
} from "../utils/board";
import { newTray } from "../utils/pieces";
import type {
  BlockColor,
  BoardCell,
  FallingCell,
  FlashRow,
  PieceShape,
  ScorePop,
  Spark,
  TrayPiece,
} from "../types";
import { Sfx } from "@/games/_shared/audio";

/* ============== Tunables ============== */

const DRAG_LIFT = 96;
const TRAY_SCALE = 0.62;
const TRAY_PAD_TOP = 14;
const SNAP_TOLERANCE = CELL * 0.7;
const GAME_OVER_DELAY = 700;
const COMBO_DECAY_MS = 1400;

/* ============== State ============== */

interface DragState {
  shape: PieceShape;
  color: BlockColor;
  px: number;
  py: number;
  snap: { col: number; row: number } | null;
  slot: number;
}

interface State {
  board: BoardCell[];
  tray: (TrayPiece | null)[];
  drag: DragState | null;
  particles: Spark[];
  falling: FallingCell[];
  pops: ScorePop[];
  flashes: FlashRow[];
  placedPulse: { col: number; row: number; life: number } | null;
  clearAnim: Map<string, { color: BlockColor; life: number }>;
  ambient: number;
  bgPhase: number;
  /** Latest values mirrored from React for the loop. */
  score: number;
  combo: number;
  gameOver: boolean;
  /** Wall-clock ms when combo should reset if no new clears. */
  comboExpiresAt: number;
  /** Wall-clock ms when "game over" overlay should activate (0 = inactive). */
  gameOverAt: number;
}

function makeInitialState(): State {
  return {
    board: makeEmptyBoard(),
    tray: newTray(),
    drag: null,
    particles: [],
    falling: [],
    pops: [],
    flashes: [],
    placedPulse: null,
    clearAnim: new Map(),
    ambient: 0,
    bgPhase: 0,
    score: 0,
    combo: 0,
    gameOver: false,
    comboExpiresAt: 0,
    gameOverAt: 0,
  };
}

/* ============== Drawing helpers ============== */

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawBackdrop(ctx: CanvasRenderingContext2D, w: number, h: number, phase: number) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#181433");
  g.addColorStop(1, "#0e0a24");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  const t = phase;
  const blob = (x: number, y: number, r: number, color: string, alpha: number) => {
    const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, color);
    rg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = alpha;
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
  };
  blob(w * 0.2 + Math.sin(t * 0.4) * 14, h * 0.2 + Math.cos(t * 0.3) * 10, 220, "#6b3aff", 0.22);
  blob(w * 0.8 + Math.cos(t * 0.5) * 14, h * 0.7 + Math.sin(t * 0.4) * 10, 240, "#22d3ee", 0.16);
}

function drawBoardFrame(ctx: CanvasRenderingContext2D, ambient: number) {
  const halo = ctx.createRadialGradient(
    BOARD_X + BOARD_PX / 2, BOARD_Y + BOARD_PX / 2, BOARD_PX * 0.2,
    BOARD_X + BOARD_PX / 2, BOARD_Y + BOARD_PX / 2, BOARD_PX * 0.85,
  );
  halo.addColorStop(0, `rgba(120,90,255,${0.12 + ambient * 0.04})`);
  halo.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(BOARD_X - 30, BOARD_Y - 30, BOARD_PX + 60, BOARD_PX + 60);

  roundRect(ctx, BOARD_X - 6, BOARD_Y - 6, BOARD_PX + 12, BOARD_PX + 12, 22);
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.fill();

  roundRect(ctx, BOARD_X, BOARD_Y, BOARD_PX, BOARD_PX, 16);
  const surf = ctx.createLinearGradient(BOARD_X, BOARD_Y, BOARD_X, BOARD_Y + BOARD_PX);
  surf.addColorStop(0, "#1d1842");
  surf.addColorStop(1, "#15113a");
  ctx.fillStyle = surf;
  ctx.fill();

  ctx.save();
  roundRect(ctx, BOARD_X, BOARD_Y, BOARD_PX, BOARD_PX, 16);
  ctx.clip();
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= BOARD_SIZE; i++) {
    ctx.beginPath();
    ctx.moveTo(BOARD_X + i * CELL + 0.5, BOARD_Y);
    ctx.lineTo(BOARD_X + i * CELL + 0.5, BOARD_Y + BOARD_PX);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(BOARD_X, BOARD_Y + i * CELL + 0.5);
    ctx.lineTo(BOARD_X + BOARD_PX, BOARD_Y + i * CELL + 0.5);
    ctx.stroke();
  }
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const x = BOARD_X + c * CELL + 4;
      const y = BOARD_Y + r * CELL + 4;
      ctx.fillStyle = "rgba(255,255,255,0.022)";
      roundRect(ctx, x, y, CELL - 8, CELL - 8, 6);
      ctx.fill();
    }
  }
  ctx.restore();

  roundRect(ctx, BOARD_X, BOARD_Y, BOARD_PX, BOARD_PX, 16);
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawBlock(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number, color: BlockColor,
  opts: { alpha?: number; glow?: number; scale?: number } = {},
) {
  const { alpha = 1, glow = 0, scale = 1 } = opts;
  const c = COLOR_MAP[color];
  const inset = 3;
  const s = size - inset * 2;
  const cx = x + inset + s / 2;
  const cy = y + inset + s / 2;
  const drawSize = s * scale;
  const dx = cx - drawSize / 2;
  const dy = cy - drawSize / 2;

  ctx.save();
  ctx.globalAlpha = alpha;

  if (glow > 0) {
    ctx.shadowColor = c.glow;
    ctx.shadowBlur = 12 * glow;
  }

  roundRect(ctx, dx, dy, drawSize, drawSize, 7);
  const grad = ctx.createLinearGradient(dx, dy, dx, dy + drawSize);
  grad.addColorStop(0, c.base);
  grad.addColorStop(1, c.rim);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.globalAlpha = alpha * 0.55;
  roundRect(ctx, dx + 3, dy + 3, drawSize - 6, drawSize * 0.32, 5);
  const sh = ctx.createLinearGradient(dx, dy, dx, dy + drawSize * 0.4);
  sh.addColorStop(0, c.shine);
  sh.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sh;
  ctx.fill();

  ctx.globalAlpha = alpha;
  roundRect(ctx, dx + 0.5, dy + 0.5, drawSize - 1, drawSize - 1, 7);
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}

function drawTrayPiece(
  ctx: CanvasRenderingContext2D,
  piece: TrayPiece,
  slotX: number, slotY: number, slotW: number, slotH: number,
  dim: boolean,
) {
  const s = CELL * TRAY_SCALE;
  const pw = piece.shape.w * s;
  const ph = piece.shape.h * s;
  const ox = slotX + (slotW - pw) / 2;
  const oy = slotY + (slotH - ph) / 2;
  for (const [c, r] of piece.shape.cells) {
    drawBlock(ctx, ox + c * s, oy + r * s, s, piece.color, { alpha: dim ? 0.3 : 1 });
  }
}

function drawDragPiece(ctx: CanvasRenderingContext2D, drag: DragState) {
  const pw = drag.shape.w * CELL;
  const ph = drag.shape.h * CELL;
  const ox = drag.px - pw / 2;
  const oy = drag.py - ph / 2 - DRAG_LIFT;
  for (const [c, r] of drag.shape.cells) {
    drawBlock(ctx, ox + c * CELL, oy + r * CELL, CELL, drag.color, { glow: 0.7 });
  }
}

function drawGhost(ctx: CanvasRenderingContext2D, drag: DragState) {
  if (!drag.snap) return;
  const { col, row } = drag.snap;
  for (const [dc, dr] of drag.shape.cells) {
    const x = BOARD_X + (col + dc) * CELL;
    const y = BOARD_Y + (row + dr) * CELL;
    drawBlock(ctx, x, y, CELL, drag.color, { alpha: 0.34, scale: 0.94 });
  }
}

/* ============== Hook ============== */

export interface BlockPuzzleApi {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  score: number;
  best: number;
  combo: number;
  bestCombo: number;
  cleared: number;
  gameOver: boolean;
  restart: () => void;
  soundOn: boolean;
  toggleSound: () => void;
}

const TRAY_TOP_PX = HUD_TOP + BOARD_PX + 24;

function getTraySlotRect(i: number) {
  const slotW = CANVAS_WIDTH / 3;
  const slotH = TRAY_HEIGHT - 14 - 12;
  return {
    x: i * slotW,
    y: TRAY_TOP_PX + TRAY_PAD_TOP,
    w: slotW,
    h: slotH,
  };
}

export function useBlockPuzzle(): BlockPuzzleApi {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<State>(makeInitialState());

  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [cleared, setCleared] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    try {
      const v = localStorage.getItem(BEST_SCORE_KEY);
      if (v) setBest(parseInt(v, 10) || 0);
    } catch { /* noop */ }
  }, []);

  /* ---------- Placement logic ---------- */

  const updateSnap = (drag: DragState) => {
    const pw = drag.shape.w * CELL;
    const ph = drag.shape.h * CELL;
    const ox = drag.px - pw / 2;
    const oy = drag.py - ph / 2 - DRAG_LIFT;
    const col = Math.round((ox - BOARD_X) / CELL);
    const row = Math.round((oy - BOARD_Y) / CELL);
    const sx = BOARD_X + col * CELL;
    const sy = BOARD_Y + row * CELL;
    const dist = Math.hypot(sx - ox, sy - oy);
    if (dist < SNAP_TOLERANCE && canPlace(stateRef.current.board, drag.shape, col, row)) {
      drag.snap = { col, row };
    } else {
      drag.snap = null;
    }
  };

  const tryRefillTray = () => {
    const s = stateRef.current;
    if (s.tray.every((p) => p === null)) {
      s.tray = newTray();
    }
  };

  const checkGameOver = () => {
    const s = stateRef.current;
    const remaining = s.tray.filter((p): p is TrayPiece => p !== null).map((p) => p.shape);
    if (remaining.length === 0) return;
    if (!anyPieceFits(s.board, remaining)) {
      s.gameOverAt = performance.now() + GAME_OVER_DELAY;
    }
  };

  const placePiece = (drag: DragState) => {
    const s = stateRef.current;
    if (!drag.snap) return;
    const { col, row } = drag.snap;
    const placedCount = drag.shape.cells.length;
    s.board = placeOnBoard(s.board, drag.shape, col, row, drag.color);
    s.tray[drag.slot] = null;
    s.placedPulse = { col, row, life: 1 };

    let gained = placedCount;

    const cr = clearLines(s.board);
    if (cr.clearedRows.length || cr.clearedCols.length) {
      s.board = cr.next;
      const lines = cr.clearedRows.length + cr.clearedCols.length;
      for (const c of cr.clearedCells) {
        s.clearAnim.set(`${c.col},${c.row}`, { color: c.color, life: 1 });
        const cx = BOARD_X + c.col * CELL + CELL / 2;
        const cy = BOARD_Y + c.row * CELL + CELL / 2;
        s.falling.push({
          x: cx - CELL / 2 + 4,
          y: cy - CELL / 2 + 4,
          vx: (Math.random() - 0.5) * 80,
          vy: -120 - Math.random() * 60,
          rot: 0,
          vrot: (Math.random() - 0.5) * 4,
          color: c.color,
          life: 1,
        });
        for (let i = 0; i < 4; i++) {
          const ang = Math.random() * Math.PI * 2;
          const sp = 60 + Math.random() * 100;
          s.particles.push({
            x: cx, y: cy,
            vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
            color: c.color,
            size: 2 + Math.random() * 2,
            life: 1,
          });
        }
      }
      for (const r of cr.clearedRows) s.flashes.push({ index: r, type: "row", life: 1, color: drag.color });
      for (const c of cr.clearedCols) s.flashes.push({ index: c, type: "col", life: 1, color: drag.color });

      const newCombo = s.combo + 1;
      const lineBase = 10 * lines * BOARD_SIZE;
      const multi = lines > 1 ? lines * 0.5 : 1;
      const comboBonus = newCombo > 1 ? lineBase * (newCombo - 1) * 0.5 : 0;
      const total = Math.round((lineBase + comboBonus) * multi);
      gained += total;

      s.pops.push({
        x: BOARD_X + BOARD_PX / 2,
        y: BOARD_Y + BOARD_PX / 2,
        text: newCombo >= 2 ? `+${total}  ×${newCombo}` : `+${total}`,
        life: 1,
        color: COLOR_MAP[drag.color].glow,
        big: newCombo >= 2 || lines >= 2,
      });

      if (newCombo >= 2) { Sfx.play("combo"); Sfx.haptic(14); }
      else { Sfx.play("clear"); Sfx.haptic(10); }

      s.combo = newCombo;
      s.comboExpiresAt = performance.now() + COMBO_DECAY_MS;
      setCombo(newCombo);
      setBestCombo((b) => Math.max(b, newCombo));
      setCleared((v) => v + cr.clearedCells.length);
    } else {
      Sfx.play("place");
      Sfx.haptic(6);
    }

    const newScore = s.score + gained;
    s.score = newScore;
    setScore(newScore);
    setBest((prev) => {
      if (newScore > prev) {
        try { localStorage.setItem(BEST_SCORE_KEY, String(newScore)); } catch { /* noop */ }
        return newScore;
      }
      return prev;
    });

    tryRefillTray();
    checkGameOver();
  };

  /* ---------- RAF loop + pointer (single effect, refs handle state) ---------- */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = CANVAS_WIDTH * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    let raf = 0;
    let last = 0;

    const getPos = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - r.left) / r.width) * CANVAS_WIDTH,
        y: ((e.clientY - r.top) / r.height) * CANVAS_HEIGHT,
      };
    };

    const findTrayHit = (px: number, py: number) => {
      for (let i = 0; i < 3; i++) {
        const r = getTraySlotRect(i);
        if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) return i;
      }
      return -1;
    };

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.gameOver) return;
      const { x, y } = getPos(e);
      const slot = findTrayHit(x, y);
      if (slot < 0) return;
      const piece = s.tray[slot];
      if (!piece) return;
      try { canvas.setPointerCapture(e.pointerId); } catch { /* noop */ }
      const drag: DragState = {
        shape: piece.shape,
        color: piece.color,
        px: x,
        py: y,
        snap: null,
        slot,
      };
      updateSnap(drag);
      s.drag = drag;
      Sfx.play("pickup");
      Sfx.haptic(4);
      e.preventDefault();
    };

    const onMove = (e: PointerEvent) => {
      const drag = stateRef.current.drag;
      if (!drag) return;
      const { x, y } = getPos(e);
      drag.px = x;
      drag.py = y;
      updateSnap(drag);
      e.preventDefault();
    };

    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      const drag = s.drag;
      if (!drag) return;
      try { canvas.releasePointerCapture(e.pointerId); } catch { /* noop */ }
      if (drag.snap) {
        placePiece(drag);
      } else {
        Sfx.play("deny");
      }
      s.drag = null;
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    const frame = (t: number) => {
      const dt = last ? Math.min((t - last) / 1000, 0.05) : 0;
      last = t;
      const s = stateRef.current;
      s.bgPhase += dt;
      s.ambient = 0.5 + Math.sin(t * 0.001) * 0.5;

      if (s.combo > 0 && t > s.comboExpiresAt) {
        s.combo = 0;
        setCombo(0);
      }
      if (s.gameOverAt && t > s.gameOverAt && !s.gameOver) {
        s.gameOverAt = 0;
        s.gameOver = true;
        Sfx.play("gameover");
        setGameOver(true);
      }

      if (s.placedPulse) {
        s.placedPulse.life -= dt * 3;
        if (s.placedPulse.life <= 0) s.placedPulse = null;
      }
      for (const [k, v] of s.clearAnim) {
        v.life -= dt * 3;
        if (v.life <= 0) s.clearAnim.delete(k);
      }
      s.particles = s.particles.filter((p) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 280 * dt;
        p.life -= dt * 1.8;
        return p.life > 0;
      });
      s.falling = s.falling.filter((f) => {
        f.x += f.vx * dt;
        f.y += f.vy * dt;
        f.vy += 520 * dt;
        f.rot += f.vrot * dt;
        f.life -= dt * 1.2;
        return f.life > 0 && f.y < CANVAS_HEIGHT + 60;
      });
      s.pops = s.pops.filter((p) => {
        p.y -= 28 * dt;
        p.life -= dt * 0.9;
        return p.life > 0;
      });
      s.flashes = s.flashes.filter((f) => {
        f.life -= dt * 2.2;
        return f.life > 0;
      });

      /* Render */
      drawBackdrop(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, s.bgPhase);
      drawBoardFrame(ctx, s.ambient);

      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          const color = s.board[r * BOARD_SIZE + c];
          if (color) {
            const x = BOARD_X + c * CELL;
            const y = BOARD_Y + r * CELL;
            let scale = 1;
            if (s.placedPulse && s.placedPulse.col === c && s.placedPulse.row === r) {
              scale = 1 + 0.1 * s.placedPulse.life;
            }
            drawBlock(ctx, x, y, CELL, color, { scale });
          }
        }
      }

      for (const [k, v] of s.clearAnim) {
        const [c, r] = k.split(",").map(Number);
        const x = BOARD_X + c * CELL;
        const y = BOARD_Y + r * CELL;
        drawBlock(ctx, x, y, CELL, v.color, {
          alpha: v.life * 0.85,
          scale: 1 + (1 - v.life) * 0.45,
          glow: v.life,
        });
      }

      for (const f of s.flashes) {
        const glow = COLOR_MAP[f.color].glow;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = f.life * 0.18;
        ctx.fillStyle = glow;
        if (f.type === "row") {
          ctx.fillRect(BOARD_X, BOARD_Y + f.index * CELL, BOARD_PX, CELL);
        } else {
          ctx.fillRect(BOARD_X + f.index * CELL, BOARD_Y, CELL, BOARD_PX);
        }
        ctx.restore();
      }

      for (const p of s.particles) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = COLOR_MAP[p.color].glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      for (const f of s.falling) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, f.life);
        ctx.translate(f.x + CELL / 2 - 4, f.y + CELL / 2 - 4);
        ctx.rotate(f.rot);
        drawBlock(ctx, -CELL / 2 + 4, -CELL / 2 + 4, CELL - 8, f.color, { alpha: 1 });
        ctx.restore();
      }

      for (const p of s.pops) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.font = `bold ${p.big ? 22 : 16}px ui-sans-serif, system-ui, -apple-system, "SF Pro Display", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.fillText(p.text, p.x, p.y);
        ctx.restore();
      }

      // Tray surface
      const slotW = CANVAS_WIDTH / 3;
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.025)";
      roundRect(ctx, 8, TRAY_TOP_PX, CANVAS_WIDTH - 16, TRAY_HEIGHT - 12, 18);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.stroke();
      ctx.restore();

      for (let i = 0; i < 3; i++) {
        const piece = s.tray[i];
        if (!piece) continue;
        const isDragging = s.drag?.slot === i;
        const r = getTraySlotRect(i);
        drawTrayPiece(ctx, piece, r.x, r.y, r.w, r.h, isDragging);
      }

      if (s.drag) {
        drawGhost(ctx, s.drag);
        drawDragPiece(ctx, s.drag);
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const restart = useCallback(() => {
    stateRef.current = makeInitialState();
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setCleared(0);
    setGameOver(false);
    Sfx.play("tap");
  }, []);

  const toggleSound = useCallback(() => {
    setSoundOn((v) => {
      Sfx.setEnabled(!v);
      return !v;
    });
  }, []);

  return {
    canvasRef,
    score, best, combo, bestCombo, cleared, gameOver,
    restart, soundOn, toggleSound,
  };
}
