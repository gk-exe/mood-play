import { ArrowLeft, Brain, RotateCcw, Trophy, Volume2, VolumeX } from "lucide-react";
import {
  CelebrationOverlay,
  CornerChip,
  GhostButton,
  IconButton,
  PrimaryCTA,
  StatTile,
} from "@/games/_shared";
import { ACCENT, ACCENT_SECONDARY } from "../constants";
import type { GamePhase } from "../types";

interface Props {
  level: number;
  totalLevels: number;
  moves: number;
  streak: number;
  bestStreak: number;
  elapsedMs: number;
  phase: GamePhase;
  bestTotalTime: number | null;
  soundOn: boolean;
  onBack: () => void;
  onRestart: () => void;
  onToggleSound: () => void;
}

function fmtTime(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const rs = s % 60;
  return `${m}:${rs.toString().padStart(2, "0")}`;
}

export function MemoryMatchHUD({
  level,
  totalLevels,
  moves,
  streak,
  bestStreak,
  elapsedMs,
  phase,
  bestTotalTime,
  soundOn,
  onBack,
  onRestart,
  onToggleSound,
}: Props) {
  const isNewBest =
    phase === "gameComplete" &&
    bestTotalTime !== null &&
    elapsedMs > 0 &&
    elapsedMs <= bestTotalTime;

  return (
    <>
      {/* Top-left: back + level */}
      <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-start gap-2">
        <IconButton label="Back" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" strokeWidth={2.4} />
        </IconButton>
        <CornerChip
          label="Level"
          value={`${level} / ${totalLevels}`}
          sub={
            phase === "playing" || phase === "checking" ? (
              <div
                className="text-[10px] font-bold tabular-nums"
                style={{ color: ACCENT }}
              >
                {fmtTime(elapsedMs)}
              </div>
            ) : null
          }
        />
      </div>

      {/* Top-right: streak + sound + restart */}
      <div className="pointer-events-none absolute right-3 top-3 z-10 flex items-start gap-2">
        <CornerChip
          label="Streak"
          value={streak}
          align="right"
          sub={
            bestStreak > 0 ? (
              <div className="text-[10px] tabular-nums text-white/50">
                Best {bestStreak}
              </div>
            ) : null
          }
        />
        <IconButton
          label={soundOn ? "Mute" : "Unmute"}
          onClick={onToggleSound}
        >
          {soundOn ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
        </IconButton>
        <IconButton label="Restart" onClick={onRestart}>
          <RotateCcw className="h-4 w-4" />
        </IconButton>
      </div>

      {/* Level complete overlay */}
      {phase === "levelComplete" && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6"
          style={{
            background:
              "radial-gradient(70% 50% at 50% 45%, rgba(250,204,21,0.12), rgba(0,0,0,0.72) 72%)",
            backdropFilter: "blur(8px)",
          }}
        >
          <p
            className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/65"
            style={{ textShadow: `0 0 12px ${ACCENT}66` }}
          >
            Level {level} complete
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-white">
            Nice memory.
          </p>
          <p className="mt-2 text-xs text-white/50">
            Level {level + 1} incoming…
          </p>
        </div>
      )}

      {/* Game complete celebration */}
      {phase === "gameComplete" && (
        <CelebrationOverlay
          accent={ACCENT}
          icon={
            isNewBest ? (
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{
                  background: ACCENT,
                  boxShadow: `0 0 22px ${ACCENT}88`,
                }}
              >
                <Trophy className="h-6 w-6 text-black" strokeWidth={2.5} />
              </div>
            ) : (
              <Brain
                className="h-7 w-7"
                style={{
                  color: ACCENT,
                  filter: `drop-shadow(0 0 6px ${ACCENT}88)`,
                }}
              />
            )
          }
          eyebrow={isNewBest ? "New best time" : "All levels cleared"}
          headline={isNewBest ? "Unforgettable." : "Sharp mind."}
          stats={
            <>
              <StatTile label="Time" value={fmtTime(elapsedMs)} accent={ACCENT} />
              <StatTile label="Moves" value={moves} accent={ACCENT_SECONDARY} />
              <StatTile label="Best streak" value={bestStreak} accent={ACCENT} />
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
