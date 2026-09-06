import {
  ArrowLeft,
  FlaskConical,
  RotateCcw,
  Trophy,
  Undo2,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  CornerChip,
  GhostButton,
  IconButton,
  PrimaryCTA,
  StatTile,
} from "@/games/_shared";
import { ResultModal } from "@/components/platform";
import { ACCENT, ACCENT_SECONDARY } from "../constants";
import type { SortPhase, SortStats } from "../types";

interface Props {
  phase: SortPhase;
  score: number;
  best: number;
  level: number;
  moves: number;
  undosLeft: number;
  soundOn: boolean;
  stats: SortStats;
  onBack: () => void;
  onUndo: () => void;
  onRestartLevel: () => void;
  onToggleSound: () => void;
  onNextLevel: () => void;
  onPlayAgain: () => void;
  onChangeMode: () => void;
}

/** Corner-only HUD + shared celebration surfaces for Sorting Master. */
export function SortingMasterHUD({
  phase,
  score,
  best,
  level,
  moves,
  undosLeft,
  soundOn,
  stats,
  onBack,
  onUndo,
  onRestartLevel,
  onToggleSound,
  onNextLevel,
  onPlayAgain,
  onChangeMode,
}: Props) {
  const isNewBest = stats.score > 0 && stats.score >= best;

  return (
    <>
      {phase !== "intro" && (
        <>
          <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-start gap-2">
            <IconButton label="Back" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" strokeWidth={2.4} />
            </IconButton>
            <CornerChip
              label="Score"
              value={score.toLocaleString()}
              sub={
                <div className="text-[10px] font-bold text-white/45">
                  {moves} moves
                </div>
              }
            />
          </div>

          <div className="pointer-events-none absolute right-3 top-3 z-10 flex items-start gap-2">
            <CornerChip label="Level" value={level} align="right" />
            <IconButton label={soundOn ? "Mute" : "Unmute"} onClick={onToggleSound}>
              {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </IconButton>
          </div>

          <div className="pointer-events-none absolute bottom-4 left-3 z-10 flex items-center gap-2">
            <IconButton
              label="Undo"
              onClick={onUndo}
              disabled={undosLeft <= 0}
              className={undosLeft <= 0 ? "opacity-40" : undefined}
            >
              <Undo2 className="h-4 w-4" />
            </IconButton>
            <span className="pointer-events-none text-[10px] font-bold tabular-nums text-white/45">
              {undosLeft} left
            </span>
          </div>

          <div className="pointer-events-none absolute bottom-4 right-3 z-10 flex items-center gap-2">
            <CornerChip label="Best" value={best.toLocaleString()} align="right" />
            <IconButton label="Restart level" onClick={onRestartLevel}>
              <RotateCcw className="h-4 w-4" />
            </IconButton>
          </div>
        </>
      )}

      {phase === "levelClear" && (
        <ResultModal
          accent={ACCENT}
          icon={
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: ACCENT, boxShadow: `0 0 22px ${ACCENT}77` }}
            >
              <FlaskConical className="h-6 w-6 text-black" strokeWidth={2.4} />
            </div>
          }
          eyebrow={`Level ${level} sorted`}
          headline="Everything in its place."
          stats={
            <>
              <StatTile label="Score" value={score.toLocaleString()} accent={ACCENT} />
              <StatTile label="Moves" value={moves} accent={ACCENT_SECONDARY} />
              <StatTile label="Best" value={best.toLocaleString()} accent={ACCENT} />
            </>
          }
          actions={
            <>
              <PrimaryCTA accent={ACCENT} onClick={onNextLevel} className="col-span-2">
                Next level
              </PrimaryCTA>
              <GhostButton onClick={onChangeMode}>Choose another game mode</GhostButton>
              <GhostButton onClick={onBack}>Home</GhostButton>
            </>
          }
        />
      )}

      {phase === "over" && (
        <ResultModal
          accent={ACCENT}
          icon={
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: isNewBest ? ACCENT : "rgba(255,255,255,0.12)" }}
            >
              <Trophy
                className="h-6 w-6"
                style={{ color: isNewBest ? "#04211f" : "rgba(255,255,255,0.8)" }}
                strokeWidth={2.4}
              />
            </div>
          }
          eyebrow={isNewBest ? "New personal best" : "Run finished"}
          headline={isNewBest ? "Cleanest sort yet." : "No pours left."}
          stats={
            <>
              <StatTile label="Score" value={stats.score.toLocaleString()} accent={ACCENT} />
              <StatTile label="Level" value={stats.level} accent={ACCENT_SECONDARY} />
              <StatTile label="Moves" value={stats.moves} accent={ACCENT} />
            </>
          }
          actions={
            <>
              <PrimaryCTA accent={ACCENT} onClick={onPlayAgain} className="col-span-2">
                Play again
              </PrimaryCTA>
              <GhostButton onClick={onChangeMode}>Change mode</GhostButton>
              <GhostButton onClick={onBack}>Home</GhostButton>
            </>
          }
        />
      )}
    </>
  );
}
