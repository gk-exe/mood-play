import { ArrowLeft, RotateCcw, Sparkles, Trophy } from "lucide-react";
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

/**
 * Minimal HUD: corners only. The playfield stays sacred — no central chips,
 * no oversized labels. Combo lives as a small inline indicator under the score
 * so the eye never leaves the bubbles.
 */
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
      {/* Top-left: back + score (+ inline combo) */}
      <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-start gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-white/90 ring-1 ring-white/10 backdrop-blur transition active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.4} />
        </button>
        <div className="pointer-events-none rounded-xl bg-black/30 px-3 py-1.5 ring-1 ring-white/10 backdrop-blur">
          <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/55">
            Score · L{level}
          </div>
          <div className="text-lg font-bold tabular-nums leading-tight text-white">
            {score}
          </div>
          {combo >= 2 && !gameOver && (
            <div
              className="mt-0.5 text-[10px] font-bold tabular-nums"
              style={{ color: accent, textShadow: `0 0 10px ${accent}` }}
            >
              ×{combo} chain
            </div>
          )}
        </div>
      </div>

      {/* Top-right: best + restart */}
      <div className="pointer-events-none absolute right-3 top-3 z-10 flex items-start gap-2">
        <div className="pointer-events-none rounded-xl bg-black/30 px-3 py-1.5 text-right ring-1 ring-white/10 backdrop-blur">
          <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/55">
            Best
          </div>
          <div className="text-sm font-bold tabular-nums leading-tight text-white/90">
            {best}
          </div>
        </div>
        <button
          type="button"
          onClick={onRestart}
          aria-label="Restart"
          className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-white/90 ring-1 ring-white/10 backdrop-blur transition active:scale-95"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Game over / celebration — calmer, smoother */}
      {gameOver && (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6"
          style={{
            background: `radial-gradient(70% 50% at 50% 42%, ${accent}1f, rgba(0,0,0,0.72) 72%)`,
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            animation: "fade-in 420ms ease both",
          }}
        >
          <div
            className="relative z-10 flex flex-col items-center"
            style={{ animation: "scale-in 480ms cubic-bezier(0.22, 1, 0.36, 1) both" }}
          >
            {isNewBest ? (
              <>
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ background: accent, boxShadow: `0 0 28px ${accent}aa` }}
                >
                  <Trophy className="h-6 w-6 text-black" strokeWidth={2.5} />
                </div>
                <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.28em] text-white/65">
                  New best
                </p>
                <h2
                  className="mt-1 text-3xl font-bold tracking-tight text-white"
                  style={{ textShadow: `0 0 18px ${accent}aa` }}
                >
                  Beautiful.
                </h2>
              </>
            ) : (
              <>
                <Sparkles
                  className="h-8 w-8"
                  style={{ color: accent, filter: `drop-shadow(0 0 10px ${accent})` }}
                />
                <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.28em] text-white/65">
                  Round complete
                </p>
                <h2 className="mt-1 text-3xl font-bold tracking-tight text-white">
                  Nice run.
                </h2>
              </>
            )}

            <div className="mt-5 grid w-64 grid-cols-3 gap-1.5">
              <Stat label="Score" value={score} accent={accent} />
              <Stat label="Chain" value={`×${bestCombo}`} accent={cfg.theme.accent2} />
              <Stat label="Pops" value={pops} accent={accent} />
            </div>

            <div className="mt-5 grid w-64 grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={onRestart}
                className="col-span-2 rounded-2xl px-4 py-3 text-sm font-bold text-black transition active:scale-95"
                style={{
                  background: accent,
                  boxShadow: `0 8px 24px -10px ${accent}, 0 0 12px ${accent}66`,
                }}
              >
                Play again
              </button>
              <button
                type="button"
                onClick={onNextChallenge}
                className="rounded-xl bg-white/8 px-3 py-2.5 text-xs font-semibold text-white/85 ring-1 ring-white/10 transition active:scale-95"
              >
                Next mode
              </button>
              <button
                type="button"
                onClick={onChangeMode}
                className="rounded-xl bg-white/8 px-3 py-2.5 text-xs font-semibold text-white/85 ring-1 ring-white/10 transition active:scale-95"
              >
                Modes
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
    <div className="rounded-xl bg-white/[0.05] px-2 py-2 text-center ring-1 ring-white/10 backdrop-blur">
      <div className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/55">
        {label}
      </div>
      <div
        className="mt-0.5 text-base font-bold tabular-nums text-white"
        style={{ textShadow: `0 0 10px ${accent}66` }}
      >
        {value}
      </div>
    </div>
  );
}
