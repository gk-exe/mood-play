/** Action Rush accent — matches the mood gradient in features/moods/data.ts. */
export const ACCENT = "#e879f9";
export const ACCENT_SECONDARY = "#a78bfa";
export const DANGER = "#fb7185";

export const STORAGE_KEY = "zombie-survival:best:v1";

/** Player turret. */
export const PLAYER_R = 16;
/** Enemy is lethal once it touches this ring. */
export const PLAYER_HIT_R = PLAYER_R + 6;

/** Shooting. */
export const FIRE_INTERVAL_MS = 135;
export const BULLET_SPEED = 620; // px / s
export const BULLET_LIFE_MS = 1600;
export const BULLET_R = 4;
export const BULLET_DAMAGE = 1;

/** Spawning / difficulty curve. */
export const SPAWN_START_MS = 900;
export const SPAWN_MIN_MS = 260;
/** How quickly spawn interval tightens (per second survived). */
export const SPAWN_RAMP = 0.985;
export const ENEMY_BASE_SPEED = 52; // px / s
export const ENEMY_SPEED_RAMP = 1.9; // px / s added per wave
export const WAVE_MS = 20_000;

/** Feedback tuning. */
export const STREAK_WINDOW_MS = 1400;
export const SHAKE_DECAY = 0.86;

export const ENEMY_TIERS = [
  { hp: 1, r: 13, color: "#f472b6", value: 10 },
  { hp: 2, r: 16, color: "#c084fc", value: 25 },
  { hp: 4, r: 20, color: "#818cf8", value: 60 },
] as const;

export function formatTime(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
