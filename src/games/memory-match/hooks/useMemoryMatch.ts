import { useCallback, useEffect, useRef, useState } from "react";
import { Sfx } from "@/games/_shared";
import {
  CHECK_DELAY,
  INTRO_DELAY_MS,
  LEVELS,
  LEVEL_TRANSITION_MS,
  SYMBOLS,
} from "../constants";
import type { Card, GameState } from "../types";

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function dealCards(pairs: number): Card[] {
  const selected = SYMBOLS.slice(0, pairs);
  const pool: Card[] = [];
  selected.forEach((s, i) => {
    pool.push({ id: i * 2, symbol: s.char, matched: false });
    pool.push({ id: i * 2 + 1, symbol: s.char, matched: false });
  });
  return shuffle(pool);
}

function readBestTotalTime(): number | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("mm_best_total");
  return raw ? parseInt(raw, 10) : null;
}

function writeBestTotalTime(ms: number) {
  if (typeof window === "undefined") return;
  const current = readBestTotalTime();
  if (current === null || ms < current) {
    localStorage.setItem("mm_best_total", String(ms));
  }
}

function createInitialState(): GameState {
  return {
    phase: "idle",
    levelIndex: 0,
    cards: dealCards(LEVELS[0].pairs),
    flipped: [],
    matchedPairs: 0,
    totalMoves: 0,
    streak: 0,
    bestStreak: 0,
    elapsedMs: 0,
    soundOn: Sfx.enabled,
  };
}

export function useMemoryMatch() {
  const [state, setState] = useState<GameState>(createInitialState);
  const timerRef = useRef<number | null>(null);
  const gameStartRef = useRef<number>(0);

  /* Timer — ticks while playing / checking / levelComplete. */
  useEffect(() => {
    if (
      state.phase !== "playing" &&
      state.phase !== "checking" &&
      state.phase !== "levelComplete"
    ) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    if (!gameStartRef.current) return;
    timerRef.current = window.setInterval(() => {
      setState((s) => ({
        ...s,
        elapsedMs: Date.now() - gameStartRef.current,
      }));
    }, 100);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state.phase]);

  /* Intro → playing auto-start. */
  useEffect(() => {
    if (state.phase !== "idle") return;
    const id = setTimeout(() => {
      setState((s) => {
        if (s.phase !== "idle") return s;
        gameStartRef.current = Date.now();
        return { ...s, phase: "playing" };
      });
    }, INTRO_DELAY_MS);
    return () => clearTimeout(id);
  }, [state.phase]);

  /* Resolve checking phase (match or mismatch). */
  useEffect(() => {
    if (state.phase !== "checking") return;
    const [i1, i2] = state.flipped;
    const match = state.cards[i1].symbol === state.cards[i2].symbol;

    const id = setTimeout(() => {
      setState((current) => {
        if (current.phase !== "checking") return current;

        if (match) {
          const nextCards = current.cards.map((c, i) =>
            i === i1 || i === i2 ? { ...c, matched: true } : c,
          );
          const nextMatched = current.matchedPairs + 1;
          const nextStreak = current.streak + 1;
          const nextBest = Math.max(current.bestStreak, nextStreak);
          const levelConfig = LEVELS[current.levelIndex];
          const levelDone = nextMatched >= levelConfig.pairs;

          if (state.soundOn) {
            Sfx.play(nextStreak >= 2 ? "combo" : "clear");
            Sfx.haptic(10);
          }

          if (levelDone) {
            const isLast = current.levelIndex >= LEVELS.length - 1;
            if (isLast) {
              const total = Date.now() - gameStartRef.current;
              writeBestTotalTime(total);
              return {
                ...current,
                phase: "gameComplete",
                cards: nextCards,
                matchedPairs: nextMatched,
                streak: nextStreak,
                bestStreak: nextBest,
                elapsedMs: total,
              };
            }
            return {
              ...current,
              phase: "levelComplete",
              cards: nextCards,
              matchedPairs: nextMatched,
              streak: nextStreak,
              bestStreak: nextBest,
            };
          }

          return {
            ...current,
            phase: "playing",
            cards: nextCards,
            flipped: [],
            matchedPairs: nextMatched,
            streak: nextStreak,
            bestStreak: nextBest,
          };
        }

        /* Mismatch — flip back. */
        if (state.soundOn) {
          Sfx.play("deny");
        }
        return {
          ...current,
          phase: "playing",
          flipped: [],
          streak: 0,
        };
      });
    }, CHECK_DELAY + (match ? 0 : 200));

    return () => clearTimeout(id);
  }, [state.phase, state.flipped, state.cards, state.levelIndex, state.matchedPairs, state.streak, state.bestStreak, state.soundOn]);

  /* Level complete → deal next level. */
  useEffect(() => {
    if (state.phase !== "levelComplete") return;
    const id = setTimeout(() => {
      setState((current) => {
        if (current.phase !== "levelComplete") return current;
        const nextIndex = current.levelIndex + 1;
        const nextConfig = LEVELS[nextIndex];
        return {
          ...current,
          phase: "playing",
          levelIndex: nextIndex,
          cards: dealCards(nextConfig.pairs),
          flipped: [],
          matchedPairs: 0,
        };
      });
    }, LEVEL_TRANSITION_MS);
    return () => clearTimeout(id);
  }, [state.phase, state.levelIndex]);

  const flipCard = useCallback((index: number) => {
    setState((current) => {
      if (current.phase !== "playing") return current;
      if (current.cards[index].matched) return current;
      if (current.flipped.includes(index)) return current;
      if (current.flipped.length >= 2) return current;

      const nextFlipped = [...current.flipped, index];
      const isSecond = nextFlipped.length === 2;

      if (state.soundOn) {
        Sfx.play("tap");
      }

      return {
        ...current,
        flipped: nextFlipped,
        totalMoves: isSecond ? current.totalMoves + 1 : current.totalMoves,
        phase: isSecond ? "checking" : "playing",
      };
    });
  }, [state.soundOn]);

  const restart = useCallback(() => {
    gameStartRef.current = 0;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setState(createInitialState());
  }, []);

  const toggleSound = useCallback(() => {
    const next = !state.soundOn;
    Sfx.setEnabled(next);
    setState((s) => ({ ...s, soundOn: next }));
  }, [state.soundOn]);

  return {
    ...state,
    currentLevel: LEVELS[state.levelIndex],
    bestTotalTime: readBestTotalTime(),
    flipCard,
    restart,
    toggleSound,
  };
}
