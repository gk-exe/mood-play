import { ArrowLeft, RotateCcw, Sparkles, Trophy, Zap } from "lucide-react";
import { MODES } from "../constants";
import type { GameMode } from "../types";

interface GameHUDProps {
  mode: GameMode;
  score: number;
  level: number;
  best: number;
  combo: number;
  bestCombo: number;
  pops: number;
  gameOver: boolean;
  onRestart: () => void;
  onBack: () => void;
  onNextChallenge: () => void;
  onChangeMode: () => void;
}

export function GameHUD({
  mode,
  score,
  level,
  best,
  combo,
  bestCombo,
  pops,
  gameOver,
  onRestart,
  onBack,
  onNextChallenge,
  onChangeMode,
}: GameHUDProps) {
  const cfg = MODES[mode];
  const accent = cfg.theme.accent;
  const isNewBest = score > 0 && score >= best;

  return (
    <>
      {/* Top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between px-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white ring-1 ring-white/15 backdrop-blur-md transition active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.4} />
        </button>

        <div
          className="pointer-events-auto rounded-2xl bg-black/45 px-5 py-2 text-center ring-1 ring-white/15 backdrop-blur-md"
          style={{ boxShadow: `0 0 24px -8px ${accent}aa` }}
        >
          <div
            className="text-[10px] font-bold uppercase tracking-[0.22em]"
            style={{ color: accent }}
          >
            {cfg.label} · L{level}
          </div>
          <div className="text-2xl font-bold tabular-nums leading-tight text-white">{score}</div>
          <div className="text-[10px] tabular-nums text-white/55">best {best}</div>
        </div>

        <button
          type="button"
          onClick={onRestart}
          aria-label="Restart"
          className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white ring-1 ring-white/15 backdrop-blur-md transition active:scale-95"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Combo indicator (live) */}
      {combo >= 2 && !gameOver && (
        <div className="pointer-events-none absolute left-1/2 top-20 z-10 -translate-x-1/2">
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-black backdrop-blur-md"
            style={{
              background: accent,
              boxShadow: `0 0 28px ${accent}, 0 0 8px ${accent}`,
            }}
          >
            <Zap className="h-3 w-3" strokeWidth={3} />
            <span>×{combo} CHAIN</span>
          </div>
        </div>
      )}

      {/* Game over / celebration overlay */}
      {gameOver && (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 backdrop-blur-md"
          style={{
            background: `radial-gradient(80% 50% at 50% 40%, ${accent}22, rgba(0,0,0,0.78) 70%)`,
          }}
        >
          {/* Confetti dots */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 14 }).map((_, i) => (
              <span
                key={i}
                className="absolute h-1.5 w-1.5 animate-[hub-pulse_2.4s_ease-in-out_infinite] rounded-full"
                style={{
                  left: `${(i * 73) % 100}%`,
                  top: `${(i * 41) % 100}%`,
                  background: i % 2 === 0 ? accent : cfg.theme.accent2,
                  boxShadow: `0 0 12px ${i % 2 === 0 ? accent : cfg.theme.accent2}`,
                  animationDelay: `${i * 120}ms`,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 flex flex-col items-center">
            {isNewBest ? (
              <>
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full"
                  style={{
                    background: accent,
                    boxShadow: `0 0 40px ${accent}`,
                  }}
                >
                  <Trophy className="h-7 w-7 text-black" strokeWidth={2.5} />
                </div>
                <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.3em] text-white/70">
                  New personal best
                </p>
                <h2
                  className="mt-1 text-4xl font-bold tracking-tight text-white"
                  style={{ textShadow: `0 0 24px ${accent}` }}
                >
                  Legend.
                </h2>
              </>
            ) : (
              <>
                <Sparkles
                  className="h-10 w-10"
                  style={{ color: accent, filter: `drop-shadow(0 0 14px ${accent})` }}
                />
                <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.3em] text-white/70">
                  Run complete
                </p>
                <h2 className="mt-1 text-4xl font-bold tracking-tight text-white">Nice run.</h2>
              </>
            )}

            {/* Stat grid */}
            <div className="mt-6 grid w-72 grid-cols-3 gap-2">
              <Stat label="Score" value={score} accent={accent} />
              <Stat label="Best Chain" value={`×${bestCombo}`} accent={cfg.theme.accent2} />
              <Stat label="Pops" value={pops} accent={accent} />
            </div>

            {/* Actions */}
            <div className="mt-6 grid w-72 grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onRestart}
                className="rounded-2xl px-4 py-3.5 text-sm font-bold text-black transition active:scale-95"
                style={{
                  background: accent,
                  boxShadow: `0 8px 24px -8px ${accent}, 0 0 18px ${accent}aa`,
                }}
              >
                Play again
              </button>
              <button
                type="button"
                onClick={onNextChallenge}
                className="rounded-2xl bg-white/10 px-4 py-3.5 text-sm font-bold text-white ring-1 ring-white/15 backdrop-blur transition active:scale-95"
              >
                Try harder
              </button>
              <button
                type="button"
                onClick={onChangeMode}
                className="rounded-2xl bg-white/5 px-4 py-3 text-xs font-semibold text-white/80 ring-1 ring-white/10 transition active:scale-95"
              >
                Change mode
              </button>
              <button
                type="button"
                onClick={onBack}
                className="rounded-2xl bg-white/5 px-4 py-3 text-xs font-semibold text-white/80 ring-1 ring-white/10 transition active:scale-95"
              >
                Home
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.06] px-3 py-3 text-center ring-1 ring-white/10 backdrop-blur">
      <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/55">{label}</div>
      <div
        className="mt-1 text-lg font-bold tabular-nums text-white"
        style={{ textShadow: `0 0 14px ${accent}88` }}
      >
        {value}
      </div>
    </div>
  );
}
