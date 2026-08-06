import { useCallback, useEffect, useRef, useState } from "react";
import { Sfx } from "@/games/_shared";
import {
  BASE_POINTS,
  MISS_PENALTY,
  SPEED_BONUS,
  STORAGE_KEY,
  comboMultiplier,
  getMode,
  type ModeId,
} from "../constants";
import type { Burst, RunStats, ScorePop, Target, TapPhase } from "../types";
import { lifeFor, pickSpot, spawnIntervalFor, speedFactor } from "../utils/spawn";

const TONE_COUNT = 4;

function readBest(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

function writeBest(v: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(v));
  } catch {
    /* noop */
  }
}

export interface TapReflexApi {
  phase: TapPhase;
  mode: ModeId;
  targets: Target[];
  pops: ScorePop[];
  bursts: Burst[];
  score: number;
  combo: number;
  bestCombo: number;
  remainingMs: number;
  best: number;
  stats: RunStats;
  soundOn: boolean;
  fieldRef: React.RefObject<HTMLDivElement | null>;
  start: (mode: ModeId) => void;
  toIntro: () => void;
  hit: (id: number) => void;
  missTap: (x: number, y: number) => void;
  toggleSound: () => void;
}

/**
 * Tap Reflex engine.
 *
 * DOM-rendered: at most a handful of targets are alive at once, so React state
 * plus CSS transitions beat a canvas loop for both code size and crispness.
 * The RAF loop only spawns/expires targets — the shrink ring is pure CSS.
 */
export function useTapReflex(): TapReflexApi {
  const fieldRef = useRef<HTMLDivElement | null>(null);

  const [phase, setPhase] = useState<TapPhase>("intro");
  const [mode, setMode] = useState<ModeId>("classic");
  const [targets, setTargets] = useState<Target[]>([]);
  /** Live target list — the loop's source of truth; state is a snapshot. */
  const liveTargets = useRef<Target[]>([]);
  const [pops, setPops] = useState<ScorePop[]>([]);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);
  const [best, setBest] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [stats, setStats] = useState<RunStats>({
    score: 0,
    hits: 0,
    misses: 0,
    bestCombo: 0,
    avgReactionMs: 0,
    accuracy: 0,
  });

  // Mutable run bookkeeping — never drives a render directly.
  const run = useRef({
    startedAt: 0,
    nextSpawnAt: 0,
    seq: 0,
    hits: 0,
    misses: 0,
    reactionTotal: 0,
    combo: 0,
    bestCombo: 0,
    score: 0,
    ended: false,
  });

  useEffect(() => {
    setBest(readBest());
  }, []);

  const finish = useCallback(() => {
    if (run.current.ended) return;
    run.current.ended = true;
    const r = run.current;
    const attempts = r.hits + r.misses;
    const finalScore = Math.max(0, Math.round(r.score));
    const next: RunStats = {
      score: finalScore,
      hits: r.hits,
      misses: r.misses,
      bestCombo: r.bestCombo,
      avgReactionMs: r.hits > 0 ? Math.round(r.reactionTotal / r.hits) : 0,
      accuracy: attempts > 0 ? Math.round((r.hits / attempts) * 100) : 0,
    };
    setStats(next);
    liveTargets.current = [];
    setTargets([]);
    setPhase("over");
    Sfx.play("gameover");
    setBest((prev) => {
      if (finalScore > prev) {
        writeBest(finalScore);
        return finalScore;
      }
      return prev;
    });
  }, []);

  // Main loop: spawn + expire. Runs only while playing.
  // The live list lives in a ref; React state is a published snapshot, so no
  // side effects ever run inside a state updater.
  useEffect(() => {
    if (phase !== "playing") return;
    const cfg = getMode(mode);
    let raf = 0;

    const tick = () => {
      const now = performance.now();
      const elapsed = now - run.current.startedAt;
      const left = cfg.durationMs - elapsed;
      setRemainingMs(Math.max(0, left));

      if (left <= 0) {
        finish();
        return;
      }

      let list = liveTargets.current;
      let changed = false;

      // Expire
      const alive = list.filter((t) => now - t.born < t.life);
      if (alive.length !== list.length) {
        const lost = list.length - alive.length;
        list = alive;
        changed = true;
        run.current.misses += lost;
        run.current.combo = 0;
        run.current.score = Math.max(0, run.current.score - MISS_PENALTY * lost);
        setCombo(0);
        setScore(Math.round(run.current.score));
        Sfx.play("deny");
      }

      // Spawn
      if (now >= run.current.nextSpawnAt && list.length < cfg.maxTargets) {
        const el = fieldRef.current;
        if (el) {
          const spot = pickSpot(el.clientWidth, el.clientHeight, cfg.radius, list);
          run.current.seq += 1;
          list = [
            ...list,
            {
              id: run.current.seq,
              x: spot.x,
              y: spot.y,
              r: cfg.radius,
              born: now,
              life: lifeFor(cfg, elapsed),
              tone: run.current.seq % TONE_COUNT,
            },
          ];
          changed = true;
        }
        run.current.nextSpawnAt = now + spawnIntervalFor(cfg, elapsed);
      }

      if (changed) {
        liveTargets.current = list;
        setTargets(list);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, mode, finish]);

  const addPop = useCallback((x: number, y: number, text: string, accent: string) => {
    const id = ++run.current.seq;
    setPops((p) => [...p, { id, x, y, text, accent }]);
    window.setTimeout(() => setPops((p) => p.filter((q) => q.id !== id)), 700);
  }, []);

  const addBurst = useCallback((x: number, y: number, r: number, accent: string) => {
    const id = ++run.current.seq;
    setBursts((b) => [...b, { id, x, y, r, accent }]);
    window.setTimeout(() => setBursts((b) => b.filter((q) => q.id !== id)), 500);
  }, []);

  const start = useCallback((next: ModeId) => {
    const cfg = getMode(next);
    const now = performance.now();
    run.current = {
      startedAt: now,
      nextSpawnAt: now + 320,
      seq: 0,
      hits: 0,
      misses: 0,
      reactionTotal: 0,
      combo: 0,
      bestCombo: 0,
      score: 0,
      ended: false,
    };
    setMode(next);
    liveTargets.current = [];
    setTargets([]);
    setPops([]);
    setBursts([]);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setRemainingMs(cfg.durationMs);
    setPhase("playing");
    Sfx.play("tap");
  }, []);

  const toIntro = useCallback(() => {
    run.current.ended = true;
    liveTargets.current = [];
    setTargets([]);
    setPhase("intro");
  }, []);

  const hit = useCallback(
    (id: number) => {
      const now = performance.now();
      const t = liveTargets.current.find((x) => x.id === id);
      if (!t) return;
      const reaction = now - t.born;
      const cfg = getMode(mode);
      run.current.hits += 1;
      run.current.reactionTotal += reaction;
      run.current.combo += 1;
      run.current.bestCombo = Math.max(run.current.bestCombo, run.current.combo);

      const speed = speedFactor(reaction, t.life);
      const gained = Math.round(
        (BASE_POINTS + SPEED_BONUS * speed) *
          cfg.multiplier *
          comboMultiplier(run.current.combo),
      );
      run.current.score += gained;

      liveTargets.current = liveTargets.current.filter((x) => x.id !== id);
      setTargets(liveTargets.current);
      setScore(Math.round(run.current.score));
      setCombo(run.current.combo);
      setBestCombo(run.current.bestCombo);
      addPop(t.x, t.y, `+${gained}`, "#fb923c");
      addBurst(t.x, t.y, t.r, "#fb923c");
      Sfx.play(run.current.combo >= 5 ? "combo" : "pickup");
      Sfx.haptic(run.current.combo >= 5 ? 14 : 8);
    },
    [mode, addPop, addBurst],
  );

  const missTap = useCallback(
    (x: number, y: number) => {
      if (run.current.ended) return;
      run.current.misses += 1;
      run.current.combo = 0;
      run.current.score = Math.max(0, run.current.score - MISS_PENALTY);
      setCombo(0);
      setScore(Math.round(run.current.score));
      addPop(x, y, `-${MISS_PENALTY}`, "#f87171");
      Sfx.play("deny");
    },
    [addPop],
  );

  const toggleSound = useCallback(() => {
    setSoundOn((v) => {
      Sfx.setEnabled(!v);
      return !v;
    });
  }, []);

  return {
    phase,
    mode,
    targets,
    pops,
    bursts,
    score,
    combo,
    bestCombo,
    remainingMs,
    best,
    stats,
    soundOn,
    fieldRef,
    start,
    toIntro,
    hit,
    missTap,
    toggleSound,
  };
}
