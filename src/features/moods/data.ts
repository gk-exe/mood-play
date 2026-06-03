import type { Mood } from "./types";

/**
 * Single source of truth for MOOD CATEGORIES.
 * Each one owns a full themed atmosphere — never reuse a palette across moods.
 */
export const MOODS: readonly Mood[] = [
  {
    id: "chill-zone",
    label: "Chill Zone",
    tagline: "Slow it down. Float a while.",
    description: "Low-pressure, high-satisfaction games for winding down.",
    gradient: "from-[#0b3a5e] via-[#1467a4] to-[#22d3ee]",
    foreground: "text-cyan-50",
    accent: "#22d3ee",
    icon: "Waves",
    featuredGameId: "bubble-shooter",
  },
  {
    id: "brain-boost",
    label: "Brain Boost",
    tagline: "Sharpen up. Out-think it.",
    description: "Puzzle, logic and memory games that reward focus.",
    gradient: "from-[#3b2a00] via-[#a16207] to-[#facc15]",
    foreground: "text-amber-50",
    accent: "#facc15",
    icon: "Brain",
    featuredGameId: "block-puzzle",
  },
  {
    id: "action-rush",
    label: "Action Rush",
    tagline: "Adrenaline, served loud.",
    description: "Fast reflexes, survival pressure, big payoff moments.",
    gradient: "from-[#1a0040] via-[#6d28d9] to-[#e879f9]",
    foreground: "text-fuchsia-50",
    accent: "#e879f9",
    icon: "Rocket",
  },
  {
    id: "satisfaction-lab",
    label: "Satisfaction Lab",
    tagline: "Tactile. Tidy. Endless.",
    description: "Sorting, organizing and oddly-satisfying loop games.",
    gradient: "from-[#082f1f] via-[#0e7a4f] to-[#5eead4]",
    foreground: "text-emerald-50",
    accent: "#5eead4",
    icon: "Sparkles",
  },
  {
    id: "quick-hits",
    label: "Quick Hits",
    tagline: "60 seconds of pure chaos.",
    description: "Short, punchy sessions you can finish on a coffee break.",
    gradient: "from-[#3a0a0a] via-[#dc2626] to-[#fb923c]",
    foreground: "text-orange-50",
    accent: "#fb923c",
    icon: "Zap",
  },
] as const;

export function getMood(id: string): Mood | undefined {
  return MOODS.find((m) => m.id === id);
}
