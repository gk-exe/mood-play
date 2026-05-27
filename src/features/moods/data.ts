import type { Mood } from "./types";

/**
 * Single source of truth for ENERGY STATES.
 * Each one has its own atmosphere — never reuse a palette across states.
 */
export const MOODS: readonly Mood[] = [
  {
    id: "chill-zone",
    label: "Chill Zone",
    tagline: "Slow it down. Float a while.",
    gradient: "from-[#0b3a5e] via-[#1467a4] to-[#22d3ee]",
    foreground: "text-cyan-50",
    accent: "#22d3ee",
    icon: "Waves",
  },
  {
    id: "brain-melt",
    label: "Brain Melt",
    tagline: "Puzzles that bite back.",
    gradient: "from-[#3b2a00] via-[#a16207] to-[#facc15]",
    foreground: "text-amber-50",
    accent: "#facc15",
    icon: "Brain",
  },
  {
    id: "blast-off",
    label: "Blast Off",
    tagline: "Adrenaline, served loud.",
    gradient: "from-[#1a0040] via-[#6d28d9] to-[#e879f9]",
    foreground: "text-fuchsia-50",
    accent: "#e879f9",
    icon: "Rocket",
  },
  {
    id: "zen-arcade",
    label: "Zen Arcade",
    tagline: "Satisfying. Tactile. Endless.",
    gradient: "from-[#082f1f] via-[#0e7a4f] to-[#5eead4]",
    foreground: "text-emerald-50",
    accent: "#5eead4",
    icon: "Sparkles",
  },
  {
    id: "pixel-panic",
    label: "Pixel Panic",
    tagline: "60 seconds of pure chaos.",
    gradient: "from-[#3a0a0a] via-[#dc2626] to-[#fb923c]",
    foreground: "text-orange-50",
    accent: "#fb923c",
    icon: "Zap",
  },
] as const;

export function getMood(id: string): Mood | undefined {
  return MOODS.find((m) => m.id === id);
}
