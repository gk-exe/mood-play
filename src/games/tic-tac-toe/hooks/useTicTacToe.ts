import { useCallback, useEffect, useRef, useState } from "react";

import { Sfx } from "@/games/_shared";
import { AI_DELAY_MS, MODES, STORAGE_KEY, getMode, type ModeId } from "../constants";
import { EMPTY_RECORD, type Mark, type Outcome, type Record, type TttPhase } from "../types";
import { chooseMove, isFull, winnerLine, winnerOf, type Board } from "../utils/ai";

const EMPTY: Board = Array(9).fill(null);

function readRecord(): Record {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_RECORD;
    return { ...EMPTY_RECORD, ...(JSON.parse(raw) as Partial<Record>) };
  } catch {
    return EMPTY_RECORD;
  }
}

/** Player is always X and always moves first — keeps the loop instant. */
export function useTicTacToe() {
  const [phase, setPhase] = useState<TttPhase>("intro");
  const [mode, setMode] = useState<ModeId>("sharp");
  const [board, setBoard] = useState<Board>(EMPTY);
  const [thinking, setThinking] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [record, setRecord] = useState<Record>(EMPTY_RECORD);
  const [soundOn, setSoundOn] = useState(true);
  const timer = useRef<number | null>(null);

  useEffect(() => setRecord(readRecord()), []);
  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const commitResult = useCallback((result: Outcome) => {
    setOutcome(result);
    setPhase("over");
    Sfx.play(result === "win" ? "combo" : result === "draw" ? "clear" : "gameover");
    Sfx.haptic(result === "win" ? 18 : 8);
    setRecord((prev) => {
      const streak = result === "win" ? prev.streak + 1 : 0;
      const next: Record = {
        wins: prev.wins + (result === "win" ? 1 : 0),
        losses: prev.losses + (result === "loss" ? 1 : 0),
        draws: prev.draws + (result === "draw" ? 1 : 0),
        streak,
        bestStreak: Math.max(prev.bestStreak, streak),
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* noop */
      }
      return next;
    });
  }, []);

  const settle = useCallback(
    (next: Board): boolean => {
      const w: Mark = winnerOf(next);
      if (w === "X") {
        commitResult("win");
        return true;
      }
      if (w === "O") {
        commitResult("loss");
        return true;
      }
      if (isFull(next)) {
        commitResult("draw");
        return true;
      }
      return false;
    },
    [commitResult],
  );

  const play = useCallback(
    (index: number) => {
      if (phase !== "playing" || thinking || board[index]) return;
      const next = board.slice();
      next[index] = "X";
      setBoard(next);
      Sfx.play("place");
      Sfx.haptic(6);
      if (settle(next)) return;

      setThinking(true);
      timer.current = window.setTimeout(() => {
        const ai = chooseMove(next, "O", getMode(mode).smartness);
        const after = next.slice();
        if (ai >= 0) after[ai] = "O";
        setBoard(after);
        setThinking(false);
        Sfx.play("tap");
        settle(after);
      }, AI_DELAY_MS);
    },
    [board, mode, phase, settle, thinking],
  );

  const start = useCallback((id: ModeId) => {
    if (timer.current) window.clearTimeout(timer.current);
    setMode(id);
    setBoard(EMPTY);
    setOutcome(null);
    setThinking(false);
    setPhase("playing");
  }, []);

  const toIntro = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    setPhase("intro");
    setBoard(EMPTY);
    setOutcome(null);
  }, []);

  const toggleSound = useCallback(() => {
    setSoundOn((v) => {
      Sfx.setEnabled(!v);
      return !v;
    });
  }, []);

  return {
    phase,
    mode,
    modes: MODES,
    board,
    line: winnerLine(board),
    thinking,
    outcome,
    record,
    soundOn,
    play,
    start,
    toIntro,
    toggleSound,
  };
}
