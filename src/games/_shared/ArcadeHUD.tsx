import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Reusable HUD primitives shared by every mini-game.
 *
 * Design rules (do not bend per-game):
 *  - Corners only. The playfield is sacred.
 *  - Semi-transparent dark chips with thin white rims for readability on any backdrop.
 *  - Compact, low-obstruction, never pulsing during gameplay.
 *  - One accent color per game, applied sparingly to numbers and CTAs only.
 */

const CHIP_BASE =
  "pointer-events-none rounded-xl bg-black/35 px-3 py-1.5 ring-1 ring-white/10 backdrop-blur-md";

const LABEL =
  "text-[9px] font-semibold uppercase tracking-[0.18em] text-white/55";

const VALUE = "text-base font-bold tabular-nums leading-tight text-white";

interface CornerChipProps {
  label: string;
  value: ReactNode;
  align?: "left" | "right";
  sub?: ReactNode;
  className?: string;
}

/** A labelled value chip. Use 1 per corner — never stack visually competing chips. */
export function CornerChip({ label, value, align = "left", sub, className }: CornerChipProps) {
  return (
    <div className={cn(CHIP_BASE, align === "right" && "text-right", className)}>
      <div className={LABEL}>{label}</div>
      <div className={VALUE}>{value}</div>
      {sub ? <div className="mt-0.5">{sub}</div> : null}
    </div>
  );
}

interface IconButtonProps extends ComponentProps<"button"> {
  label: string;
}

/** Round 36px icon button. Use for back / restart / pause. Pointer-events on. */
export function IconButton({ label, className, children, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full",
        "bg-black/40 text-white/90 ring-1 ring-white/10 backdrop-blur-md",
        "transition active:scale-95 hover:bg-black/55",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

interface StatTileProps {
  label: string;
  value: ReactNode;
  /** Hex accent for the value glow — kept very subtle. */
  accent?: string;
}

/** Stat tile used inside celebration overlays. */
export function StatTile({ label, value, accent }: StatTileProps) {
  return (
    <div className="rounded-xl bg-white/[0.04] px-2 py-2 text-center ring-1 ring-white/10 backdrop-blur">
      <div className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/55">{label}</div>
      <div
        className="mt-0.5 text-base font-bold tabular-nums text-white"
        style={accent ? { textShadow: `0 0 8px ${accent}55` } : undefined}
      >
        {value}
      </div>
    </div>
  );
}

interface PrimaryCTAProps extends ComponentProps<"button"> {
  accent: string;
}

/** The single colored button in a celebration overlay. Use sparingly. */
export function PrimaryCTA({ accent, className, children, ...rest }: PrimaryCTAProps) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-2xl px-4 py-3 text-sm font-bold text-black transition active:scale-95",
        className,
      )}
      style={{
        background: accent,
        boxShadow: `0 8px 20px -10px ${accent}cc`,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

interface GhostButtonProps extends ComponentProps<"button"> {}

/** Secondary action button used next to a PrimaryCTA. */
export function GhostButton({ className, children, ...rest }: GhostButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-xl bg-white/[0.06] px-3 py-2.5 text-xs font-semibold text-white/85",
        "ring-1 ring-white/10 transition active:scale-95 hover:bg-white/[0.1]",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
