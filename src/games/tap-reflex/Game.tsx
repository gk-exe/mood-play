import { useNavigate } from "@tanstack/react-router";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Sparkles, Zap } from "lucide-react";
import { GameOverlay } from "@/components/platform";
import { GhostButton, Sfx } from "@/games/_shared";
import { ACCENT, MODES, getMode } from "./constants";
import { TapReflexHUD } from "./components/TapReflexHUD";
import { useTapReflex } from "./hooks/useTapReflex";

/** Target palette — rich, comfortable Quick Hits tones (no fluorescent glare). */
const TONES = ["#fb923c", "#f87171", "#fbbf24", "#fb7185"] as const;

/**
 * Tap Reflex — Quick Hits.
 * Targets bloom in, shrink, and fade. Tap them fast, keep the chain alive.
 */
export function TapReflex() {
  const navigate = useNavigate();
  const api = useTapReflex();
  const cfg = getMode(api.mode);

  const goHome = () => {
    void navigate({ to: "/" });
  };

  const onFieldPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (api.phase !== "playing") return;
    const rect = e.currentTarget.getBoundingClientRect();
    api.missTap(e.clientX - rect.left, e.clientY - rect.top);
  };

  return (
    <div
      className="relative h-[100dvh] w-full select-none overflow-hidden"
      style={{
        background: "radial-gradient(120% 80% at 50% 0%, #241206, #0d0703)",
        touchAction: "none",
      }}
    >
      {/* Warm mood halo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mood-halo"
        style={{
          background:
            "radial-gradient(42% 30% at 50% 6%, rgba(251,146,60,0.16), transparent 70%), radial-gradient(52% 36% at 50% 100%, rgba(248,113,113,0.10), transparent 70%)",
        }}
      />

      {/* Playfield */}
      <div
        ref={api.fieldRef}
        className="absolute inset-0"
        onPointerDown={onFieldPointerDown}
      >
        {api.bursts.map((b) => (
          <span
            key={b.id}
            aria-hidden
            className="vg-tap-burst pointer-events-none absolute rounded-full"
            style={{
              left: b.x,
              top: b.y,
              width: b.r * 2,
              height: b.r * 2,
              border: `2px solid ${b.accent}`,
              animation: "vg-tap-burst 480ms cubic-bezier(0.22, 1, 0.36, 1) both",
            }}
          />
        ))}

        {api.targets.map((t) => {
          const tone = TONES[t.tone % TONES.length];
          return (
            <button
              key={t.id}
              type="button"
              aria-label="Tap target"
              className="vg-tap-target absolute rounded-full"
              style={{
                left: t.x,
                top: t.y,
                width: t.r * 2,
                height: t.r * 2,
                transform: "translate(-50%, -50%)",
                background: `radial-gradient(circle at 35% 30%, ${tone}, ${tone}bb 55%, ${tone}66)`,
                boxShadow: `0 0 18px -4px ${tone}aa, inset 0 -3px 8px rgba(0,0,0,0.25)`,
                animation: "vg-tap-in 160ms cubic-bezier(0.34, 1.56, 0.64, 1) both",
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                api.hit(t.id);
              }}
            >
              <span
                aria-hidden
                className="vg-tap-ring absolute inset-[3px] rounded-full ring-2 ring-white/70"
                style={{
                  animation: `vg-tap-ring ${t.life}ms linear both`,
                }}
              />
            </button>
          );
        })}

        {api.pops.map((p) => (
          <span
            key={p.id}
            aria-hidden
            className="pointer-events-none absolute text-sm font-bold tabular-nums"
            style={{
              left: p.x,
              top: p.y,
              color: p.accent,
              textShadow: `0 0 10px ${p.accent}88`,
              animation: "vg-tap-pop 680ms cubic-bezier(0.22, 1, 0.36, 1) both",
            }}
          >
            {p.text}
          </span>
        ))}
      </div>

      <TapReflexHUD
        phase={api.phase}
        mode={api.mode}
        score={api.score}
        combo={api.combo}
        bestCombo={api.bestCombo}
        remainingMs={api.remainingMs}
        best={api.best}
        stats={api.stats}
        soundOn={api.soundOn}
        onBack={goHome}
        onRestart={() => api.start(api.mode)}
        onChangeMode={api.toIntro}
        onToggleSound={api.toggleSound}
      />

      {/* Mode select / intro */}
      {api.phase === "intro" && (
        <GameOverlay accent={ACCENT}>
          <Sparkles
            className="mb-3 h-7 w-7"
            style={{ color: ACCENT, filter: `drop-shadow(0 0 6px ${ACCENT}88)` }}
          />
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/65">
            Quick Hits
          </p>
          <h1
            className="mt-1 text-3xl font-bold tracking-tight text-white"
            style={{ textShadow: `0 0 16px ${ACCENT}88` }}
          >
            Tap Reflex
          </h1>
          <p className="mt-2 max-w-xs text-center text-xs leading-relaxed text-white/55">
            Tap every target before it fades. Faster taps score more, and chains
            multiply everything.
          </p>

          <div className="mt-6 grid w-64 gap-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  Sfx.play("tap");
                  api.start(m.id);
                }}
                className="rounded-2xl bg-white/[0.06] px-4 py-3 text-left ring-1 ring-white/10 transition active:scale-[0.98] hover:bg-white/[0.1]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-white">{m.label}</span>
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-bold tabular-nums"
                    style={{ color: ACCENT }}
                  >
                    <Zap className="h-3 w-3" strokeWidth={2.6} />
                    {m.multiplier}×
                  </span>
                </div>
                <div className="mt-0.5 text-[11px] text-white/50">{m.blurb}</div>
              </button>
            ))}
          </div>

          <div className="mt-4 flex w-64 flex-col gap-2">
            <GhostButton onClick={goHome}>Back to arcade</GhostButton>
          </div>

          <p className="mt-3 text-[10px] text-white/35">
            {Math.round(cfg.durationMs / 1000)}-second rounds · best score saved
            locally
          </p>
        </GameOverlay>
      )}
    </div>
  );
}
