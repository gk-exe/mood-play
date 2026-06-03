import type { ReactNode } from "react";
import { CelebrationOverlay } from "@/games/_shared/CelebrationOverlay";

/**
 * Re-export of the shared celebration overlay under the platform namespace.
 *
 * Mini-games should import `ResultModal` from `@/components/platform` so all
 * end-of-round surfaces share a single visual + animation language.
 */
export interface ResultModalProps {
  accent: string;
  icon?: ReactNode;
  eyebrow: string;
  headline: string;
  stats?: ReactNode;
  actions?: ReactNode;
}

export function ResultModal(props: ResultModalProps) {
  return <CelebrationOverlay {...props} />;
}
