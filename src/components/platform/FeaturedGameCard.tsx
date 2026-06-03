import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import type { GameMeta } from "@/games/registry";
import { getMood } from "@/features/moods/data";

/**
 * Hero card for the featured game on a mood page.
 * Visually dominant — use only one per surface.
 */
export function FeaturedGameCard({ game }: { game: GameMeta }) {
  const mood = getMood(game.moodCategory);
  const accent = mood?.accent ?? "#a78bfa";

  return (
    <Link
      to="/play/$gameId"
      params={{ gameId: game.id }}
      className={`relative block overflow-hidden rounded-3xl bg-gradient-to-br p-6 ring-1 ring-white/10 transition active:scale-[0.985] ${mood?.gradient ?? ""}`}
      style={{ boxShadow: `0 20px 50px -20px ${accent}` }}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-60 blur-3xl"
        style={{ background: accent }}
      />
      <div className="relative">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-1 ring-1 ring-white/15 backdrop-blur">
          <Sparkles className="h-3 w-3 text-white" />
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/90">
            Featured
          </span>
        </div>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-white">{game.title}</h2>
        <p className="mt-1 max-w-sm text-sm text-white/80">{game.shortDescription}</p>
        <div className="mt-5 inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-bold text-black"
          style={{ background: accent, boxShadow: `0 0 24px ${accent}` }}
        >
          Play now
        </div>
      </div>
    </Link>
  );
}
