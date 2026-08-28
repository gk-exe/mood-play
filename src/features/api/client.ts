/**
 * Thin bridge to the PHP/MySQL backend (`backend/api/*.php`).
 *
 * Design rule: the backend is *additive*. Every feature keeps working with
 * localStorage alone, so the app stays fully playable when no PHP host is
 * configured (preview, offline, static hosting). When
 * `VITE_API_BASE_URL` is set, submissions are also persisted server-side.
 */

const BASE = (import.meta.env["VITE_API_BASE_URL"] as string | undefined)?.replace(
  /\/$/,
  "",
);

export function apiEnabled(): boolean {
  return Boolean(BASE);
}

async function post<T>(path: string, body: unknown): Promise<T | null> {
  if (!BASE) return null;
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    // Network/host unavailable — local storage already holds the data.
    return null;
  }
}

async function get<T>(path: string): Promise<T | null> {
  if (!BASE) return null;
  try {
    const res = await fetch(`${BASE}${path}`);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export interface ApiOk {
  ok: boolean;
  id?: number;
}

/** "Suggest a game" form → game_requests table. */
export function submitGameRequest(input: {
  title: string;
  description: string;
  category: string;
}) {
  return post<ApiOk>("/game-requests.php", input);
}

/** Reaction / bug report → feedback table. */
export function submitFeedback(input: {
  type: "love" | "meh" | "issue";
  message?: string;
  game_id: string;
}) {
  return post<ApiOk>("/feedback.php", {
    type: input.type,
    message: input.message ?? "",
    game_id: input.game_id,
  });
}

/** Personal best → scores table (anonymous by default). */
export function submitScore(input: {
  game_id: string;
  score: number;
  player_name?: string;
}) {
  return post<ApiOk>("/scores.php", input);
}

export interface LeaderboardRow {
  id: number;
  game_id: string;
  player_name: string;
  score: number;
  created_at: string;
}

export function fetchLeaderboard(gameId: string, limit = 10) {
  return get<{ ok: boolean; scores: LeaderboardRow[] }>(
    `/scores.php?game_id=${encodeURIComponent(gameId)}&limit=${limit}`,
  );
}
