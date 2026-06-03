/**
 * MOOD CATEGORIES — the five emotional entry points to the platform.
 *
 * These are the canonical discovery axes. Every game in the registry maps to
 * exactly one mood. Mood definitions live in data.ts and are fully
 * data-driven — adding a category = add an id here + an entry in data.ts.
 */
export type MoodId =
  | "chill-zone"
  | "brain-boost"
  | "action-rush"
  | "satisfaction-lab"
  | "quick-hits";

export interface Mood {
  id: MoodId;
  /** Punchy, game-like label shown on cards. */
  label: string;
  /** One short playful tagline (≤ 6 words). */
  tagline: string;
  /** Long-form description for mood detail / hero. */
  description: string;
  /** Background atmosphere — Tailwind gradient classes. */
  gradient: string;
  /** Foreground tint for icon + label. */
  foreground: string;
  /** Neon accent hex used for glow, ring, particles. */
  accent: string;
  /** Lucide icon name (resolved in MoodCard). */
  icon:
    | "Waves"
    | "Brain"
    | "Rocket"
    | "Sparkles"
    | "Zap"
    | "Flame"
    | "Ghost"
    | "Skull"
    | "Gamepad2";
  /** Optional id of the featured game shown on the mood hero. */
  featuredGameId?: string;
  /** Optional curated ordering — overrides registry order on mood pages. */
  recommendedGameIds?: readonly string[];
}
