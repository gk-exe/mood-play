import { useCallback, useEffect, useRef, useState } from "react";

import { Sfx } from "@/games/_shared";
import { BEST_KEY, SWIPE_THRESHOLD } from "../constants";
import type { Direction, GamePhase, Tile } from "../types";
import { createBoard, highestTile, isGameOver, move, spawnTile } from "../utils/board";

/**
 * 2048 game state.
 *
 * DOM/React driven (no canvas): the board is 16 cells max, so re-rendering on
 * each move is far cheaper than a RAF loop and gives us free CSS transitions.
 */
export function use2048() {
  const [tiles, setTiles] = useState<Tile[]>(() => createBoard());
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [combo, setCombo] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  /** Set once the player chose to keep playing past 2048. */
  const keptPlaying = useRef(false);
  const phaseRef = useRef<GamePhase>("intro");
  phaseRef.current = phase;

  // Load best score + reveal the board.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(BEST_KEY);
      const n = raw ? Number(raw) : 0;
      if (Number.isFinite(n)) setBest(n);
    } catch {
      /* noop */
    }
    const id = window.setTimeout(() => setPhase("playing"), 620);
    return () => window.clearTimeout(id);
  }, []);

  const persistBest = useCallback((value: number) => {
    setBest((prev) => {
      if (value <= prev) return prev;
      try {
        localStorage.setItem(BEST_KEY, String(value));
      } catch {
        /* noop */
      }
      return value;
    });
  }, []);

  const doMove = useCallback(
    (dir: Direction) => {
      if (phaseRef.current !== "playing") return;
      setTiles((prev) => {
        const res = move(prev, dir);
        if (!res.moved) {
          Sfx.play("deny");
          return prev;
        }

        const next = spawnTile(res.tiles);
        if (res.gained > 0) {
          Sfx.play(res.gained >= 64 ? "combo" : "clear");
          Sfx.haptic(res.gained >= 64 ? 14 : 8);
          setCombo((c) => c + 1);
        } else {
          Sfx.play("place");
          Sfx.haptic(5);
          setCombo(0);
        }

        setScore((s) => {
          const total = s + res.gained;
          persistBest(total);
          return total;
        });

        if (res.reachedTarget && !keptPlaying.current) {
          setPhase("won");
        } else if (isGameOver(next)) {
          Sfx.play("gameover");
          setPhase("lost");
        }
        return next;
      });
    },
    [persistBest],
  );

  const restart = useCallback(() => {
    keptPlaying.current = false;
    setTiles(createBoard());
    setScore(0);
    setCombo(0);
    setPhase("playing");
    Sfx.play("tap");
  }, []);

  const keepPlaying = useCallback(() => {
    keptPlaying.current = true;
    setPhase("playing");
    Sfx.play("tap");
  }, []);

  const toggleSound = useCallback(() => {
    setSoundOn((v) => {
      Sfx.setEnabled(!v);
      return !v;
    });
  }, []);

  // Keyboard controls (desktop).
  useEffect(() => {
    const KEYS: Record<string, Direction> = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
      w: "up",
      s: "down",
      a: "left",
      d: "right",
    };
    const onKey = (e: KeyboardEvent) => {
      const dir = KEYS[e.key];
      if (!dir) return;
      e.preventDefault();
      doMove(dir);
    };
    window.addEventListener("keydown", onKey, { passive: false });
    return () => window.removeEventListener("keydown", onKey);
  }, [doMove]);

  // Touch swipe controls (mobile).
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    swipeStart.current = { x: e.clientX, y: e.clientY };
  }, []);
  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const start = swipeStart.current;
      swipeStart.current = null;
      if (!start) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD) return;
      if (Math.abs(dx) > Math.abs(dy)) doMove(dx > 0 ? "right" : "left");
      else doMove(dy > 0 ? "down" : "up");
    },
    [doMove],
  );

  return {
    tiles,
    score,
    best,
    phase,
    combo,
    soundOn,
    highest: highestTile(tiles),
    isNewBest: score > 0 && score >= best,
    doMove,
    restart,
    keepPlaying,
    toggleSound,
    onPointerDown,
    onPointerUp,
  };
}
