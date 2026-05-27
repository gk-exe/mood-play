import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
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
      <header
        className={`relative bg-gradient-to-br px-6 pb-10 pt-6 ${mood.gradient}`}
      >
        <Link
          to="/"
          aria-label="Back"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/50 backdrop-blur transition active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </Link>
        <h1 className={`mt-6 text-3xl font-medium tracking-tight ${mood.foreground}`}>
          {mood.label}
        </h1>
        <p className={`mt-1 text-sm ${mood.foreground} opacity-70`}>
          {mood.description}
        </p>
      </header>

      <main className="flex-1 px-5 py-8">
        {games.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 px-6 py-16 text-center">
            <p className="text-sm text-muted-foreground">
              Games arriving soon.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {games.map((g) => (
              <li
                key={g.id}
                className="rounded-2xl bg-card p-4 ring-1 ring-black/[0.04]"
              >
                {g.title}
              </li>
            ))}
          </ul>
        )}
      </main>
    </AppShell>
  );
}
