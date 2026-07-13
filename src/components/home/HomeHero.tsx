import { Link } from "@tanstack/react-router";
import { Play, Sparkles } from "lucide-react";
import type { GameMeta } from "@/games/registry";
import { getMood } from "@/features/moods/data";

/**
 * Home hero — the first thing a new user sees.
 * Anchors the brand and surfaces one "play right now" call to action.
 */
export function HomeHero({ game }: { game: GameMeta }) {
  const mood = getMood(game.moodCategory);
  const accent = mood?.accent ?? "#e879f9";

  return (
    <Link
      to="/play/$gameId"
      params={{ gameId: game.id }}
      className={`group relative block overflow-hidden rounded-[28px] bg-gradient-to-br p-6 ring-1 ring-white/10 transition active:scale-[0.985] ${mood?.gradient ?? ""}`}
      style={{ boxShadow: `0 30px 60px -28px ${accent}` }}
    >
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-70 blur-3xl"
        style={{ background: accent }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_70%_at_10%_0%,rgba(255,255,255,0.22),transparent_55%)]" />

      <div className="relative">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-1 ring-1 ring-white/15 backdrop-blur">
          <Sparkles className="h-3 w-3 text-white" />
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/90">
            Featured today
          </span>
        </div>

        <h2 className="mt-4 text-[2rem] font-bold leading-[1.05] tracking-tight text-white">
          {game.title}
        </h2>
        <p className="mt-1 max-w-xs text-sm text-white/80">
          {game.shortDescription}
        </p>

        <div className="mt-5 flex items-center gap-3">
          <span
            className="inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-bold text-black transition group-hover:scale-105"
            style={{ background: accent, boxShadow: `0 0 28px ${accent}` }}
          >
            <Play className="h-4 w-4 fill-current" /> Play now
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
            {game.estimatedPlayTime}m · {game.difficulty}
          </span>
        </div>
      </div>
    </Link>
  );
}
