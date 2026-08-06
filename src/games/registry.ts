import { lazy, type ComponentType, type LazyExoticComponent } from "react";

import type { MoodId } from "@/features/moods/types";

/**
 * GAME MODULE CONTRACT
 *
 * Every mini-game in the platform is described by a single entry below.
 * The shell never imports a game directly — routing, mood pages and the
 * dev docs all resolve through this registry.
 *
 * Adding a new game = 1 registry entry + 1 module folder under src/games/.
 * No other file in the project needs to change.
 */

export type GameStatus = "live" | "beta" | "coming-soon";

export type GameDifficulty = "easy" | "medium" | "hard" | "variable";

export interface GameMeta {
  /** Stable id — used in URLs, storage keys, analytics. */
  id: string;
  /** URL-safe slug (currently identical to id; kept distinct for future i18n). */
  slug: string;
  /** Player-facing title. */
  title: string;
  /** One-line vibe shown on cards / mood pages. */
  shortDescription: string;
  /** Mood category this game belongs to. */
  moodCategory: MoodId;
  /** Difficulty hint shown on cards. */
  difficulty: GameDifficulty;
  /** Optional thumbnail asset url. */
  thumbnail?: string;
  /** Current lifecycle state. */
  status: GameStatus;
  /** Convenience flag — true when status === "coming-soon". */
  comingSoon: boolean;
  /** Rough session length in minutes (used for filtering / surfacing). */
  estimatedPlayTime: number;
  /** Code-split entry. `null` for coming-soon games — router falls back. */
  componentLoader: LazyExoticComponent<ComponentType> | null;
}

/** Internal helper to keep the registry table compact. */
function game(
  meta: Omit<GameMeta, "slug" | "comingSoon"> & { slug?: string },
): GameMeta {
  return {
    ...meta,
    slug: meta.slug ?? meta.id,
    comingSoon: meta.status === "coming-soon",
  };
}

export const GAMES: readonly GameMeta[] = [
  game({
    id: "bubble-shooter",
    title: "Bubble Shooter",
    shortDescription: "Pop, chain, ride the streak.",
    moodCategory: "chill-zone",
    difficulty: "easy",
    status: "live",
    estimatedPlayTime: 5,
    componentLoader: lazy(() => import("./bubble-shooter")),
  }),
  game({
    id: "block-puzzle",
    title: "Block Puzzle",
    shortDescription: "Drop, fit, clear. Just one more.",
    moodCategory: "brain-boost",
    difficulty: "medium",
    status: "live",
    estimatedPlayTime: 8,
    componentLoader: lazy(() => import("./block-puzzle")),
  }),
  game({
    id: "zombie-survival",
    title: "Zombie Survival",
    shortDescription: "Hold the line. Outlast the horde.",
    moodCategory: "action-rush",
    difficulty: "hard",
    status: "live",
    estimatedPlayTime: 5,
    componentLoader: lazy(() => import("./zombie-survival")),
  }),
  game({
    id: "endless-runner",
    title: "Endless Runner",
    shortDescription: "One tap. No brakes.",
    moodCategory: "action-rush",
    difficulty: "medium",
    status: "coming-soon",
    estimatedPlayTime: 4,
    componentLoader: null,
  }),
  game({
    id: "chess",
    title: "Chess",
    shortDescription: "Slow burn. Smart moves.",
    moodCategory: "brain-boost",
    difficulty: "variable",
    status: "coming-soon",
    estimatedPlayTime: 15,
    componentLoader: null,
  }),
  game({
    id: "sorting-master",
    title: "Sorting Master",
    shortDescription: "Bring order. Feel the click.",
    moodCategory: "satisfaction-lab",
    difficulty: "easy",
    status: "coming-soon",
    estimatedPlayTime: 6,
    componentLoader: null,
  }),
  game({
    id: "tap-reflex",
    title: "Tap Reflex",
    shortDescription: "Blink. Tap. Survive.",
    moodCategory: "quick-hits",
    difficulty: "medium",
    status: "live",
    estimatedPlayTime: 2,
    componentLoader: lazy(() => import("./tap-reflex")),
  }),
  game({
    id: "memory-match",
    title: "Memory Match",
    shortDescription: "See it. Hold it. Match it.",
    moodCategory: "brain-boost",
    difficulty: "easy",
    status: "live",
    estimatedPlayTime: 5,
    componentLoader: lazy(() => import("./memory-match")),
  }),
  game({
    id: "word-puzzle",
    title: "Word Puzzle",
    shortDescription: "Letters in. Words out.",
    moodCategory: "satisfaction-lab",
    difficulty: "medium",
    status: "coming-soon",
    estimatedPlayTime: 7,
    componentLoader: null,
  }),
  game({
    id: "twenty48",
    slug: "2048",
    title: "2048",
    shortDescription: "Slide, merge, chase the big tile.",
    moodCategory: "satisfaction-lab",
    difficulty: "medium",
    status: "live",
    estimatedPlayTime: 6,
    componentLoader: lazy(() => import("./twenty48")),
  }),
  game({
    id: "reaction-challenge",
    title: "Reaction Challenge",
    shortDescription: "Pure speed. No second chances.",
    moodCategory: "quick-hits",
    difficulty: "hard",
    status: "coming-soon",
    estimatedPlayTime: 2,
    componentLoader: null,
  }),

] as const;

export function getGamesByMood(mood: MoodId): readonly GameMeta[] {
  return GAMES.filter((g) => g.moodCategory === mood);
}

export function getLiveGamesByMood(mood: MoodId): readonly GameMeta[] {
  return GAMES.filter((g) => g.moodCategory === mood && g.status !== "coming-soon");
}

export function getGameById(id: string): GameMeta | undefined {
  return GAMES.find((g) => g.id === id || g.slug === id);
}

export function getFeaturedGame(mood: MoodId): GameMeta | undefined {
  // Falls back to first live game in the mood when no explicit feature is set.
  return (
    GAMES.find((g) => g.moodCategory === mood && g.status === "live") ??
    GAMES.find((g) => g.moodCategory === mood)
  );
}
