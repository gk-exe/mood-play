import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { MOODS } from "@/features/moods/data";
import { MoodCard } from "@/features/moods/MoodCard";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <AppShell>
      <div className="relative min-h-[100dvh] bg-hub">
        <header className="relative px-6 pt-12 pb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 hub-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
              Mood Hub
            </span>
          </div>

          <h1 className="mt-4 text-[2.1rem] font-bold leading-[1.05] tracking-tight text-white">
            What kind of <span className="bg-gradient-to-r from-fuchsia-300 via-cyan-300 to-amber-300 bg-clip-text text-transparent">chaos</span> today?
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Tap a vibe. Drop straight into a game.
          </p>
        </header>

        <main className="relative flex-1 px-5 pb-12">
          <div className="grid grid-cols-2 gap-4">
            {MOODS.map((mood, i) => (
              <MoodCard key={mood.id} mood={mood} index={i} />
            ))}
          </div>

          <p className="mt-8 text-center text-[11px] uppercase tracking-[0.22em] text-white/30">
            more energies coming
          </p>
        </main>
      </div>
    </AppShell>
  );
}
