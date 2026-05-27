import type { ReactNode } from "react";

/**
 * Mobile-first app shell.
 * - Centered max-width column so it still feels app-like on desktop.
 * - Respects iOS safe areas.
 * - Soft canvas background — the visual energy comes from mood cards, not chrome.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] w-full bg-app">
      <div
        className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
