/**
 * Platform components — reusable building blocks every game and shell page
 * composes from. Future games MUST reach for these instead of forking
 * custom variants. See docs/GAME_MODULE_STANDARD.md for the full standard.
 */
export { GameCard } from "./GameCard";
export { FeaturedGameCard } from "./FeaturedGameCard";
export { GameHero } from "./GameHero";
export { GameOverlay } from "./GameOverlay";
export { ResultModal } from "./ResultModal";
export type { ResultModalProps } from "./ResultModal";
export { ComingSoon } from "./ComingSoon";
export { EmptyState } from "./EmptyState";
export { LoadingState } from "./LoadingState";
export { ErrorState } from "./ErrorState";
export { FeedbackBar } from "./FeedbackBar";
// Game-side HUD primitives live alongside the engine internals; re-export
// here for shell-level discoverability.
export { CornerChip, IconButton, StatTile, PrimaryCTA, GhostButton } from "@/games/_shared/ArcadeHUD";
