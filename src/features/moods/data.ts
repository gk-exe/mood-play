import type { Mood } from "./types";

/**
 * Single source of truth for moods.
 * Add a new mood = add an entry here. No other file needs to change.
 */
export const MOODS: readonly Mood[] = [
  {
    id: "relax",
    label: "Relax",
    description: "Calm, soft, gentle games to unwind.",
    gradient: "from-[#bfe3d4] via-[#d8efe4] to-[#eaf6ef]",
    foreground: "text-emerald-900/80",
    icon: "Waves",
  },
  {
    id: "focus",
    label: "Focus",
    description: "Puzzles and logic to sharpen your mind.",
    gradient: "from-[#c8d4f5] via-[#dde4f8] to-[#eef1fb]",
    foreground: "text-indigo-900/80",
    icon: "Brain",
  },
  {
    id: "thrill",
    label: "Thrill",
    description: "Fast, energetic, adrenaline-filled action.",
    gradient: "from-[#f7c4b4] via-[#f8d4c4] to-[#fbe6dc]",
    foreground: "text-rose-900/80",
    icon: "Flame",
  },
  {
    id: "satisfaction",
    label: "Satisfy",
    description: "Sorting, slicing, satisfying tactile play.",
    gradient: "from-[#e3d1f3] via-[#ecdef6] to-[#f4ecfb]",
    foreground: "text-violet-900/80",
    icon: "Sparkles",
  },
  {
    id: "quick-fun",
    label: "Quick",
    description: "Tiny bursts of instant fun.",
    gradient: "from-[#fce5b0] via-[#fdeec7] to-[#fef6e0]",
    foreground: "text-amber-900/80",
    icon: "Zap",
  },
] as const;

export function getMood(id: string): Mood | undefined {
  return MOODS.find((m) => m.id === id);
}
