/**
 * "Mood" is the internal name — the player-facing word is ENERGY STATE.
 * Each state owns a full themed atmosphere (gradient + neon accent + glow).
 *
 * Add a new state = add an id here + an entry in data.ts. Nothing else changes.
 */
export type MoodId =
  | "chill-zone"
  | "brain-melt"
  | "blast-off"
  | "zen-arcade"
  | "pixel-panic";

export interface Mood {
  id: MoodId;
  /** Punchy, game-like label. */
  label: string;
  /** One short playful line shown on the card. */
  tagline: string;
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
}
