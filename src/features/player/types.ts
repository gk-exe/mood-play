/**
 * PLAYER DATA MODELS — type-only architecture scaffold.
 *
 * No backend, no storage adapter, no React state. These interfaces describe
 * the shape future persistence layers (Lovable Cloud, local storage, sync
 * service) must implement. Treat as a contract, not an implementation.
 */

import type { MoodId } from "@/features/moods/types";

export interface PlayerProfile {
  id: string;
  displayName: string;
  avatarUrl?: string;
  /** Local-only until accounts exist. */
  createdAt: string;
  preferredMoodId?: MoodId;
  /** Opaque settings id pointing at a Settings record. */
  settingsId?: string;
}

export interface GameStats {
  gameId: string;
  totalPlays: number;
  totalScore: number;
  bestScore: number;
  bestCombo: number;
  totalPlayTimeMs: number;
  lastPlayedAt?: string;
}

export interface HighScore {
  gameId: string;
  /** Per-game mode key (e.g. "easy", "chain"). */
  modeId: string;
  score: number;
  combo?: number;
  achievedAt: string;
}

export interface Achievement {
  id: string;
  gameId?: string;
  title: string;
  description: string;
  iconKey: string;
  /** Hidden achievements are not shown until unlocked. */
  hidden?: boolean;
}

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: string;
}

export interface Reward {
  id: string;
  title: string;
  /** Type drives client-side behavior — keep open-ended. */
  type: "currency" | "theme" | "avatar" | "cosmetic";
  amount?: number;
  themeId?: string;
  unlockableId?: string;
}

export interface Unlockable {
  id: string;
  title: string;
  category: "theme" | "avatar" | "soundpack" | "cosmetic";
  unlockedBy:
    | { kind: "achievement"; achievementId: string }
    | { kind: "score"; gameId: string; minScore: number }
    | { kind: "currency"; amount: number };
}

export interface ThemeRef {
  themeId: string;
  /** Whether the player owns / has unlocked the theme. */
  owned: boolean;
}

export interface Settings {
  id: string;
  audioEnabled: boolean;
  hapticsEnabled: boolean;
  reducedMotion: boolean;
  themeId: string;
  /** Two-letter language code, reserved for future i18n. */
  locale?: string;
}

export interface PlayHistoryEntry {
  id: string;
  gameId: string;
  modeId: string;
  startedAt: string;
  endedAt: string;
  score: number;
  combo: number;
  outcome: "completed" | "abandoned" | "game-over";
}
