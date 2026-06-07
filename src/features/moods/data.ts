import type { Mood } from "./types";

/**
 * Single source of truth for MOOD CATEGORIES.
 * Each one owns a full themed atmosphere — never reuse a palette across moods.
 */
export const MOODS: readonly Mood[] = [
  {
    id: "chill-zone",
    label: "Chill Zone",
    tagline: "Soft taps. Slow breaths.",
    description: "Easy-going games that melt the edges off a long day.",
    gradient: "from-[#0b3a5e] via-[#1467a4] to-[#22d3ee]",
    foreground: "text-cyan-50",
    accent: "#22d3ee",
    icon: "Waves",
    featuredGameId: "bubble-shooter",
  },
  {
    id: "brain-boost",
    label: "Brain Boost",
    tagline: "One more move. Promise.",
    description: "Puzzles and patterns for when you want to feel sharp.",
    gradient: "from-[#3b2a00] via-[#a16207] to-[#facc15]",
    foreground: "text-amber-50",
    accent: "#facc15",
    icon: "Brain",
    featuredGameId: "block-puzzle",
  },
  {
    id: "action-rush",
    label: "Action Rush",
    tagline: "Heart-rate, but make it fun.",
    description: "Fast hands, loud feedback, big moments.",
    gradient: "from-[#1a0040] via-[#6d28d9] to-[#e879f9]",
    foreground: "text-fuchsia-50",
    accent: "#e879f9",
    icon: "Rocket",
  },
  {
    id: "satisfaction-lab",
    label: "Satisfaction Lab",
    tagline: "Click. Snap. Aaaah.",
    description: "Sort, stack, organize. Tiny rewards on a loop.",
    gradient: "from-[#082f1f] via-[#0e7a4f] to-[#5eead4]",
    foreground: "text-emerald-50",
    accent: "#5eead4",
    icon: "Sparkles",
  },
  {
    id: "quick-hits",
    label: "Quick Hits",
    tagline: "A round before the kettle boils.",
    description: "60-second bursts. In, out, smile.",
    gradient: "from-[#3a0a0a] via-[#dc2626] to-[#fb923c]",
    foreground: "text-orange-50",
    accent: "#fb923c",
    icon: "Zap",
  },
] as const;

export function getMood(id: string): Mood | undefined {
  return MOODS.find((m) => m.id === id);
}
