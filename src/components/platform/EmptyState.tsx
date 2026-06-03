import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  accent?: string;
}

/** Neutral, mood-aware empty state used wherever a list is empty. */
export function EmptyState({
  title,
  description,
  icon,
  action,
  accent = "#a78bfa",
}: EmptyStateProps) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center"
      style={{ boxShadow: `0 0 40px -10px ${accent}55 inset` }}
    >
      {icon ? <div className="mx-auto mb-3">{icon}</div> : (
        <div
          className="mx-auto mb-3 h-2 w-2 rounded-full hub-pulse"
          style={{ backgroundColor: accent, boxShadow: `0 0 18px ${accent}` }}
        />
      )}
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {description ? (
        <p className="mt-1 text-sm text-white/55">{description}</p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
