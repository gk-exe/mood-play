import { useCallback, useEffect, useRef, useState } from "react";

import { Sfx } from "@/games/_shared";
import {
  COLS,
  FOOD_POINTS,
  MODES,
  STORAGE_KEY,
  getMode,
  type ModeId,
} from "../constants";
import type { Cell, SnakePhase, SnakeStats } from "../types";
import { initialSnake, outOfBounds, sameCell, spawnFood, wrap } from "../utils/board";

interface Engine {
  snake: Cell[];
  food: Cell;
  dir: Cell;
  nextDir: Cell;
  stepMs: number;
  acc: number;
  last: number;
  startedAt: number;
  score: number;
  eaten: number;
}

const DIRS: Record<string, Cell> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

function readBest(): number {
  try {
    return Number(localStorage.getItem(STORAGE_KEY)) || 0;
  } catch {
    return 0;
  }
}

/**
 * Snake engine.
 *
 * The authoritative state lives in a mutable ref advanced by a RAF loop —
 * React only re-renders once per step to paint the board, keeping input
 * latency low on mobile.
 */
export function useSnake() {
  const [phase, setPhase] = useState<SnakePhase>("intro");
  const [mode, setMode] = useState<ModeId>("classic");
  const [best, setBest] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [, force] = useState(0);
  const [stats, setStats] = useState<SnakeStats>({
    score: 0,
    length: 3,
    food: 0,
    timeMs: 0,
  });

  const eng = useRef<Engine>({
    snake: initialSnake(),
    food: { x: 3, y: 3 },
    dir: DIRS.right!,
    nextDir: DIRS.right!,
    stepMs: 145,
    acc: 0,
    last: 0,
    startedAt: 0,
    score: 0,
    eaten: 0,
  });
  const phaseRef = useRef<SnakePhase>("intro");
  const modeRef = useRef<ModeId>("classic");
  const rafRef = useRef<number | null>(null);

  useEffect(() => setBest(readBest()), []);

  const finish = useCallback(() => {
    const e = eng.current;
    phaseRef.current = "over";
    Sfx.play("gameover");
    Sfx.haptic(24);
    const final: SnakeStats = {
      score: e.score,
      length: e.snake.length,
      food: e.eaten,
      timeMs: Date.now() - e.startedAt,
    };
    setStats(final);
    setBest((prev) => {
      const next = Math.max(prev, final.score);
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        /* noop */
      }
      return next;
    });
    setPhase("over");
  }, []);

  const step = useCallback(() => {
    const e = eng.current;
    const cfg = getMode(modeRef.current);
    e.dir = e.nextDir;
    const head = e.snake[0]!;
    let next: Cell = { x: head.x + e.dir.x, y: head.y + e.dir.y };

    if (cfg.walls) {
      if (outOfBounds(next)) return finish();
    } else {
      next = { x: wrap(next.x), y: wrap(next.y) };
    }

    const ate = sameCell(next, e.food);
    const body = ate ? e.snake : e.snake.slice(0, -1);
    if (body.some((c) => sameCell(c, next))) return finish();

    e.snake = [next, ...body];

    if (ate) {
      e.eaten += 1;
      const speedBonus = Math.round(
        (cfg.startStepMs - e.stepMs) / Math.max(1, cfg.startStepMs / 10),
      );
      e.score += Math.round((FOOD_POINTS + speedBonus) * cfg.multiplier);
      e.stepMs = Math.max(cfg.minStepMs, e.stepMs - cfg.rampMs);
      e.food = spawnFood(e.snake);
      Sfx.play("pickup");
      Sfx.haptic(6);
    }
    force((n) => n + 1);
  }, [finish]);

  // RAF loop — fixed timestep accumulator.
  useEffect(() => {
    const tick = (t: number) => {
      rafRef.current = requestAnimationFrame(tick);
      const e = eng.current;
      if (phaseRef.current !== "playing") {
        e.last = t;
        return;
      }
      if (!e.last) e.last = t;
      const dt = Math.min(250, t - e.last);
      e.last = t;
      e.acc += dt;
      while (e.acc >= e.stepMs && phaseRef.current === "playing") {
        e.acc -= e.stepMs;
        step();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [step]);

  const start = useCallback((id: ModeId) => {
    const cfg = getMode(id);
    const snake = initialSnake();
    eng.current = {
      snake,
      food: spawnFood(snake),
      dir: DIRS.right!,
      nextDir: DIRS.right!,
      stepMs: cfg.startStepMs,
      acc: 0,
      last: 0,
      startedAt: Date.now(),
      score: 0,
      eaten: 0,
    };
    modeRef.current = id;
    setMode(id);
    phaseRef.current = "playing";
    setPhase("playing");
    force((n) => n + 1);
  }, []);

  const turn = useCallback((d: keyof typeof DIRS) => {
    const e = eng.current;
    const nd = DIRS[d]!;
    // No instant 180° reversal.
    if (nd.x === -e.dir.x && nd.y === -e.dir.y) return;
    e.nextDir = nd;
  }, []);

  const togglePause = useCallback(() => {
    if (phaseRef.current === "playing") {
      phaseRef.current = "paused";
      setPhase("paused");
    } else if (phaseRef.current === "paused") {
      phaseRef.current = "playing";
      setPhase("playing");
    }
  }, []);

  const toIntro = useCallback(() => {
    phaseRef.current = "intro";
    setPhase("intro");
  }, []);

  const toggleSound = useCallback(() => {
    setSoundOn((v) => {
      Sfx.setEnabled(!v);
      return !v;
    });
  }, []);

  // Keyboard controls (desktop).
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      const map: Record<string, keyof typeof DIRS> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
        w: "up",
        s: "down",
        a: "left",
        d: "right",
      };
      const d = map[ev.key];
      if (d) {
        ev.preventDefault();
        turn(d);
      } else if (ev.key === " ") {
        ev.preventDefault();
        togglePause();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [turn, togglePause]);

  const e = eng.current;
  return {
    phase,
    mode,
    modes: MODES,
    cols: COLS,
    snake: e.snake,
    food: e.food,
    score: e.score,
    length: e.snake.length,
    best,
    stats,
    soundOn,
    start,
    turn,
    togglePause,
    toIntro,
    toggleSound,
  };
}
