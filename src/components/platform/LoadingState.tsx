/** Full-bleed loading state used by Suspense fallbacks across the platform. */
export function LoadingState({ accent = "#e879f9" }: { accent?: string }) {
  return (
    <div className="flex h-[100dvh] w-full items-center justify-center bg-app">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full w-1/2 animate-pulse rounded-full"
          style={{ background: accent, boxShadow: `0 0 18px ${accent}` }}
        />
      </div>
    </div>
  );
}
