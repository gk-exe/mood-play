import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Waves, Brain, Rocket, Zap } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Vibe Games" },
      {
        name: "description",
        content:
          "Vibe Games is a pocket arcade tuned to your mood. Pick a vibe, play instantly. No accounts. No ads.",
      },
      { property: "og:title", content: "About — Vibe Games" },
      {
        property: "og:description",
        content: "Play based on your mood. A pocket arcade for any moment.",
      },
    ],
  }),
  component: AboutPage,
});

const VIBES = [
  { icon: Waves, label: "Relax", color: "#22d3ee", note: "Wind down." },
  { icon: Brain, label: "Focus", color: "#facc15", note: "Get sharp." },
  { icon: Rocket, label: "Action", color: "#e879f9", note: "Get loud." },
  { icon: Zap, label: "Quick fun", color: "#fb923c", note: "60 seconds." },
];

function AboutPage() {
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

        <header className="mt-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
            <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 hub-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/70">
              Vibe Games
            </span>
          </span>
          <h1 className="mt-5 text-[2.2rem] font-bold leading-[1.05] tracking-tight text-white">
            Play based on your{" "}
            <span className="bg-gradient-to-r from-fuchsia-300 via-cyan-300 to-amber-300 bg-clip-text text-transparent">
              mood.
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-white/70">
            Most arcades dump a hundred icons on a screen and ask you to
            pick. Vibe Games starts with a feeling — then hands you a game
            that fits it.
          </p>
        </header>

        <section className="mt-10 grid grid-cols-2 gap-3">
          {VIBES.map(({ icon: Icon, label, color, note }) => (
            <div
              key={label}
              className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10"
            >
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl ring-1 ring-white/15"
                style={{ background: `${color}22`, color }}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="mt-3 text-sm font-semibold text-white">
                {label}
              </div>
              <div className="text-[11px] text-white/55">{note}</div>
            </div>
          ))}
        </section>

        <section className="mt-10 space-y-3 rounded-3xl bg-white/[0.03] p-5 ring-1 ring-white/10">
          <Bullet>
            <b className="text-white/85">No accounts.</b> Open and play.
          </Bullet>
          <Bullet>
            <b className="text-white/85">No ads.</b> Ever.
          </Bullet>
          <Bullet>
            <b className="text-white/85">One-handed.</b> Built mobile-first.
          </Bullet>
          <Bullet>
            <b className="text-white/85">Always growing.</b> New games drop
            from the lab.
          </Bullet>
        </section>

        <div className="mt-8 flex flex-col gap-2">
          <Link
            to="/roadmap"
            className="rounded-2xl bg-white/[0.05] px-4 py-3 text-center text-sm font-semibold text-white ring-1 ring-white/10 transition active:scale-[0.98]"
          >
            See the roadmap →
          </Link>
          <Link
            to="/suggest"
            className="rounded-2xl bg-gradient-to-r from-fuchsia-400 to-amber-300 px-4 py-3 text-center text-sm font-bold uppercase tracking-[0.18em] text-black"
          >
            Suggest a game
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 text-[13px] text-white/65">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-fuchsia-300" />
      <span>{children}</span>
    </div>
  );
}
