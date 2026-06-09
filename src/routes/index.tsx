import { Link, createFileRoute } from "@tanstack/react-router";
import { Lightbulb, Map, Info } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MOODS } from "@/features/moods/data";
import { MoodCard } from "@/features/moods/MoodCard";
import { GAMES, getGameById } from "@/games/registry";
import { HomeHero } from "@/components/home/HomeHero";
import { ContinuePlayingRow } from "@/components/home/ContinuePlayingRow";
import { ComingSoonRail } from "@/components/home/ComingSoonRail";
import { useRecentlyPlayed } from "@/features/player/useGameStats";

export const Route = createFileRoute("/")({
  component: Home,
});

const LIVE_GAMES = GAMES.filter((g) => g.status === "live");
const SOON_GAMES = GAMES.filter((g) => g.status === "coming-soon");

function pickHero() {
  // Rotate hero across live games by day so the home feels alive on return.
  if (!LIVE_GAMES.length) return null;
  const dayIdx = Math.floor(Date.now() / 86_400_000) % LIVE_GAMES.length;
  return LIVE_GAMES[dayIdx];
}

function Home() {
  const recentIds = useRecentlyPlayed(6);
  const recent = recentIds
    .map((id) => getGameById(id))
    .filter((g): g is NonNullable<ReturnType<typeof getGameById>> => !!g && g.status === "live");
  const hero = pickHero();

  return (
    <AppShell>
      <div className="relative min-h-[100dvh] bg-hub">
        <header className="relative px-6 pt-12 pb-2">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 hub-pulse" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
                Vibe Games
              </span>
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
              {LIVE_GAMES.length} live · {SOON_GAMES.length} brewing
            </span>
          </div>

          <h1 className="mt-5 text-[2.1rem] font-bold leading-[1.05] tracking-tight text-white">
            Pick a vibe.{" "}
            <span className="bg-gradient-to-r from-fuchsia-300 via-cyan-300 to-amber-300 bg-clip-text text-transparent">
              Press play.
            </span>
          </h1>
          <p className="mt-2 text-sm text-white/60">
            A pocket arcade tuned to whatever mood you're in.
          </p>
        </header>

        <main className="relative flex-1 space-y-8 px-5 pb-14 pt-6">
          {hero ? <HomeHero game={hero} /> : null}

          {recent.length > 0 ? <ContinuePlayingRow games={recent} /> : null}

          <section aria-label="Browse by mood">
            <div className="mb-3 flex items-end justify-between px-1">
              <h2 className="text-sm font-bold uppercase tracking-[0.22em] text-white/70">
                Browse by mood
              </h2>
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
                {MOODS.length} vibes
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {MOODS.map((mood, i) => (
                <MoodCard key={mood.id} mood={mood} index={i} />
              ))}
            </div>
          </section>

          <ComingSoonRail games={SOON_GAMES} />

          <p className="pt-2 text-center text-[11px] uppercase tracking-[0.22em] text-white/30">
            built for one-handed play · no accounts · no ads
          </p>
        </main>
      </div>
    </AppShell>
  );
}
