import { ArrowLeft, RotateCcw, Sparkles, Trophy, Volume2, VolumeX } from "lucide-react";
import {
  CornerChip,
  GhostButton,
  IconButton,
  PrimaryCTA,
  StatTile,
} from "@/games/_shared";
import { ResultModal } from "@/components/platform";
import { ACCENT, ACCENT_SECONDARY } from "../constants";
import type { GamePhase } from "../types";

interface Props {
  score: number;
  best: number;
  highest: number;
  combo: number;
  phase: GamePhase;
  isNewBest: boolean;
  soundOn: boolean;
  onBack: () => void;
  onRestart: () => void;
  onKeepPlaying: () => void;
  onToggleSound: () => void;
}

/**
 * Corner-only HUD + end-of-round ceremony for 2048.
 * Composed entirely from platform primitives — no forked styling.
 */
export function Twenty48HUD({
  score,
  best,
  highest,
  combo,
  phase,
  isNewBest,
  soundOn,
  onBack,
  onRestart,
  onKeepPlaying,
  onToggleSound,
}: Props) {
  return (
    <>
      {/* Top-left: back + score */}
      <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-start gap-2">
        <IconButton label="Back" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" strokeWidth={2.4} />
        </IconButton>
        <CornerChip
          label="Score"
          value={score.toLocaleString()}
          sub={
            combo > 1 ? (
              <div
                className="text-[10px] font-bold tabular-nums"
                style={{ color: ACCENT }}
              >
                ×{combo} chain
              </div>
            ) : null
          }
        />
      </div>

      {/* Top-right: best + sound + restart */}
      <div className="pointer-events-none absolute right-3 top-3 z-10 flex items-start gap-2">
        <CornerChip label="Best" value={best.toLocaleString()} align="right" />
        <IconButton label={soundOn ? "Mute" : "Unmute"} onClick={onToggleSound}>
          {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </IconButton>
        <IconButton label="Restart" onClick={onRestart}>
          <RotateCcw className="h-4 w-4" />
        </IconButton>
      </div>

      {/* Victory */}
      {phase === "won" && (
        <ResultModal
          accent={ACCENT}
          icon={
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: ACCENT, boxShadow: `0 0 22px ${ACCENT}88` }}
            >
              <Trophy className="h-6 w-6 text-black" strokeWidth={2.5} />
            </div>
          }
          eyebrow="2048 reached"
          headline="Perfect stack."
          stats={
            <>
              <StatTile label="Score" value={score.toLocaleString()} accent={ACCENT} />
              <StatTile label="Best tile" value={highest} accent={ACCENT_SECONDARY} />
              <StatTile label="Best" value={best.toLocaleString()} accent={ACCENT} />
            </>
          }
          actions={
            <>
              <PrimaryCTA accent={ACCENT} onClick={onKeepPlaying} className="col-span-2">
                Keep going
              </PrimaryCTA>
              <GhostButton onClick={onRestart}>Play again</GhostButton>
              <GhostButton onClick={onBack}>Back to arcade</GhostButton>
            </>
          }
        />
      )}

      {/* Game over */}
      {phase === "lost" && (
        <ResultModal
          accent={ACCENT}
          icon={
            isNewBest ? (
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: ACCENT, boxShadow: `0 0 22px ${ACCENT}88` }}
              >
                <Trophy className="h-6 w-6 text-black" strokeWidth={2.5} />
              </div>
            ) : (
              <Sparkles
                className="h-7 w-7"
                style={{ color: ACCENT, filter: `drop-shadow(0 0 6px ${ACCENT}88)` }}
              />
            )
          }
          eyebrow={isNewBest ? "New best score" : "Board is full"}
          headline={isNewBest ? "Personal best." : "Nice run."}
          stats={
            <>
              <StatTile label="Score" value={score.toLocaleString()} accent={ACCENT} />
              <StatTile label="Best tile" value={highest} accent={ACCENT_SECONDARY} />
              <StatTile label="Best" value={best.toLocaleString()} accent={ACCENT} />
            </>
          }
          actions={
            <>
              <PrimaryCTA accent={ACCENT} onClick={onRestart} className="col-span-2">
                Play again
              </PrimaryCTA>
              <GhostButton onClick={onBack} className="col-span-2">
                Back to arcade
              </GhostButton>
            </>
          }
        />
      )}
    </>
  );
}
