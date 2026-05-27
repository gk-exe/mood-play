import { useEffect, useRef, useState } from "react";
import {
  BUBBLE_RADIUS,
  BUBBLE_SPEED,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  COLORS,
  COLOR_MAP,
  GRID_COLS,
  INITIAL_ROWS,
  MAX_ROWS,
  SHOOTER_X,
  SHOOTER_Y,
  randomColor,
} from "../constants";
import type { Bubble, BubbleColor, GameState, Particle } from "../types";
import { cellCenter, cellKey, colorsRemaining, colsInRow, findCluster, findFloating, snapToGrid } from "../utils/grid";
import { stepMoving } from "../utils/physics";

function buildInitialGrid(): Map<string, Bubble> {
  const g = new Map<string, Bubble>();
  for (let row = 0; row < INITIAL_ROWS; row++) {
    const cols = colsInRow(row);
    for (let col = 0; col < cols; col++) {
      g.set(cellKey(row, col), { row, col, color: randomColor() });
    }
  }
  return g;
}

function pickShooterColor(grid: Map<string, Bubble>): BubbleColor {
  const remaining = [...colorsRemaining(grid)];
  if (remaining.length === 0) return randomColor();
  return remaining[Math.floor(Math.random() * remaining.length)];
}

function spawnParticles(out: Particle[], x: number, y: number, color: BubbleColor) {
  const n = 6;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.5;
    const sp = 1.2 + Math.random() * 1.6;
    out.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 0.3,
      life: 1,
      color,
      size: 3 + Math.random() * 3,
    });
  }
}

function createInitialState(): GameState {
  const grid = buildInitialGrid();
  return {
    grid,
    shooter: { color: pickShooterColor(grid), angle: -Math.PI / 2 },
    next: pickShooterColor(grid),
    moving: null,
    particles: [],
    phase: "aiming",
    score: 0,
    aimDragging: false,
  };
}

export interface UseGameLoopApi {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  score: number;
  gameOver: boolean;
  restart: () => void;
}

export function useGameLoop(): UseGameLoopApi {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<GameState>(createInitialState());

  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const lastScoreRef = useRef(0);

  const restart = () => {
    stateRef.current = createInitialState();
    lastScoreRef.current = 0;
    setScore(0);
    setGameOver(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = CANVAS_WIDTH * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;
    canvas.style.width = `${CANVAS_WIDTH}px`;
    canvas.style.height = `${CANVAS_HEIGHT}px`;
    ctx.scale(dpr, dpr);

    let raf = 0;
    let running = true;

    const drawBubble = (x: number, y: number, color: BubbleColor, alpha = 1, scale = 1) => {
      const c = COLOR_MAP[color];
      const r = BUBBLE_RADIUS * scale;
      ctx.globalAlpha = alpha;
      const grd = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.15, x, y, r);
      grd.addColorStop(0, c.shine);
      grd.addColorStop(1, c.fill);
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = c.rim;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.beginPath();
      ctx.arc(x - r * 0.35, y - r * 0.4, r * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    const drawAimGuide = (s: GameState) => {
      if (s.phase !== "aiming" || !s.aimDragging) return;
      const steps = 60;
      let x = SHOOTER_X;
      let y = SHOOTER_Y;
      const vx = Math.cos(s.shooter.angle) * BUBBLE_SPEED;
      const vy = Math.sin(s.shooter.angle) * BUBBLE_SPEED;
      let cvx = vx;
      ctx.save();
      ctx.strokeStyle = "rgba(60,60,80,0.18)";
      ctx.setLineDash([4, 6]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let i = 0; i < steps; i++) {
        x += cvx;
        y += vy;
        if (x < BUBBLE_RADIUS) { x = BUBBLE_RADIUS; cvx = Math.abs(cvx); }
        else if (x > CANVAS_WIDTH - BUBBLE_RADIUS) { x = CANVAS_WIDTH - BUBBLE_RADIUS; cvx = -Math.abs(cvx); }
        if (y < BUBBLE_RADIUS + 4) break;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    };

    const render = () => {
      const s = stateRef.current;
      ctx.fillStyle = "#faf6ee";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = "rgba(0,0,0,0.04)";
      ctx.fillRect(0, 0, CANVAS_WIDTH, 4);
      for (const b of s.grid.values()) {
        const c = cellCenter(b.row, b.col);
        if (b.popping !== undefined) {
          drawBubble(c.x, c.y, b.color, 1 - b.popping, 1 + b.popping * 0.4);
        } else {
          drawBubble(c.x, c.y, b.color);
        }
      }
      for (const p of s.particles) {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = COLOR_MAP[p.color].fill;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      drawAimGuide(s);
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      ctx.beginPath();
      ctx.ellipse(SHOOTER_X, SHOOTER_Y + 26, 36, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      if (s.moving) {
        drawBubble(s.moving.x, s.moving.y, s.moving.color);
      } else if (s.phase === "aiming") {
        drawBubble(SHOOTER_X, SHOOTER_Y, s.shooter.color);
      }
      drawBubble(SHOOTER_X - 60, SHOOTER_Y + 4, s.next, 0.6, 0.7);
    };

    const tick = () => {
      const s = stateRef.current;
      if (s.particles.length) {
        for (const p of s.particles) {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.08;
          p.life -= 0.03;
        }
        s.particles = s.particles.filter((p) => p.life > 0);
      }
      let anyPopping = false;
      for (const [k, b] of s.grid) {
        if (b.popping !== undefined) {
          anyPopping = true;
          b.popping += 0.12;
          if (b.popping >= 1) s.grid.delete(k);
        }
      }
      if (s.phase === "firing" && s.moving) {
        const res = stepMoving(s.moving, s.grid);
        if (res.hit) {
          const snap = snapToGrid(s.moving.x, s.moving.y, s.grid);
          const placed: Bubble = { row: snap.row, col: snap.col, color: s.moving.color };
          s.grid.set(cellKey(snap.row, snap.col), placed);
          s.moving = null;
          const cluster = findCluster(s.grid, placed.row, placed.col, placed.color);
          if (cluster.length >= 3) {
            for (const [r, c] of cluster) {
              const b = s.grid.get(cellKey(r, c));
              if (b) {
                b.popping = 0;
                const pos = cellCenter(r, c);
                spawnParticles(s.particles, pos.x, pos.y, b.color);
              }
            }
            const floating = findFloating(s.grid);
            for (const [r, c] of floating) {
              const b = s.grid.get(cellKey(r, c));
              if (b && b.popping === undefined) {
                b.popping = 0;
                const pos = cellCenter(r, c);
                spawnParticles(s.particles, pos.x, pos.y, b.color);
              }
            }
            s.score += (cluster.length + floating.length) * 10;
          }
          let lost = false;
          for (const b of s.grid.values()) {
            if (b.row >= MAX_ROWS) { lost = true; break; }
          }
          if (lost) {
            s.phase = "gameover";
            setGameOver(true);
          } else {
            const aliveCount = [...s.grid.values()].filter((b) => b.popping === undefined).length;
            s.shooter.color = s.next;
            s.next = pickShooterColor(s.grid);
            s.phase = "aiming";
            if (aliveCount === 0) {
              const fresh = buildInitialGrid();
              s.grid = fresh;
              s.shooter.color = pickShooterColor(fresh);
              s.next = pickShooterColor(fresh);
            }
          }
        }
      }
      if (s.score !== lastScoreRef.current && !anyPopping) {
        lastScoreRef.current = s.score;
        setScore(s.score);
      }
      render();
      if (running) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const getPoint = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * CANVAS_WIDTH,
        y: ((e.clientY - rect.top) / rect.height) * CANVAS_HEIGHT,
      };
    };
    const updateAngle = (px: number, py: number) => {
      const s = stateRef.current;
      const dx = px - SHOOTER_X;
      const dy = py - SHOOTER_Y;
      let a = Math.atan2(dy, dx);
      const min = -Math.PI + 0.18;
      const max = -0.18;
      if (a > max && a < Math.PI / 2) a = max;
      else if (a < min || a >= Math.PI / 2) a = min;
      s.shooter.angle = a;
    };
    const onDown = (e: PointerEvent) => {
      e.preventDefault();
      const s = stateRef.current;
      if (s.phase !== "aiming") return;
      s.aimDragging = true;
      const p = getPoint(e);
      updateAngle(p.x, p.y);
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.aimDragging) return;
      const p = getPoint(e);
      updateAngle(p.x, p.y);
    };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.aimDragging) return;
      s.aimDragging = false;
      if (s.phase !== "aiming") return;
      s.moving = {
        x: SHOOTER_X,
        y: SHOOTER_Y,
        vx: Math.cos(s.shooter.angle) * BUBBLE_SPEED,
        vy: Math.sin(s.shooter.angle) * BUBBLE_SPEED,
        color: s.shooter.color,
      };
      s.phase = "firing";
      try { canvas.releasePointerCapture(e.pointerId); } catch { }
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, []);
  void COLORS; void GRID_COLS;
  return { canvasRef, score, gameOver, restart };
}
