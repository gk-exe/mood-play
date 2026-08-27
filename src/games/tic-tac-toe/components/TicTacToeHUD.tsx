import { ArrowLeft, Grid3x3, Trophy, Volume2, VolumeX } from "lucide-react";
import { CornerChip, GhostButton, IconButton, PrimaryCTA, StatTile } from "@/games/_shared";
import { ResultModal } from "@/components/platform";
import { ACCENT, ACCENT_SECONDARY, getMode, type ModeId } from "../constants";
import type { Outcome, Record, TttPhase } from "../types";

interface Props {
  phase: TttPhase;
  mode: ModeId;
  record: Record;
  outcome: Outcome | null;
  thinking: boolean;
  soundOn: boolean;
  onBack: () => void;
  onRestart: () => void;
  onChangeMode: () => void;
  onToggleSound: () => void;
}

const COPY: golangless = {} as never;
