import { Link } from "@tanstack/react-router";
import { Waves, Brain, Flame, Sparkles, Zap, type LucideIcon } from "lucide-react";
import type { Mood } from "./types";

const ICONS: Record<Mood["icon"], LucideIcon> = {
  Waves,
  Brain,
  Flame,
  Sparkles,
  Zap,
};

interface MoodCardProps {
  mood: Mood;
  /** Stagger index for entrance animation. */
  index?: number;
}

/**
 * Visual-first tappable mood tile.
 * Intentionally minimal text — atmosphere does the talking.
 */
export function MoodCard({ mood, index = 0 }: MoodCardProps) {
  const Icon = ICONS[mood.icon];

  return (
    <Link
      to="/mood/$moodId"
      params={{ moodId: mood.id }}
      aria-label={`${mood.label} — ${mood.description}`}
      className={[
        "group relative block aspect-square w-full overflow-hidden rounded-[28px]",
        "bg-gradient-to-br shadow-[0_8px_24px_-12px_rgba(0,0,0,0.18)]",
        "ring-1 ring-black/[0.04]",
        "transition-transform duration-300 ease-out",
        "active:scale-[0.96] hover:-translate-y-0.5",
        "mood-enter",
        mood.gradient,
      ].join(" ")}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* soft sheen */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_20%_0%,rgba(255,255,255,0.55),transparent_60%)]" />

      <div className={["relative flex h-full w-full flex-col justify-between p-5", mood.foreground].join(" ")}>
        <Icon
          className="h-9 w-9 transition-transform duration-500 ease-out group-hover:scale-110 group-active:scale-95"
          strokeWidth={1.75}
        />
        <span className="text-lg font-medium tracking-tight">{mood.label}</span>
      </div>
    </Link>
  );
}
