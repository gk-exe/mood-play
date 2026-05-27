import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { MoodId } from "@/features/moods/types";

/**
 * Game module contract.
 *
 * Each mini-game lives in its own folder (e.g. src/games/bubble-shooter/)
 * and exposes a default-exported React component. The shell never imports
 * a game directly — it goes through this registry, which uses React.lazy
 * so each game ships as its own chunk and only loads when played.
 */
export interface GameMeta {
  id: string;
  title: string;
  /** One-line vibe used on the mood detail card. */
  tagline: string;
  mood: MoodId;
  /** Code-split entry. */
  Component: LazyExoticComponent<ComponentType>;
}

export const GAMES: readonly GameMeta[] = [
  {
    id: "bubble-shooter",
    title: "Bubble Shooter",
    tagline: "Pop, chain, ride the streak.",
    mood: "chill-zone",
    Component: lazy(() => import("./bubble-shooter")),
  },
] as const;

export function getGamesByMood(mood: MoodId): readonly GameMeta[] {
  return GAMES.filter((g) => g.mood === mood);
}

export function getGameById(id: string): GameMeta | undefined {
  return GAMES.find((g) => g.id === id);
}
