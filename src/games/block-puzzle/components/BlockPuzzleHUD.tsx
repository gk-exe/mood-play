import { ArrowLeft, RotateCcw, Sparkles, Trophy, Volume2, VolumeX } from "lucide-react";
import {
  CelebrationOverlay,
  CornerChip,
  GhostButton,
  IconButton,
  PrimaryCTA,
  StatTile,
} from "@/games/_shared";

interface Props {
  score: number;
  best: number;
  combo: number;
  bestCombo: number;
  cleared: number;
  gameOver: boolean;
  soundOn: boolean;
  onBack: () => void;
  onRestart: () => void;
  onToggleSound: () => void;
}

const ACCENT = "#b48aea";
const ACCENT2 = "#5fd9bc";

export function BlockPuzzleHUD({
  score, best, combo, bestCombo, cleared, gameOver,
  soundOn, onBack, onRestart, onToggleSound,
}: Props) {
  const isNewBest = score > 0 && score >= best;
  return (
    <>
      <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-start gap-2">
        <IconButton label="Back" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" strokeWidth={2.4} />
        </IconButton>
        <CornerChip
          label="Score"
          value={score}
          sub={
            combo >= 2 && !gameOver ? (
              <div
                className="text-[10px] font-bold tabular-nums"
                style={{ color: ACCENT, textShadow: `0 0 6px ${ACCENT}66` }}
              >
                ×{combo} combo
              </div>
            ) : null
          }
        />
      </div>

      <div className="pointer-events-none absolute right-3 top-3 z-10 flex items-start gap-2">
        <CornerChip label="Best" value={best} align="right" />
        <IconButton label={soundOn ? "Mute" : "Unmute"} onClick={onToggleSound}>
          {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </IconButton>
        <IconButton label="Restart" onClick={onRestart}>
          <RotateCcw className="h-4 w-4" />
        </IconButton>
      </div>

      {gameOver && (
        <CelebrationOverlay
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
          eyebrow={isNewBest ? "New best" : "No more moves"}
          headline={isNewBest ? "Stunning." : "Good run."}
          stats={
            <>
              <StatTile label="Score" value={score} accent={ACCENT} />
              <StatTile label="Combo" value={`×${bestCombo}`} accent={ACCENT2} />
              <StatTile label="Cleared" value={cleared} accent={ACCENT} />
            </>
          }
          actions={
            <>
              <PrimaryCTA accent={ACCENT} onClick={onRestart} className="col-span-2">
                Play again
              </PrimaryCTA>
              <GhostButton onClick={onBack} className="col-span-2">Back to arcade</GhostButton>
            </>
          }
        />
      )}
    </>
  );
}
