import type { MoodId } from "@/features/moods/types";

/**
 * Game module contract.
 *
 * Each future mini-game lives in its own folder (e.g. src/games/bubble-shooter/)
 * and exposes a default-exported React component plus metadata.
 * The shell never imports a game directly — it goes through this registry,
 * which makes lazy-loading (React.lazy) a one-line change later.
 */
export interface GameMeta {
  id: string;
  title: string;
  mood: MoodId;
  /** Lazy loader added in Phase 1.5 when the first game lands. */
  // load: () => Promise<{ default: React.ComponentType }>;
}

/** Intentionally empty in Phase 1. Phase 1.5 will register the first game. */
export const GAMES: readonly GameMeta[] = [];

export function getGamesByMood(mood: MoodId): readonly GameMeta[] {
  return GAMES.filter((g) => g.mood === mood);
}
