import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Flame, Sparkles, Waves, Zap } from "lucide-react";
import { CANVAS_HEIGHT, CANVAS_WIDTH, MODES, MODE_ORDER } from "./constants";
import { GameHUD } from "./components/GameHUD";
import { useGameLoop } from "./hooks/useGameLoop";
import type { GameMode } from "./types";

const ICONS = { Waves, Zap, Flame, Sparkles } as const;

/**
 * Self-contained Bubble Shooter module.
 * The shell only mounts/unmounts it. All game state lives in useGameLoop.
 */
export function BubbleShooter() {
  const [mode, setMode] = useState<GameMode | null>(null);
  const navigate = useNavigate();

  if (!mode) {
    return <ModePicker onPick={setMode} onBack={() => navigate({ to: "/mood/$moodId", params: { moodId: "chill-zone" } })} />;
  }

  return <GameView mode={mode} onExit={() => setMode(null)} onJump={setMode} />;
}

function ModePicker({ onPick, onBack }: { onPick: (m: GameMode) => void; onBack: () => void }) {
  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-app bg-hub px-5 pb-10 pt-6">
      <div className="relative z-10">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/15 backdrop-blur transition active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="mt-8 mood-enter">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/55">
            Bubble Shooter
          </p>
          <h1
            className="mt-1 text-4xl font-bold tracking-tight text-white"
            style={{ textShadow: "0 0 28px rgba(232,121,249,0.45)" }}
          >
            Pick your vibe.
          </h1>
          <p className="mt-2 text-sm text-white/65">Four flavors. Same satisfying pop.</p>
        </div>
      </div>

      <div className="relative z-10 mt-8 grid grid-cols-2 gap-3">
        {MODE_ORDER.map((m, i) => {
          const cfg = MODES[m];
          const Icon = ICONS[cfg.theme.icon];
          return (
            <button
              key={m}
              type="button"
              onClick={() => onPick(m)}
              className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${cfg.theme.cardGradient} p-4 text-left ring-1 ring-white/15 transition active:scale-[0.97] mood-enter`}
              style={{
                animationDelay: `${i * 80}ms`,
                boxShadow: `0 12px 36px -16px ${cfg.theme.accent}, 0 0 0 1px ${cfg.theme.accent}33`,
                minHeight: 168,
              }}
            >
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-50 blur-2xl"
                style={{ background: cfg.theme.accent }}
              />
              <div
                className="pointer-events-none absolute -bottom-10 -left-10 h-28 w-28 rounded-full opacity-40 blur-2xl"
                style={{ background: cfg.theme.accent2 }}
              />
              <div className="relative flex h-full flex-col justify-between">
                <div
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-black/30 ring-1 ring-white/20 backdrop-blur"
                  style={{ boxShadow: `0 0 18px ${cfg.theme.accent}88 inset` }}
                >
                  <Icon className="h-5 w-5 text-white" strokeWidth={2.4} />
                </div>
                <div>
                  <div
                    className="text-lg font-bold tracking-tight text-white"
                    style={{ textShadow: "0 1px 12px rgba(0,0,0,0.35)" }}
                  >
                    {cfg.label}
                  </div>
                  <div className="mt-0.5 text-[12px] font-medium text-white/85">
                    {cfg.blurb}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="relative z-10 mt-auto pt-8 text-center text-[11px] uppercase tracking-[0.3em] text-white/35">
        Tap a mode to enter
      </div>
    </div>
  );
}

function GameView({
  mode,
  onExit,
  onJump,
}: {
  mode: GameMode;
  onExit: () => void;
  onJump: (m: GameMode) => void;
}) {
  const { canvasRef, score, level, best, combo, bestCombo, pops, gameOver, restart } =
    useGameLoop(mode);
  const cfg = MODES[mode];
  const [introDone, setIntroDone] = useState(false);

  // Brief entry intro
  useEffect(() => {
    setIntroDone(false);
    const t = setTimeout(() => setIntroDone(true), 650);
    return () => clearTimeout(t);
  }, [mode]);

  const nextMode = (): GameMode => {
    const idx = MODE_ORDER.indexOf(mode);
    return MODE_ORDER[(idx + 1) % MODE_ORDER.length];
  };

  return (
    <div
      className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden"
      style={{
        background: `radial-gradient(120% 80% at 50% 0%, ${cfg.theme.bgTop}, ${cfg.theme.bgBottom})`,
      }}
    >
      {/* Outer mode-tinted aura behind the canvas */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mood-halo"
        style={{
          background: `radial-gradient(40% 30% at 50% 8%, ${cfg.theme.accent}44, transparent 70%), radial-gradient(50% 35% at 50% 100%, ${cfg.theme.accent2}33, transparent 70%)`,
        }}
      />

      <canvas
        ref={canvasRef}
        className="relative z-10 rounded-[28px] ring-1 ring-white/10"
        style={{
          width: `${CANVAS_WIDTH}px`,
          height: `${CANVAS_HEIGHT}px`,
          touchAction: "none",
          maxWidth: "100%",
          maxHeight: "100dvh",
          boxShadow: `0 30px 80px -30px ${cfg.theme.accent}cc, 0 0 0 1px ${cfg.theme.accent}22`,
        }}
      />

      <GameHUD
        mode={mode}
        score={score}
        level={level}
        best={best}
        combo={combo}
        bestCombo={bestCombo}
        pops={pops}
        gameOver={gameOver}
        onRestart={restart}
        onBack={onExit}
        onNextChallenge={() => onJump(nextMode())}
        onChangeMode={onExit}
      />

      {/* Entry intro — soft, brief, never explosive */}
      {!introDone && (
        <div
          className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center"
          style={{
            background: `radial-gradient(60% 40% at 50% 50%, ${cfg.theme.bgTop}f2, ${cfg.theme.bgBottom}f2)`,
            animation: "fade-out 500ms ease forwards",
            animationDelay: "200ms",
          }}
        >
          <div
            className="text-3xl font-bold tracking-tight text-white"
            style={{
              animation: "fade-in 320ms ease both",
              textShadow: `0 0 18px ${cfg.theme.accent}aa`,
            }}
          >
            {cfg.label}
          </div>
        </div>
      )}
    </div>
  );
}

export default BubbleShooter;
