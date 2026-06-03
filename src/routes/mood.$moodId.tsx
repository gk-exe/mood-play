import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { getMood } from "@/features/moods/data";
import { getGamesByMood, getFeaturedGame } from "@/games/registry";
import { FeaturedGameCard, GameCard, EmptyState } from "@/components/platform";

export const Route = createFileRoute("/mood/$moodId")({
  component: MoodDetail,
  loader: ({ params }) => {
    const mood = getMood(params.moodId);
    if (!mood) throw notFound();
    return { mood };
  },
});

function MoodDetail() {
  const { mood } = Route.useLoaderData();
  const games = getGamesByMood(mood.id);
  const featured = getFeaturedGame(mood.id);
  const rest = games.filter((g) => g.id !== featured?.id);

  return (
    <AppShell>
      <div className="relative min-h-[100dvh] bg-app">
        <header
          className={`relative overflow-hidden bg-gradient-to-br px-6 pb-12 pt-6 ${mood.gradient}`}
        >
          <div
            className="pointer-events-none absolute -inset-x-20 -top-32 h-72 mood-halo"
            style={{
              background: `radial-gradient(closest-side, ${mood.accent}88, transparent 70%)`,
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_70%_at_20%_0%,rgba(255,255,255,0.25),transparent_60%)]" />

          <div className="relative">
            <Link
              to="/"
              aria-label="Back"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20 backdrop-blur transition active:scale-95"
            >
              <ArrowLeft className={`h-5 w-5 ${mood.foreground}`} strokeWidth={2.25} />
            </Link>

            <div className="mt-8 mood-enter">
              <div
                className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${mood.foreground} opacity-70`}
              >
                Entering
              </div>
              <h1
                className={`mt-1 text-4xl font-bold tracking-tight ${mood.foreground}`}
                style={{ textShadow: `0 0 30px ${mood.accent}66` }}
              >
                {mood.label}
              </h1>
              <p className={`mt-2 text-sm ${mood.foreground} opacity-80`}>
                {mood.tagline}
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 py-8">
          {featured ? (
            <div className="mb-6">
              <FeaturedGameCard game={featured} />
            </div>
          ) : null}

          <div className="mb-4 flex items-center justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">
              More in this mood
            </div>
            <div className="text-[11px] text-white/40">{games.length} total</div>
          </div>

          {rest.length === 0 ? (
            <EmptyState
              accent={mood.accent}
              title="New drops loading…"
              description="Fresh games for this mood are on the way."
            />
          ) : (
            <ul className="space-y-3">
              {rest.map((g, i) => (
                <li key={g.id}>
                  <GameCard game={g} index={i} />
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </AppShell>
  );
}
