/**
 * Shared arcade game primitives.
 *
 * Every mini-game in the platform should compose its HUD and celebration
 * overlay from these pieces. Per-game theming is allowed (accent color,
 * icons, copy) — visual structure is not.
 */
export * from "./anim";
export * from "./ArcadeHUD";
export * from "./audio";
export { CelebrationOverlay } from "./CelebrationOverlay";

