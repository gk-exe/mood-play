import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import type { GameMeta } from "@/games/registry";
import { getMood } from "@/features/moods/data";
import { readBest } from "@/features/player/useGameStats";

interface Props {
  games: GameMeta[];
}

/**
 * Horizontal "Continue playing" rail.
 * Only renders when the user has actually launched a game before.
 */
export function ContinuePlayingRow({ games }: Props) {
  if (!games.length) return null;
  return (
    <section aria-label="Continue playing">
      <div className="mb-3 flex items-end justify-between px-1">
        <h2 className="text-sm font-bold uppercase tracking-[0.22em] text-white/70">
          Pick up where you left off
        </h2>
      </div>
      <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {games.map((g) => (
          <ContinueCard key={g.id} game={g} />
        ))}
      </div>
    </section>
  );
}

function ContinueCard({ game }: { game: GameMeta }) {
  const mood = getMood(game.moodCategory);
  const accent = mood?.accent ?? "#a78bfa";
  const best = readBest(game.id);

  return (
    <Link
      to="/play/$gameId"
      params={{ gameId: game.id }}
      className="group relative block w-[200px] shrink-0 snap-start overflow-hidden rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10 backdrop-blur transition active:scale-[0.97]"
      style={{ boxShadow: `0 10px 30px -18px ${accent}` }}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-50 blur-2xl"
        style={{ background: accent }}
      />
      <div className="relative flex h-full flex-col justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/50">
            {mood?.label ?? "Arcade"}
          </div>
          <div className="mt-1 text-base font-semibold tracking-tight text-white">
            {game.title}
          </div>
          {best != null ? (
            <div
              className="mt-2 inline-flex items-center rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em]"
              style={{ color: accent }}
            >
              Best · {best.toLocaleString()}
            </div>
          ) : (
            <div className="mt-2 text-[11px] text-white/45">Tap to resume</div>
          )}
        </div>
        <span
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-black"
          style={{ background: accent, boxShadow: `0 0 22px ${accent}` }}
        >
          <Play className="h-4 w-4 fill-current" />
        </span>
      </div>
    </Link>
  );
}
