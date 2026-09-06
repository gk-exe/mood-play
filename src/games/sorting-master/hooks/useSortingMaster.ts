import { useCallback, useEffect, useRef, useState } from "react";

import { Sfx } from "@/games/_shared";
import {
  BEST_KEY,
  LEVEL_CLEAR_BONUS,
  SCORE_PER_TUBE,
  UNDOS_PER_LEVEL,
  colorsForLevel,
  emptyTubesForLevel,
  getMode,
  type ModeId,
} from "../constants";
import type { Board, SortPhase, SortStats } from "../types";
import {
  canPour,
  completedCount,
  generateLevel,
  hasMoves,
  isSolved,
  pour,
} from "../utils/tubes";

export function useSortingMaster() {
  const [phase, setPhase] = useState<SortPhase>("intro");
  const [mode, setMode] = useState<ModeId>("classic");
  const [board, setBoard] = useState<Board>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [justFilled, setJustFilled] = useState<number | null>(null);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [undosLeft, setUndosLeft] = useState(UNDOS_PER_LEVEL);
  const [best, setBest] = useState(0);
  const [soundOn, setSoundOn] = useState(true);

  const history = useRef<Board[]>([]);
  const startedAt = useRef(0);
  const [stats, setStats] = useState<SortStats>({
    score: 0,
    level: 1,
    moves: 0,
    timeMs: 0,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(BEST_KEY);
      const n = Number(raw);
      if (Number.isFinite(n) && n > 0) setBest(n);
    } catch {
      /* noop */
    }
  }, []);

  const persistBest = useCallback((value: number) => {
    setBest((prev) => {
      if (value <= prev) return prev;
      try {
        localStorage.setItem(BEST_KEY, String(value));
        window.dispatchEvent(new CustomEvent("vg:stats:changed"));
      } catch {
        /* noop */
      }
      return value;
    });
  }, []);

  const buildLevel = useCallback((modeId: ModeId, lvl: number) => {
    const def = getMode(modeId);
    const next = generateLevel(colorsForLevel(def, lvl), emptyTubesForLevel(def));
    history.current = [];
    setBoard(next);
    setSelected(null);
    setJustFilled(null);
    setMoves(0);
    setUndosLeft(UNDOS_PER_LEVEL);
  }, []);

  const start = useCallback(
    (modeId: ModeId) => {
      setMode(modeId);
      setLevel(1);
      setScore(0);
      startedAt.current = Date.now();
      buildLevel(modeId, 1);
      setPhase("playing");
      Sfx.play("tap");
    },
    [buildLevel],
  );

  const nextLevel = useCallback(() => {
    const lvl = level + 1;
    setLevel(lvl);
    buildLevel(mode, lvl);
    setPhase("playing");
    Sfx.play("tap");
  }, [buildLevel, level, mode]);

  const endRun = useCallback(
    (finalScore: number) => {
      persistBest(finalScore);
      setStats({
        score: finalScore,
        level,
        moves,
        timeMs: Date.now() - startedAt.current,
      });
      setPhase("over");
      Sfx.play("gameover");
    },
    [level, moves, persistBest],
  );

  const tapTube = useCallback(
    (index: number) => {
      if (phase !== "playing") return;

      if (selected === null) {
        if (!board[index]?.length) return;
        setSelected(index);
        Sfx.play("pickup");
        return;
      }
      if (selected === index) {
        setSelected(null);
        Sfx.play("tap");
        return;
      }
      if (!canPour(board, selected, index)) {
        setSelected(null);
        Sfx.play("deny");
        return;
      }

      const before = board;
      const { board: next } = pour(board, selected, index);
      history.current = [...history.current.slice(-24), before];
      setBoard(next);
      setSelected(null);
      setMoves((m) => m + 1);

      const gained = completedCount(next) - completedCount(before);
      const multiplier = getMode(mode).multiplier;
      let nextScore = score;
      if (gained > 0) {
        nextScore += Math.round(SCORE_PER_TUBE * gained * multiplier);
        setJustFilled(index);
        window.setTimeout(() => setJustFilled(null), 520);
        Sfx.play("clear");
        Sfx.haptic(10);
      } else {
        Sfx.play("place");
      }

      if (isSolved(next)) {
        nextScore += Math.round(LEVEL_CLEAR_BONUS * multiplier);
        setScore(nextScore);
        persistBest(nextScore);
        setStats({
          score: nextScore,
          level,
          moves: moves + 1,
          timeMs: Date.now() - startedAt.current,
        });
        setPhase("levelClear");
        Sfx.play("combo");
        Sfx.haptic(18);
        return;
      }

      setScore(nextScore);
      if (!hasMoves(next)) {
        window.setTimeout(() => endRun(nextScore), 320);
      }
    },
    [board, endRun, level, mode, moves, persistBest, phase, score, selected],
  );

  const undo = useCallback(() => {
    if (phase !== "playing" || undosLeft <= 0) return;
    const prev = history.current.pop();
    if (!prev) return;
    setBoard(prev);
    setSelected(null);
    setUndosLeft((u) => u - 1);
    setMoves((m) => Math.max(0, m - 1));
    Sfx.play("tap");
  }, [phase, undosLeft]);

  const restartLevel = useCallback(() => {
    if (phase === "intro") return;
    buildLevel(mode, level);
    setPhase("playing");
    Sfx.play("tap");
  }, [buildLevel, level, mode, phase]);

  const toIntro = useCallback(() => {
    setPhase("intro");
    setSelected(null);
  }, []);

  const quitRun = useCallback(() => endRun(score), [endRun, score]);

  const toggleSound = useCallback(() => {
    setSoundOn((v) => {
      Sfx.setEnabled(!v);
      return !v;
    });
  }, []);

  return {
    phase,
    mode,
    board,
    selected,
    justFilled,
    level,
    score,
    moves,
    undosLeft,
    best,
    stats,
    soundOn,
    start,
    nextLevel,
    tapTube,
    undo,
    restartLevel,
    toIntro,
    quitRun,
    toggleSound,
  };
}
