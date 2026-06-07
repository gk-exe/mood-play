import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import type { GameMeta } from "@/games/registry";
import { getMood } from "@/features/moods/data";

interface Props {
  games: readonly GameMeta[];
}

/**
 * "In the lab" — horizontal teaser rail for upcoming games.
 * Makes the platform feel larger than its current live content.
 */
export function ComingSoonRail({ games }: Props) {
  if (!games.length) return null;
  return (
    <section aria-label="In the lab">
      <div className="mb-3 flex items-end justify-between px-1">
        <h2 className="text-sm font-bold uppercase tracking-[0.22em] text-white/70">
          In the lab
        </h2>
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
          {games.length} dropping soon
        </span>
      </div>
      <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {games.map((g) => (
          <TeaserCard key={g.id} game={g} />
        ))}
      </div>
    </section>
  );
}

function TeaserCard({ game }: { game: GameMeta }) {
  const mood = getMood(game.moodCategory);
  const accent = mood?.accent ?? "#a78bfa";
  return (
    <Link
      to="/play/$gameId"
      params={{ gameId: game.id }}
      className="group relative block w-[180px] shrink-0 snap-start overflow-hidden rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10 backdrop-blur transition active:scale-[0.97]"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(70% 50% at 50% 0%, ${accent}33, transparent 70%)`,
        }}
      />
      <div className="relative flex h-full flex-col gap-3">
        <span
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl ring-1 ring-white/15"
          style={{ background: `${accent}22`, color: accent }}
        >
          <Lock className="h-4 w-4" />
        </span>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
            {mood?.label ?? "Coming soon"}
          </div>
          <div className="mt-1 text-sm font-semibold tracking-tight text-white">
            {game.title}
          </div>
          <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-white/55">
            {game.shortDescription}
          </p>
        </div>
        <span
          className="mt-auto inline-flex w-fit items-center rounded-full bg-white/8 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.22em] text-white/65"
        >
          Soon
        </span>
      </div>
    </Link>
  );
}
