import { ArrowLeft, Pause, Play, Trophy, Volume2, VolumeX, Worm } from "lucide-react";
import { CornerChip, GhostButton, IconButton, PrimaryCTA, StatTile } from "@/games/_shared";
import { ResultModal } from "@/components/platform";
import { ACCENT, ACCENT_SECONDARY, getMode, type ModeId } from "../constants";
import type { SnakePhase, SnakeStats } from "../types";

interface Props {
  phase: SnakePhase;
  mode: ModeId;
  score: number;
  length: number;
  best: number;
  stats: SnakeStats;
  soundOn: boolean;
  onBack: () => void;
  onTogglePause: () => void;
  onRestart: () => void;
  onChangeMode: () => void;
  onToggleSound: () => void;
}

export function SnakeHUD({
  phase,
  mode,
  score,
  length,
  best,
  stats,
  soundOn,
  onBack,
  onTogglePause,
  onRestart,
  onChangeMode,
  onToggleSound,
}: Props) {
  const cfg = getMode(mode);
  const isNewBest = phase === "over" && stats.score > 0 && stats.score >= best;

  return (
    <>
      <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-start gap-2">
        <IconButton label="Back" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" strokeWidth={2.4} />
        </IconButton>
        <CornerChip
          label={cfg.label}
          value={score.toLocaleString()}
          sub={
            <div className="text-[10px] font-bold tabular-nums" style={{ color: ACCENT }}>
              {length} long
            </div>
          }
        />
      </div>

      <div className="pointer-events-none absolute right-3 top-3 z-10 flex items-start gap-2">
        <CornerChip
          label="Best"
          value={best.toLocaleString()}
          align="right"
        />
        <IconButton label={soundOn ? "Mute" : "Unmute"} onClick={onToggleSound}>
          {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </IconButton>
        <IconButton
          label={phase === "paused" ? "Resume" : "Pause"}
          onClick={onTogglePause}
        >
          {phase === "paused" ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </IconButton>
      </div>

      {phase === "over" && (
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
              <Worm
                className="h-7 w-7"
                style={{ color: ACCENT, filter: `drop-shadow(0 0 6px ${ACCENT}88)` }}
              />
            )
          }
          eyebrow={isNewBest ? "New personal best" : "Run over"}
          headline={isNewBest ? "Longest one yet." : "Good run."}
          stats={
            <>
              <StatTile label="Score" value={stats.score.toLocaleString()} accent={ACCENT} />
              <StatTile
                label="Best"
                value={Math.max(best, stats.score).toLocaleString()}
                accent={ACCENT_SECONDARY}
              />
              <StatTile label="Length" value={stats.length} accent={ACCENT} />
              <StatTile label="Food" value={stats.food} accent={ACCENT_SECONDARY} />
              <StatTile
                label="Time"
                value={`${Math.round(stats.timeMs / 1000)}s`}
                accent={ACCENT}
              />
              <StatTile label="Mode" value={cfg.label.split(" ")[0]} accent={ACCENT_SECONDARY} />
            </>
          }
          actions={
            <>
              <PrimaryCTA accent={ACCENT} onClick={onRestart}>
                Play again
              </PrimaryCTA>
              <GhostButton onClick={onChangeMode}>Change mode</GhostButton>
              <GhostButton onClick={onBack} className="col-span-2">
                Home
              </GhostButton>
            </>
          }
        />
      )}
    </>
  );
}
