import { Link } from "@tanstack/react-router";
import {
  Waves,
  Brain,
  Rocket,
  Sparkles,
  Zap,
  Flame,
  Ghost,
  Skull,
  Gamepad2,
  type LucideIcon,
} from "lucide-react";
import type { Mood } from "./types";

const ICONS: Record<Mood["icon"], LucideIcon> = {
  Waves,
  Brain,
  Rocket,
  Sparkles,
  Zap,
  Flame,
  Ghost,
  Skull,
  Gamepad2,
};

interface MoodCardProps {
  mood: Mood;
  index?: number;
}

/**
 * Arcade-style energy card.
 * - Dark gradient base with a neon-tinted glow halo.
 * - Animated radial highlight that breathes.
 * - Press feedback + entrance stagger.
 */
export function MoodCard({ mood, index = 0 }: MoodCardProps) {
  const Icon = ICONS[mood.icon];

  return (
    <Link
      to="/mood/$moodId"
      params={{ moodId: mood.id }}
      aria-label={`${mood.label} — ${mood.tagline}`}
      className={[
        "group relative block aspect-[4/5] w-full overflow-hidden rounded-[28px]",
        "bg-gradient-to-br",
        "ring-1 ring-white/10",
        "transition-transform duration-300 ease-out",
        "active:scale-[0.96] hover:-translate-y-1",
        "mood-enter",
        mood.gradient,
      ].join(" ")}
      style={{
        animationDelay: `${index * 80}ms`,
        boxShadow: `0 18px 40px -18px ${mood.accent}80, 0 0 0 1px ${mood.accent}22 inset`,
      }}
    >
      {/* breathing neon halo */}
      <div
        className="pointer-events-none absolute -inset-[40%] opacity-70 mood-halo"
        style={{
          background: `radial-gradient(closest-side, ${mood.accent}55, transparent 70%)`,
        }}
      />
      {/* top sheen */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_70%_at_20%_-10%,rgba(255,255,255,0.35),transparent_55%)]" />
      {/* grain */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:3px_3px]" />

      <div
        className={[
          "relative flex h-full w-full flex-col justify-between p-5",
          mood.foreground,
        ].join(" ")}
      >
        <div
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/25 transition-transform duration-500 ease-out group-hover:scale-110 group-active:scale-95"
          style={{ boxShadow: `0 0 24px ${mood.accent}66` }}
        >
          <Icon className="h-5 w-5" strokeWidth={2.25} />
        </div>

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-70">
            Enter
          </div>
          <div className="mt-0.5 text-xl font-semibold tracking-tight">
            {mood.label}
          </div>
          <div className="mt-1 text-[12px] leading-snug opacity-80">
            {mood.tagline}
          </div>
        </div>
      </div>
    </Link>
  );
}
