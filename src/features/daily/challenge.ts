import { useEffect, useState } from "react";
import { GAMES, type GameMeta } from "@/games/registry";

/**
 * Daily Challenge — local-only, deterministic per calendar day.
 *
 * - No backend. No accounts. Pure date-seeded pick from the live game pool.
 * - Tracks `started` / `completed` for *today* in localStorage so the home
 *   card can celebrate a return visit.
 * - The pick rotates every day at the user's local midnight, so the app
 *   feels alive on each return ("Come back tomorrow for something new").
 */

const STORAGE_KEY = "vg:daily:v1";

export interface DailyChallenge {
  /** YYYY-MM-DD in local time — the seed. */
  date: string;
  game: GameMeta;
  /** Player-facing goal label, e.g. "Clear 8 lines". */
  goal: string;
  /** Short emotional tag for the card eyebrow. */
  tag: string;
}

interface DailyStatusRecord {
  date: string;
  started: boolean;
  completed: boolean;
}

interface ChallengeTemplate {
  gameId: string;
  goal: string;
  tag: string;
}

/**
 * A small, hand-tuned pool. We bias toward live games so the challenge is
 * always playable; coming-soon games are filtered at pick time.
 */
const TEMPLATES: ChallengeTemplate[] = [
  { gameId: "memory-match", goal: "Finish all 3 levels", tag: "Memory marathon" },
  { gameId: "memory-match", goal: "Build a 4-match streak", tag: "Sharp eyes" },
  { gameId: "bubble-shooter", goal: "Score 500+ in one run", tag: "Pop master" },
  { gameId: "bubble-shooter", goal: "Land a 5-bubble combo", tag: "Chain reaction" },
  { gameId: "block-puzzle", goal: "Clear 5 lines in one run", tag: "Clean sweep" },
  { gameId: "block-puzzle", goal: "Reach a 3x combo", tag: "Stack & smash" },
];

function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Tiny string hash so we get a stable per-day index. */
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function getTodayChallenge(now = new Date()): DailyChallenge | null {
  const date = todayKey(now);
  const liveIds = new Set(GAMES.filter((g) => g.status === "live").map((g) => g.id));
  const pool = TEMPLATES.filter((t) => liveIds.has(t.gameId));
  if (pool.length === 0) return null;

  const pick = pool[hash(date) % pool.length];
  const game = GAMES.find((g) => g.id === pick.gameId);
  if (!game) return null;

  return { date, game, goal: pick.goal, tag: pick.tag };
}

function safeReadStatus(): DailyStatusRecord | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as DailyStatusRecord;
  } catch {
    return null;
  }
}

function safeWriteStatus(next: DailyStatusRecord) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("vg:daily:changed"));
  } catch {
    /* noop */
  }
}

/** Snapshot of today's status — auto-resets when the date rolls over. */
export function getDailyStatus(): { started: boolean; completed: boolean } {
  const date = todayKey();
  const rec = safeReadStatus();
  if (!rec || rec.date !== date) return { started: false, completed: false };
  return { started: !!rec.started, completed: !!rec.completed };
}

export function markDailyStarted() {
  const date = todayKey();
  const prev = safeReadStatus();
  const completed = prev?.date === date ? !!prev.completed : false;
  safeWriteStatus({ date, started: true, completed });
}

/** Games can call this from their win condition to flag completion. */
export function markDailyCompleted(gameId: string) {
  const today = getTodayChallenge();
  if (!today || today.game.id !== gameId) return;
  const date = todayKey();
  safeWriteStatus({ date, started: true, completed: true });
}

/** Live-updating status for the home card. */
export function useDailyStatus() {
  const [status, setStatus] = useState(() => getDailyStatus());
  useEffect(() => {
    const refresh = () => setStatus(getDailyStatus());
    window.addEventListener("storage", refresh);
    window.addEventListener("vg:daily:changed", refresh as EventListener);
    // Re-check when the tab regains focus (covers midnight rollover).
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("vg:daily:changed", refresh as EventListener);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  return status;
}

/** Milliseconds until the next local midnight — drives the countdown chip. */
export function msUntilTomorrow(now = new Date()): number {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next.getTime() - now.getTime();
}

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  return `${h}h ${m}m`;
}
