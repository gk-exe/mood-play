import { ArrowLeft, RotateCcw, Sparkles, Trophy } from "lucide-react";
import {
  CelebrationOverlay,
  CornerChip,
  GhostButton,
  IconButton,
  PrimaryCTA,
  StatTile,
} from "@/games/_shared";
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
 * Bubble Shooter HUD. Composes the shared arcade primitives — visual rules
 * (corner-only, semi-transparent, low-obstruction) are enforced by those
 * primitives so every future mini-game inherits the same baseline.
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
      {/* Top-left: back + score (with inline combo) */}
      <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-start gap-2">
        <IconButton label="Back" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" strokeWidth={2.4} />
        </IconButton>
        <CornerChip
          label={`Score · L${level}`}
          value={score}
          sub={
            combo >= 2 && !gameOver ? (
              <div
                className="text-[10px] font-bold tabular-nums"
                style={{ color: accent, textShadow: `0 0 6px ${accent}66` }}
              >
                ×{combo} chain
              </div>
            ) : null
          }
        />
      </div>

      {/* Top-right: best + restart */}
      <div className="pointer-events-none absolute right-3 top-3 z-10 flex items-start gap-2">
        <CornerChip label="Best" value={best} align="right" />
        <IconButton label="Restart" onClick={onRestart}>
          <RotateCcw className="h-4 w-4" />
        </IconButton>
      </div>

      {gameOver && (
        <CelebrationOverlay
          accent={accent}
          icon={
            isNewBest ? (
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: accent, boxShadow: `0 0 22px ${accent}88` }}
              >
                <Trophy className="h-6 w-6 text-black" strokeWidth={2.5} />
              </div>
            ) : (
              <Sparkles
                className="h-7 w-7"
                style={{ color: accent, filter: `drop-shadow(0 0 6px ${accent}88)` }}
              />
            )
          }
          eyebrow={isNewBest ? "New best" : "Round complete"}
          headline={isNewBest ? "Beautiful." : "Nice run."}
          stats={
            <>
              <StatTile label="Score" value={score} accent={accent} />
              <StatTile label="Chain" value={`×${bestCombo}`} accent={cfg.theme.accent2} />
              <StatTile label="Pops" value={pops} accent={accent} />
            </>
          }
          actions={
            <>
              <PrimaryCTA accent={accent} onClick={onRestart} className="col-span-2">
                Play again
              </PrimaryCTA>
              <GhostButton onClick={onNextChallenge}>Next mode</GhostButton>
              <GhostButton onClick={onChangeMode}>Modes</GhostButton>
            </>
          }
        />
      )}
    </>
  );
}
