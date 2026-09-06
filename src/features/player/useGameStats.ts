import { useCallback, useEffect, useState } from "react";

/**
 * Lightweight, local-only player stats.
 *
 * - No accounts, no cloud, no backend.
 * - One JSON blob in localStorage, keyed by gameId.
 * - Best scores are NOT owned here — each game keeps its own legacy key.
 *   `readBest(gameId)` is a small bridge that reads those legacy keys so the
 *   shell can surface a "Best: 12,340" pill without coupling to game internals.
 */

const STORAGE_KEY = "vg:stats:v1";

export interface GameStat {
  /** Total times this game has been launched. */
  plays: number;
  /** Last time it was launched (epoch ms). */
  lastPlayedAt: number;
}

export type StatsMap = Record<string, GameStat>;

function safeRead(): StatsMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as StatsMap) : {};
  } catch {
    return {};
  }
}

function safeWrite(next: StatsMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    // Same-tab listeners — `storage` only fires cross-tab.
    window.dispatchEvent(new CustomEvent("vg:stats:changed"));
  } catch {
    /* noop */
  }
}

/** Imperative — call once when a real game module mounts. */
export function recordPlay(gameId: string) {
  const map = safeRead();
  const prev = map[gameId];
  map[gameId] = {
    plays: (prev?.plays ?? 0) + 1,
    lastPlayedAt: Date.now(),
  };
  safeWrite(map);
}

/** Read a per-game best score from each game's legacy storage key. */
const BEST_KEY_MAP: Record<string, string> = {
  "bubble-shooter": "bubble-shooter:best:v2",
  "block-puzzle": "block-puzzle:best:v1",
  twenty48: "twenty48:best:v1",
  "survival-rush": "survival-rush:best:v1",
  "tap-reflex": "tap-reflex:best:v1",
  snake: "snake:best:v1",
  "sorting-master": "sorting-master:best:v1",


};


export function readBest(gameId: string): number | null {
  try {
    const key = BEST_KEY_MAP[gameId];
    if (!key) return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

/**
 * Live-updating snapshot of the stats blob (works across tabs and in-tab).
 * Starts empty so SSR and the first client render agree, then hydrates
 * from localStorage after mount.
 */
export function useGameStats(): StatsMap {
  const [state, setState] = useState<StatsMap>({});

  useEffect(() => {
    const refresh = () => setState(safeRead());
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("vg:stats:changed", refresh as EventListener);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("vg:stats:changed", refresh as EventListener);
    };
  }, []);

  return state;
}


/** Convenience: ids ordered by most-recently-played, capped. */
export function useRecentlyPlayed(limit = 4): string[] {
  const stats = useGameStats();
  return Object.entries(stats)
    .filter(([, s]) => s?.lastPlayedAt)
    .sort((a, b) => b[1].lastPlayedAt - a[1].lastPlayedAt)
    .slice(0, limit)
    .map(([id]) => id);
}

/** Stable callback to record a play. Useful inside route components. */
export function useRecordPlay() {
  return useCallback((gameId: string) => recordPlay(gameId), []);
}
