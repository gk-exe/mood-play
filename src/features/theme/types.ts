/**
 * THEME ENGINE — scaffold only.
 *
 * The runtime today still uses the global tokens in `src/styles.css`. This
 * module defines the contract a future theme switcher will satisfy. Adding
 * a theme = a `Theme` object registered in `THEMES` below.
 */

export type ThemeId = "default" | "arcade" | "dark" | "retro" | "seasonal";

export interface Theme {
  id: ThemeId;
  title: string;
  /** Marketing blurb shown in a future themes picker. */
  description: string;
  /** Hint for surface styling — drives gradient and chrome decisions. */
  surface: "light" | "dark" | "neon";
  /**
   * Token overrides applied as CSS variables on <html>. Keys map to existing
   * tokens in `src/styles.css` (e.g. "--background", "--primary").
   */
  tokens: Readonly<Record<string, string>>;
  /** Optional gating — locked themes require an unlockable. */
  locked?: boolean;
  unlockableId?: string;
}

export interface ThemeEngine {
  current: ThemeId;
  apply(id: ThemeId): void;
  list(): readonly Theme[];
}

export const THEMES: readonly Theme[] = [
  {
    id: "default",
    title: "Default",
    description: "The flagship arcade palette.",
    surface: "dark",
    tokens: {},
  },
  {
    id: "arcade",
    title: "Arcade",
    description: "Saturated neon, crisp contrast.",
    surface: "neon",
    tokens: {},
    locked: true,
  },
  {
    id: "dark",
    title: "Pure Dark",
    description: "Minimal chrome for long sessions.",
    surface: "dark",
    tokens: {},
  },
  {
    id: "retro",
    title: "Retro",
    description: "CRT phosphor + scanline accents.",
    surface: "dark",
    tokens: {},
    locked: true,
  },
  {
    id: "seasonal",
    title: "Seasonal",
    description: "Rotating limited-time palettes.",
    surface: "dark",
    tokens: {},
    locked: true,
  },
] as const;
