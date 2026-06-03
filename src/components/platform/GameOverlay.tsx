import type { ReactNode } from "react";

/**
 * Full-bleed game overlay used for pause / intro / mode-select surfaces.
 * Sits above the playfield and below the celebration modal.
 */
export function GameOverlay({
  accent = "#a78bfa",
  children,
}: {
  accent?: string;
  children: ReactNode;
}) {
  return (
    <div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6"
      style={{
        background: `radial-gradient(70% 50% at 50% 45%, ${accent}1a, rgba(0,0,0,0.72) 72%)`,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      {children}
    </div>
  );
}
