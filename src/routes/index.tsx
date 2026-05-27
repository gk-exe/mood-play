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
      <header className="px-6 pt-10 pb-6">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
          How do you feel?
        </p>
        <h1 className="mt-1 text-3xl font-medium tracking-tight text-foreground">
          Pick a mood
        </h1>
      </header>

      <main className="flex-1 px-5 pb-10">
        <div className="grid grid-cols-2 gap-4">
          {MOODS.map((mood, i) => (
            <MoodCard key={mood.id} mood={mood} index={i} />
          ))}
        </div>
      </main>
    </AppShell>
  );
}
