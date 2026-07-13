import { useEffect, useState } from "react";
import { Gamepad2, Brain, Zap, Hammer, MessageCircle } from "lucide-react";
import { GAMES } from "@/games/registry";
import { getIdeas } from "@/features/feedback/store";

/**
 * Compact stats strip that makes the platform feel alive and growing.
 * All counts derive from the local registry + local feedback store.
 */
export function PlatformStats() {
  const [ideaCount, setIdeaCount] = useState(0);

  useEffect(() => {
    const read = () => setIdeaCount(getIdeas().length);
    read();
    const onChange = () => read();
    window.addEventListener("vg:feedback:changed", onChange);
    return () => window.removeEventListener("vg:feedback:changed", onChange);
  }, []);

  const live = GAMES.filter((g) => g.status === "live").length;
  const brain = GAMES.filter((g) => g.moodCategory === "brain-boost").length;
  const action = GAMES.filter((g) => g.moodCategory === "action-rush").length;
  const soon = GAMES.filter((g) => g.status === "coming-soon").length;

  const stats: { icon: React.ReactNode; label: string; value: number; accent: string }[] = [
    { icon: <Gamepad2 className="h-3.5 w-3.5" />, label: "Playable", value: live, accent: "#e879f9" },
    { icon: <Brain className="h-3.5 w-3.5" />, label: "Brain", value: brain, accent: "#facc15" },
    { icon: <Zap className="h-3.5 w-3.5" />, label: "Action", value: action, accent: "#f472b6" },
    { icon: <Hammer className="h-3.5 w-3.5" />, label: "Brewing", value: soon, accent: "#22d3ee" },
    { icon: <MessageCircle className="h-3.5 w-3.5" />, label: "Ideas", value: ideaCount, accent: "#a78bfa" },
  ];

  return (
    <section aria-label="Platform stats">
      <div className="mb-3 flex items-end justify-between px-1">
        <h2 className="text-sm font-bold uppercase tracking-[0.22em] text-white/70">
          The vibe check
        </h2>
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
          Growing weekly
        </span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl bg-white/[0.04] p-2.5 text-center ring-1 ring-white/10"
          >
            <span
              className="mx-auto inline-flex h-6 w-6 items-center justify-center rounded-lg ring-1 ring-white/10"
              style={{ background: `${s.accent}22`, color: s.accent }}
            >
              {s.icon}
            </span>
            <div className="mt-1.5 text-base font-bold leading-none tracking-tight text-white">
              {s.value}
            </div>
            <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
