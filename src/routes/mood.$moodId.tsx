import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Play } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { getMood } from "@/features/moods/data";
import { getGamesByMood } from "@/games/registry";

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

  return (
    <AppShell>
      <div className="relative min-h-[100dvh] bg-app">
        {/* Themed hero with animated halo */}
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
          <div className="mb-4 flex items-center justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">
              Pick your game
            </div>
            <div className="text-[11px] text-white/40">{games.length} live</div>
          </div>

          {games.length === 0 ? (
            <div
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center"
              style={{ boxShadow: `0 0 40px -10px ${mood.accent}55 inset` }}
            >
              <div
                className="mx-auto mb-3 h-2 w-2 rounded-full hub-pulse"
                style={{ backgroundColor: mood.accent, boxShadow: `0 0 18px ${mood.accent}` }}
              />
              <p className="text-sm text-white/60">New drops loading…</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {games.map((g, i) => (
                <li key={g.id} className="mood-enter" style={{ animationDelay: `${i * 80}ms` }}>
                  <Link
                    to="/play/$gameId"
                    params={{ gameId: g.id }}
                    className="group relative flex items-center justify-between overflow-hidden rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10 backdrop-blur transition active:scale-[0.98]"
                    style={{ boxShadow: `0 10px 30px -18px ${mood.accent}aa` }}
                  >
                    <div
                      className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full opacity-50 blur-2xl"
                      style={{ background: mood.accent }}
                    />
                    <div className="relative">
                      <div className="text-base font-semibold tracking-tight text-white">
                        {g.title}
                      </div>
                      <div className="mt-0.5 text-xs text-white/60">{g.tagline}</div>
                    </div>
                    <span
                      className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-black transition group-hover:scale-105"
                      style={{
                        background: mood.accent,
                        boxShadow: `0 0 24px ${mood.accent}`,
                      }}
                    >
                      <Play className="h-4 w-4 fill-current" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </AppShell>
  );
}
