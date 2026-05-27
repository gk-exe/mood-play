/**
 * Mood domain types.
 * Kept tiny on purpose — extend only when a feature actually needs more.
 */
export type MoodId = "relax" | "focus" | "thrill" | "satisfaction" | "quick-fun";

export interface Mood {
  id: MoodId;
  /** Short word shown under the card. One word ideally. */
  label: string;
  /** Used only by assistive tech / SEO, never as primary visual. */
  description: string;
  /** Tailwind gradient classes — drives the entire visual identity of the card. */
  gradient: string;
  /** Foreground tint used for the icon + label on the card. */
  foreground: string;
  /** Lucide icon name (resolved in MoodCard to keep this file pure data). */
  icon:
    | "Waves"
    | "Brain"
    | "Flame"
    | "Sparkles"
    | "Zap";
}
