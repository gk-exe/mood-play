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
  ScorePop,
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

function spawnParticles(out: Particle[], x: number, y: number, color: BubbleColor, n = 10) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.5;
    const sp = 1.4 + Math.random() * 2.6;
    out.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 0.6,
      life: 1,
      color,
      size: 3 + Math.random() * 3.5,
    });
  }
}

function spawnScorePop(out: ScorePop[], x: number, y: number, text: string, color: string, big = false) {
  out.push({ x, y, text, color, life: 1, big });
}

function detachAsFalling(out: FallingBubble[], b: Bubble) {
  const c = cellCenter(b.row, b.col);
  out.push({
    x: c.x,
    y: c.y,
    vx: (Math.random() - 0.5) * 1.6,
    vy: 0.3 + Math.random() * 0.6,
    rot: 0,
    vrot: (Math.random() - 0.5) * 0.1,
    color: b.color,
    life: 1,
  });
}

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
    scorePops: [],
    phase: "aiming",
    score: 0,
    level: 1,
    shotsSincePressure: 0,
    shake: 0,
    aimDragging: false,
    combo: 0,
    comboFlash: 0,
    bestCombo: 0,
    pops: 0,
  };
}

export interface UseGameLoopApi {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  score: number;
  level: number;
  best: number;
  combo: number;
  bestCombo: number;
  pops: number;
  gameOver: boolean;
  restart: () => void;
}

export function useGameLoop(mode: GameMode): UseGameLoopApi {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<GameState>(createInitialState(mode));
  const modeRef = useRef<GameMode>(mode);

  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestComboState] = useState(0);
  const [pops, setPops] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [best, setBest] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    return Number(window.localStorage.getItem(BEST_SCORE_KEY)) || 0;
  });
  const lastScoreRef = useRef(0);
  const lastLevelRef = useRef(1);
  const lastComboRef = useRef(0);
  const lastBestComboRef = useRef(0);
  const lastPopsRef = useRef(0);

  const restart = useCallback(() => {
    stateRef.current = createInitialState(modeRef.current);
    lastScoreRef.current = 0;
    lastLevelRef.current = 1;
    lastComboRef.current = 0;
    lastBestComboRef.current = 0;
    lastPopsRef.current = 0;
    setScore(0);
    setLevel(1);
    setCombo(0);
    setBestComboState(0);
    setPops(0);
    setGameOver(false);
  }, []);

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
      /** Selective glow. 0 at rest, lifted only for impact/popping/shooter. */
      glow = 0,
    ) => {
      const c = COLOR_MAP[color];
      const r = BUBBLE_RADIUS * scale;
      ctx.save();
      ctx.translate(x, y);
      if (rot) ctx.rotate(rot);
      ctx.globalAlpha = alpha;

      // Soft halo — only when explicitly requested (impact / shooter pulse).
      if (glow > 0) {
        const haloR = r * 1.7;
        const halo = ctx.createRadialGradient(0, 0, r * 0.7, 0, 0, haloR);
        halo.addColorStop(0, `${c.glow}66`);
        halo.addColorStop(1, `${c.glow}00`);
        ctx.fillStyle = halo;
        ctx.globalAlpha = alpha * glow * 0.7;
        ctx.beginPath();
        ctx.arc(0, 0, haloR, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = alpha;
      }

      // Soft drop shadow — gives premium-casual depth without bloom.
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.arc(0, r * 0.18, r * 0.95, 0, Math.PI * 2);
      ctx.fill();

      // Body — saturated solid with gentle top-lit gradient.
      const grd = ctx.createRadialGradient(-r * 0.35, -r * 0.45, r * 0.15, 0, 0, r);
      grd.addColorStop(0, c.shine);
      grd.addColorStop(0.5, c.fill);
      grd.addColorStop(1, c.rim);
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Crisp rim — restores candy weight.
      ctx.strokeStyle = c.rim;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Compact specular highlight.
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.beginPath();
      ctx.arc(-r * 0.35, -r * 0.4, r * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.beginPath();
      ctx.arc(-r * 0.38, -r * 0.44, r * 0.09, 0, Math.PI * 2);
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

      const glow = COLOR_MAP[s.shooter.color].glow;

      ctx.save();
      ctx.strokeStyle = `${glow}66`;
      ctx.setLineDash([4, 7]);
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.shadowColor = glow;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      const pts = traj.points;
      for (let i = 0; i < pts.length; i++) {
        if (i === 0) ctx.moveTo(pts[i].x, pts[i].y);
        else ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.stroke();
      ctx.restore();

      if (traj.snap) {
        drawBubble(traj.snap.x, traj.snap.y, s.shooter.color, 0.35, 1, 0, 0.35);
        ctx.save();
        ctx.strokeStyle = `${glow}cc`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(traj.snap.x, traj.snap.y, BUBBLE_RADIUS, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    };

    // Mode-themed drifting backdrop dots, drawn on canvas for atmosphere.
    type Dot = { x: number; y: number; r: number; vy: number; alpha: number; hue: 0 | 1 };
    const dots: Dot[] = Array.from({ length: 14 }, () => ({
      x: Math.random() * CANVAS_WIDTH,
      y: Math.random() * CANVAS_HEIGHT,
      r: 1 + Math.random() * 2,
      vy: -0.1 - Math.random() * 0.18,
      alpha: 0.08 + Math.random() * 0.18,
      hue: Math.random() < 0.5 ? 0 : 1,
    }));

    const drawBackdrop = () => {
      const theme = MODES[modeRef.current].theme;
      const g = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      g.addColorStop(0, theme.bgTop);
      g.addColorStop(1, theme.bgBottom);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Single subtle accent glow above the play area — quiet, premium.
      const halo = ctx.createRadialGradient(
        CANVAS_WIDTH / 2,
        -60,
        20,
        CANVAS_WIDTH / 2,
        -60,
        340,
      );
      halo.addColorStop(0, `${theme.accent}26`);
      halo.addColorStop(1, `${theme.accent}00`);
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Soft warm pad under shooter — much gentler than before.
      const halo2 = ctx.createRadialGradient(
        SHOOTER_X,
        CANVAS_HEIGHT + 10,
        20,
        SHOOTER_X,
        CANVAS_HEIGHT + 10,
        220,
      );
      halo2.addColorStop(0, `${theme.accent2}1f`);
      halo2.addColorStop(1, `${theme.accent2}00`);
      ctx.fillStyle = halo2;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Drifting dust motes — reduced count + opacity to stop eye fatigue.
      for (const d of dots) {
        d.y += d.vy;
        if (d.y < -10) {
          d.y = CANVAS_HEIGHT + 10;
          d.x = Math.random() * CANVAS_WIDTH;
        }
        ctx.globalAlpha = d.alpha * 0.55;
        ctx.fillStyle = d.hue === 0 ? theme.accent : theme.accent2;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const render = () => {
      const s = stateRef.current;
      const theme = MODES[modeRef.current].theme;

      ctx.save();
      if (s.shake > 0.01) {
        const sx = (Math.random() - 0.5) * s.shake;
        const sy = (Math.random() - 0.5) * s.shake;
        ctx.translate(sx, sy);
      }

      drawBackdrop();

      // Combo flash rim
      if (s.comboFlash > 0.01) {
        ctx.save();
        ctx.globalAlpha = s.comboFlash * 0.6;
        const rim = ctx.createRadialGradient(
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT / 2,
          CANVAS_WIDTH / 2,
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT / 2,
          CANVAS_WIDTH * 0.9,
        );
        rim.addColorStop(0, `${theme.accent}00`);
        rim.addColorStop(1, `${theme.accent}ff`);
        ctx.fillStyle = rim;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.restore();
      }

      // Ceiling
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fillRect(0, 0, CANVAS_WIDTH, 3);

      // Grid bubbles
      for (const b of s.grid.values()) {
        const c = cellCenter(b.row, b.col);
        if (b.popping !== undefined) {
          drawBubble(c.x, c.y, b.color, 1 - b.popping, 1 + b.popping * 0.55, 0, 0.9);
        } else {
          drawBubble(c.x, c.y, b.color);
        }
      }

      // Falling
      for (const f of s.falling) {
        drawBubble(f.x, f.y, f.color, Math.max(0, f.life), 1, f.rot, 0.4);
      }

      // Particles
      for (const p of s.particles) {
        const col = COLOR_MAP[p.color];
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.shadowColor = col.glow;
        ctx.shadowBlur = 10;
        ctx.fillStyle = col.fill;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      drawAimGuide(s);

      // Shooter glow pad
      const padGrd = ctx.createRadialGradient(SHOOTER_X, SHOOTER_Y, 4, SHOOTER_X, SHOOTER_Y, 60);
      padGrd.addColorStop(0, `${theme.accent}66`);
      padGrd.addColorStop(1, `${theme.accent}00`);
      ctx.fillStyle = padGrd;
      ctx.beginPath();
      ctx.arc(SHOOTER_X, SHOOTER_Y, 60, 0, Math.PI * 2);
      ctx.fill();

      if (s.moving) {
        drawBubble(s.moving.x, s.moving.y, s.moving.color, 1, 1, 0, 0.75);
      } else if (s.phase === "aiming") {
        const pulse = 1 + Math.sin(frame * 0.1) * 0.05;
        drawBubble(SHOOTER_X, SHOOTER_Y, s.shooter.color, 1, pulse, 0, 0.85);
      }

      // Next preview chip
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.beginPath();
      ctx.arc(SHOOTER_X - 64, SHOOTER_Y + 6, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      drawBubble(SHOOTER_X - 64, SHOOTER_Y + 6, s.next, 0.85, 0.7, 0, 0.3);

      // Danger line
      const dangerY = GRID_OFFSET_Y + (MAX_ROWS - 1) * ROW_HEIGHT;
      ctx.save();
      ctx.strokeStyle = "rgba(255,92,110,0.45)";
      ctx.setLineDash([4, 6]);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, dangerY);
      ctx.lineTo(CANVAS_WIDTH, dangerY);
      ctx.stroke();
      ctx.restore();

      // Score pops
      for (const sp of s.scorePops) {
        ctx.save();
        const alpha = Math.min(1, sp.life * 1.4);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = sp.color;
        ctx.shadowColor = sp.color;
        ctx.shadowBlur = 12;
        ctx.font = `${sp.big ? 700 : 600} ${sp.big ? 22 : 16}px ui-sans-serif, system-ui, -apple-system, "Inter", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(sp.text, sp.x, sp.y);
        ctx.restore();
      }

      ctx.restore();
    };

    const onPop = (count: number, comboLevel: number) => {
      const s = stateRef.current;
      s.shake = Math.min(12, s.shake + count * 0.7 + comboLevel * 0.4);
      s.comboFlash = Math.min(1, s.comboFlash + 0.25 + comboLevel * 0.1);
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate(Math.min(40, 8 + count * 2 + comboLevel * 3));
        } catch {
          /* noop */
        }
      }
    };

    const tick = () => {
      const s = stateRef.current;
      const cfg = MODES[modeRef.current];
      frame++;

      if (s.shake > 0) s.shake = Math.max(0, s.shake - 0.5);
      if (s.comboFlash > 0) s.comboFlash = Math.max(0, s.comboFlash - 0.04);

      // Particles
      if (s.particles.length) {
        for (const p of s.particles) {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.08;
          p.life -= 0.028;
        }
        s.particles = s.particles.filter((p) => p.life > 0);
      }

      // Score pops
      if (s.scorePops.length) {
        for (const sp of s.scorePops) {
          sp.y -= sp.big ? 0.9 : 0.6;
          sp.life -= 0.022;
        }
        s.scorePops = s.scorePops.filter((p) => p.life > 0);
      }

      // Falling
      if (s.falling.length) {
        for (const f of s.falling) {
          f.vy += 0.45;
          f.x += f.vx;
          f.y += f.vy;
          f.rot += f.vrot;
          if (f.y > CANVAS_HEIGHT - 40) f.life -= 0.06;
        }
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

      // Popping anim
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
          const placedCenter = cellCenter(snap.row, snap.col);
          s.moving = null;

          const cluster = findCluster(s.grid, placed.row, placed.col, placed.color);
          if (cluster.length >= 3) {
            for (const [r, c] of cluster) {
              const b = s.grid.get(cellKey(r, c));
              if (b) {
                b.popping = 0;
                const pos = cellCenter(r, c);
                spawnParticles(s.particles, pos.x, pos.y, b.color, 9);
              }
            }
            const floating = findFloating(s.grid);
            for (const [r, c] of floating) {
              const b = s.grid.get(cellKey(r, c));
              if (b && b.popping === undefined) {
                detachAsFalling(s.falling, b);
                s.grid.delete(cellKey(r, c));
              }
            }
            const total = cluster.length + floating.length;
            s.combo += 1;
            if (s.combo > s.bestCombo) s.bestCombo = s.combo;
            const comboMul = 1 + (s.combo - 1) * 0.5;
            const gained = Math.round((cluster.length * 10 + floating.length * 25) * comboMul);
            s.score += gained;
            s.pops += total;

            // Score popup at placed bubble
            const popColor = COLOR_MAP[placed.color].glow;
            spawnScorePop(
              s.scorePops,
              placedCenter.x,
              placedCenter.y - 24,
              `+${gained}`,
              "#ffffff",
              s.combo >= 2,
            );
            if (s.combo >= 2) {
              spawnScorePop(
                s.scorePops,
                placedCenter.x,
                placedCenter.y - 50,
                `×${s.combo} COMBO`,
                popColor,
                true,
              );
            }
            onPop(total, s.combo);
          } else {
            // Missed → reset combo
            s.combo = 0;
          }

          s.shotsSincePressure++;

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
            const nextLevel = 1 + Math.floor(s.score / 250);
            if (nextLevel > s.level) {
              s.level = nextLevel;
              spawnScorePop(
                s.scorePops,
                CANVAS_WIDTH / 2,
                CANVAS_HEIGHT / 2,
                `LEVEL ${s.level}`,
                MODES[modeRef.current].theme.accent,
                true,
              );
            }

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
              s.score += 200;
              spawnScorePop(
                s.scorePops,
                CANVAS_WIDTH / 2,
                CANVAS_HEIGHT / 2 - 30,
                "CLEARED +200",
                MODES[modeRef.current].theme.accent2,
                true,
              );
            }
          }
        }
      }

      if (!anyPopping) {
        if (s.score !== lastScoreRef.current) {
          lastScoreRef.current = s.score;
          setScore(s.score);
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
        if (s.combo !== lastComboRef.current) {
          lastComboRef.current = s.combo;
          setCombo(s.combo);
        }
        if (s.bestCombo !== lastBestComboRef.current) {
          lastBestComboRef.current = s.bestCombo;
          setBestComboState(s.bestCombo);
        }
        if (s.pops !== lastPopsRef.current) {
          lastPopsRef.current = s.pops;
          setPops(s.pops);
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

  return { canvasRef, score, level, best, combo, bestCombo, pops, gameOver, restart };
}
