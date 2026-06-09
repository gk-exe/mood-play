import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Sparkles, CheckCircle2, FlaskConical } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { GAMES } from "@/games/registry";
import { getMood } from "@/features/moods/data";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Roadmap — Vibe Games" },
      {
        name: "description",
        content:
          "What's playable today and what's brewing next in the Vibe Games arcade.",
      },
      { property: "og:title", content: "Roadmap — Vibe Games" },
      {
        property: "og:description",
        content: "Live games, lab experiments, and where we're headed.",
      },
    ],
  }),
  component: RoadmapPage,
});

function RoadmapPage() {
  const live = GAMES.filter((g) => g.status === "live");
  const soon = GAMES.filter((g) => g.status === "coming-soon");

  return (
    <AppShell>
      <div className="relative min-h-[100dvh] bg-hub px-5 pt-6 pb-14">
        <Link
          to="/"
          aria-label="Back to hub"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur transition active:scale-95"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </Link>

        <header className="mt-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/15 px-3 py-1 ring-1 ring-cyan-300/30">
            <Sparkles className="h-3 w-3 text-cyan-200" />
            <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-100">
              Where we're headed
            </span>
          </span>
          <h1 className="mt-4 text-[2rem] font-bold leading-tight tracking-tight text-white">
            The{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-fuchsia-300 bg-clip-text text-transparent">
              roadmap.
            </span>
          </h1>
          <p className="mt-2 max-w-sm text-sm text-white/60">
            No promises on dates — just direction. The lab's always cooking,
            and your suggestions shape what ships next.
          </p>
        </header>

        <Section
          icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />}
          label="Playable now"
          accent="#5eead4"
        >
          {live.map((g) => {
            const m = getMood(g.moodCategory);
            return (
              <Link
                key={g.id}
                to="/play/$gameId"
                params={{ gameId: g.id }}
                className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/10 transition active:scale-[0.98]"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white">
                    {g.title}
                  </div>
                  <div className="truncate text-[11px] text-white/55">
                    {g.shortDescription}
                  </div>
                </div>
                <span
                  className="shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-black"
                  style={{ background: m?.accent ?? "#a78bfa" }}
                >
                  Play
                </span>
              </Link>
            );
          })}
        </Section>

        <Section
          icon={<FlaskConical className="h-3.5 w-3.5 text-fuchsia-300" />}
          label="In the lab"
          accent="#e879f9"
        >
          {soon.map((g) => {
            const m = getMood(g.moodCategory);
            return (
              <div
                key={g.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.025] p-3 ring-1 ring-white/10"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white/85">
                    {g.title}
                  </div>
                  <div className="truncate text-[11px] text-white/45">
                    {g.shortDescription} · {m?.label}
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/65 ring-1 ring-white/10">
                  Soon
                </span>
              </div>
            );
          })}
        </Section>

        <div className="mt-10 rounded-3xl bg-white/[0.04] p-5 text-center ring-1 ring-white/10">
          <p className="text-sm text-white/70">
            See something missing? Help pick what we build next.
          </p>
          <Link
            to="/suggest"
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-400 to-amber-300 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-black"
          >
            Suggest a game
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

function Section({
  icon,
  label,
  accent,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center gap-2 px-1">
        <span
          className="inline-flex h-6 w-6 items-center justify-center rounded-full ring-1 ring-white/10"
          style={{ background: `${accent}1f` }}
        >
          {icon}
        </span>
        <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/75">
          {label}
        </h2>
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
