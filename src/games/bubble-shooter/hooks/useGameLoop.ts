import { useCallback, useEffect, useRef, useState } from "react";
import {
  BEST_SCORE_KEY,
  BUBBLE_RADIUS,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  COLOR_MAP,
  GRID_OFFSET_Y,
  INITIAL_ROWS,
  MAX_ROWS,
  MODES,
  ROW_HEIGHT,
  SHOOTER_X,
  SHOOTER_Y,
  colorPoolForLevel,
  pickFrom,
} from "../constants";
import type {
  Bubble,
  BubbleColor,
  FallingBubble,
  GameMode,
  GameState,
  Particle,
} from "../types";
import {
  cellCenter,
  cellKey,
  colorsRemaining,
  colsInRow,
  findCluster,
  findFloating,
  snapToGrid,
} from "../utils/grid";
import { simulateTrajectory, stepMoving } from "../utils/physics";

function buildInitialGrid(pool: readonly BubbleColor[]): Map<string, Bubble> {
  const g = new Map<string, Bubble>();
  for (let row = 0; row < INITIAL_ROWS; row++) {
    const cols = colsInRow(row);
    for (let col = 0; col < cols; col++) {
      g.set(cellKey(row, col), { row, col, color: pickFrom(pool) });
    }
  }
  return g;
}

function pickShooterColor(grid: Map<string, Bubble>, pool: readonly BubbleColor[]): BubbleColor {
  const remaining = [...colorsRemaining(grid)].filter((c) => pool.includes(c));
  const src = remaining.length ? remaining : pool;
  return pickFrom(src);
}

function spawnParticles(out: Particle[], x: number, y: number, color: BubbleColor, n = 7) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.5;
    const sp = 1.2 + Math.random() * 1.8;
    out.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 0.4,
      life: 1,
      color,
      size: 3 + Math.random() * 3,
    });
  }
}

function detachAsFalling(out: FallingBubble[], b: Bubble) {
  const c = cellCenter(b.row, b.col);
  out.push({
    x: c.x,
    y: c.y,
    vx: (Math.random() - 0.5) * 1.4,
    vy: 0.3 + Math.random() * 0.6,
    rot: 0,
    vrot: (Math.random() - 0.5) * 0.08,
    color: b.color,
    life: 1,
  });
}

/** Push every bubble down one row and add a fresh top row. Returns true on lose. */
function applyPressure(grid: Map<string, Bubble>, pool: readonly BubbleColor[]): boolean {
  const entries = [...grid.values()];
  grid.clear();
  let lost = false;
  for (const b of entries) {
    const nr = b.row + 1;
    if (nr >= MAX_ROWS) lost = true;
    grid.set(cellKey(nr, b.col), { ...b, row: nr });
  }
  const cols = colsInRow(0);
  for (let c = 0; c < cols; c++) {
    grid.set(cellKey(0, c), { row: 0, col: c, color: pickFrom(pool) });
  }
  return lost;
}

function createInitialState(mode: GameMode): GameState {
  const pool = colorPoolForLevel(mode, 1);
  const grid = buildInitialGrid(pool);
  return {
    grid,
    shooter: { color: pickShooterColor(grid, pool), angle: -Math.PI / 2 },
    next: pickShooterColor(grid, pool),
    moving: null,
    falling: [],
    particles: [],
    phase: "aiming",
    score: 0,
    level: 1,
    shotsSincePressure: 0,
    shake: 0,
    aimDragging: false,
  };
}

export interface UseGameLoopApi {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  score: number;
  level: number;
  best: number;
  gameOver: boolean;
  restart: () => void;
}

export function useGameLoop(mode: GameMode): UseGameLoopApi {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<GameState>(createInitialState(mode));
  const modeRef = useRef<GameMode>(mode);

  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [best, setBest] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    return Number(window.localStorage.getItem(BEST_SCORE_KEY)) || 0;
  });
  const lastScoreRef = useRef(0);
  const lastLevelRef = useRef(1);

  const restart = useCallback(() => {
    stateRef.current = createInitialState(modeRef.current);
    lastScoreRef.current = 0;
    lastLevelRef.current = 1;
    setScore(0);
    setLevel(1);
    setGameOver(false);
  }, []);

  // React to mode change.
  useEffect(() => {
    modeRef.current = mode;
    restart();
  }, [mode, restart]);

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
    let frame = 0;

    const drawBubble = (
      x: number,
      y: number,
      color: BubbleColor,
      alpha = 1,
      scale = 1,
      rot = 0,
    ) => {
      const c = COLOR_MAP[color];
      const r = BUBBLE_RADIUS * scale;
      ctx.save();
      ctx.translate(x, y);
      if (rot) ctx.rotate(rot);
      ctx.globalAlpha = alpha;
      const grd = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.15, 0, 0, r);
      grd.addColorStop(0, c.shine);
      grd.addColorStop(1, c.fill);
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = c.rim;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.beginPath();
      ctx.arc(-r * 0.35, -r * 0.4, r * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawAimGuide = (s: GameState) => {
      if (s.phase !== "aiming" || !s.aimDragging) return;
      const cfg = MODES[modeRef.current];
      const traj = simulateTrajectory(
        SHOOTER_X,
        SHOOTER_Y,
        s.shooter.angle,
        cfg.bubbleSpeed,
        s.grid,
      );

      ctx.save();
      ctx.strokeStyle = "rgba(60,60,80,0.22)";
      ctx.setLineDash([4, 6]);
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.beginPath();
      const pts = traj.points;
      for (let i = 0; i < pts.length; i++) {
        if (i === 0) ctx.moveTo(pts[i].x, pts[i].y);
        else ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.stroke();
      ctx.restore();

      if (traj.snap) {
        // Ghost target — shows EXACT predicted snap cell.
        drawBubble(traj.snap.x, traj.snap.y, s.shooter.color, 0.18, 1);
        ctx.save();
        ctx.strokeStyle = "rgba(60,60,80,0.35)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(traj.snap.x, traj.snap.y, BUBBLE_RADIUS, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    };

    const render = () => {
      const s = stateRef.current;
      ctx.save();
      // Soft screen shake on big pops.
      if (s.shake > 0.01) {
        const sx = (Math.random() - 0.5) * s.shake;
        const sy = (Math.random() - 0.5) * s.shake;
        ctx.translate(sx, sy);
      }

      ctx.fillStyle = "#faf6ee";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Subtle ceiling line
      ctx.fillStyle = "rgba(0,0,0,0.04)";
      ctx.fillRect(0, 0, CANVAS_WIDTH, 4);

      // Grid bubbles
      for (const b of s.grid.values()) {
        const c = cellCenter(b.row, b.col);
        if (b.popping !== undefined) {
          drawBubble(c.x, c.y, b.color, 1 - b.popping, 1 + b.popping * 0.45);
        } else {
          drawBubble(c.x, c.y, b.color);
        }
      }

      // Falling bubbles
      for (const f of s.falling) {
        drawBubble(f.x, f.y, f.color, Math.max(0, f.life), 1, f.rot);
      }

      // Particles
      for (const p of s.particles) {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = COLOR_MAP[p.color].fill;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      drawAimGuide(s);

      // Shooter shadow
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      ctx.beginPath();
      ctx.ellipse(SHOOTER_X, SHOOTER_Y + 26, 36, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      if (s.moving) {
        drawBubble(s.moving.x, s.moving.y, s.moving.color);
      } else if (s.phase === "aiming") {
        // Aim pulse — gentle breathing scale
        const pulse = 1 + Math.sin(frame * 0.08) * 0.04;
        drawBubble(SHOOTER_X, SHOOTER_Y, s.shooter.color, 1, pulse);
      }

      // Next-up preview
      drawBubble(SHOOTER_X - 60, SHOOTER_Y + 4, s.next, 0.6, 0.7);

      // Danger line indicator
      const dangerY = GRID_OFFSET_Y + (MAX_ROWS - 1) * ROW_HEIGHT;
      ctx.save();
      ctx.strokeStyle = "rgba(217,140,131,0.25)";
      ctx.setLineDash([3, 5]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, dangerY);
      ctx.lineTo(CANVAS_WIDTH, dangerY);
      ctx.stroke();
      ctx.restore();

      ctx.restore();
    };

    const onPop = (count: number) => {
      const s = stateRef.current;
      s.shake = Math.min(8, s.shake + count * 0.6);
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate(Math.min(30, 6 + count * 2));
        } catch {
          /* noop */
        }
      }
    };

    const tick = () => {
      const s = stateRef.current;
      const cfg = MODES[modeRef.current];
      frame++;

      // Shake decay
      if (s.shake > 0) s.shake = Math.max(0, s.shake - 0.4);

      // Particles
      if (s.particles.length) {
        for (const p of s.particles) {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.08;
          p.life -= 0.03;
        }
        s.particles = s.particles.filter((p) => p.life > 0);
      }

      // Falling bubbles
      if (s.falling.length) {
        for (const f of s.falling) {
          f.vy += 0.45;
          f.x += f.vx;
          f.y += f.vy;
          f.rot += f.vrot;
          if (f.y > CANVAS_HEIGHT - 40) {
            f.life -= 0.06;
          }
        }
        // Puff when offscreen / faded
        const survivors: FallingBubble[] = [];
        for (const f of s.falling) {
          if (f.life <= 0 || f.y > CANVAS_HEIGHT + 40) {
            spawnParticles(s.particles, f.x, Math.min(f.y, CANVAS_HEIGHT - 10), f.color, 4);
          } else {
            survivors.push(f);
          }
        }
        s.falling = survivors;
      }

      // Popping animation
      let anyPopping = false;
      for (const [k, b] of s.grid) {
        if (b.popping !== undefined) {
          anyPopping = true;
          b.popping += 0.14;
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
                spawnParticles(s.particles, pos.x, pos.y, b.color, 7);
              }
            }
            // Floating detach → fall, not pop
            const floating = findFloating(s.grid);
            for (const [r, c] of floating) {
              const b = s.grid.get(cellKey(r, c));
              if (b && b.popping === undefined) {
                detachAsFalling(s.falling, b);
                s.grid.delete(cellKey(r, c));
              }
            }
            // Combo bonus: cluster + floating
            const total = cluster.length + floating.length;
            s.score += cluster.length * 10 + floating.length * 20;
            onPop(total);
          }

          s.shotsSincePressure++;

          // Pressure (row drop)
          if (cfg.pressureEvery > 0) {
            const interval = Math.max(3, cfg.pressureEvery - (s.level - 1) * cfg.pressureRamp);
            if (s.shotsSincePressure >= interval) {
              s.shotsSincePressure = 0;
              const pool = colorPoolForLevel(modeRef.current, s.level);
              const lost = applyPressure(s.grid, pool);
              if (lost) {
                s.phase = "gameover";
                setGameOver(true);
              }
            }
          }

          // Lose if any live bubble reached the danger row
          if (s.phase !== "gameover") {
            for (const b of s.grid.values()) {
              if (b.popping === undefined && b.row >= MAX_ROWS - 1) {
                s.phase = "gameover";
                setGameOver(true);
                break;
              }
            }
          }

          if (s.phase !== "gameover") {
            // Level up every 200 pts
            const nextLevel = 1 + Math.floor(s.score / 200);
            if (nextLevel > s.level) s.level = nextLevel;

            const pool = colorPoolForLevel(modeRef.current, s.level);
            const aliveCount = [...s.grid.values()].filter((b) => b.popping === undefined).length;
            s.shooter.color = s.next;
            s.next = pickShooterColor(s.grid, pool);
            s.phase = "aiming";
            if (aliveCount === 0) {
              const fresh = buildInitialGrid(pool);
              s.grid = fresh;
              s.shooter.color = pickShooterColor(fresh, pool);
              s.next = pickShooterColor(fresh, pool);
              s.score += 100; // clear bonus
            }
          }
        }
      }

      if (!anyPopping) {
        if (s.score !== lastScoreRef.current) {
          lastScoreRef.current = s.score;
          setScore(s.score);
          // Best score
          try {
            const prev = Number(window.localStorage.getItem(BEST_SCORE_KEY)) || 0;
            if (s.score > prev) {
              window.localStorage.setItem(BEST_SCORE_KEY, String(s.score));
              setBest(s.score);
            }
          } catch {
            /* noop */
          }
        }
        if (s.level !== lastLevelRef.current) {
          lastLevelRef.current = s.level;
          setLevel(s.level);
        }
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
      const cfg = MODES[modeRef.current];
      s.moving = {
        x: SHOOTER_X,
        y: SHOOTER_Y,
        vx: Math.cos(s.shooter.angle) * cfg.bubbleSpeed,
        vy: Math.sin(s.shooter.angle) * cfg.bubbleSpeed,
        color: s.shooter.color,
      };
      s.phase = "firing";
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
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

  return { canvasRef, score, level, best, gameOver, restart };
}
