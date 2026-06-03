import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { MOODS } from "@/features/moods/data";
import { GAMES } from "@/games/registry";
import { THEMES } from "@/features/theme/types";

/**
 * Developer reference page — dev-only.
 *
 * Documents the platform's registries, routing rules, module standard,
 * theme/audio scaffolds and expansion strategy so future work doesn't
 * require reverse-engineering the repo.
 */
export const Route = createFileRoute("/dev/docs")({
  beforeLoad: () => {
    if (!import.meta.env.DEV) throw notFound();
  },
  component: DevDocs,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/50">
        {title}
      </h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-white/80">{children}</div>
    </section>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-xl bg-black/40 p-4 text-[12px] leading-relaxed text-white/85 ring-1 ring-white/10">
      <code>{children}</code>
    </pre>
  );
}

function DevDocs() {
  return (
    <AppShell>
      <div className="min-h-[100dvh] bg-app px-6 py-10">
        <Link to="/" className="text-xs uppercase tracking-[0.22em] text-white/50">
          ← Home
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">
          Platform Developer Reference
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Internal blueprint. Dev-only route. Keep in sync with{" "}
          <code className="rounded bg-white/5 px-1 py-0.5">docs/GAME_MODULE_STANDARD.md</code>.
        </p>

        <Section title="Architecture">
          <p>
            Mood-first arcade shell. The home page surfaces five mood categories; each mood
            resolves to a list of games via the registry; each game is a self-contained
            module under <code>src/games/</code>.
          </p>
          <Code>{`src/
├── components/platform/   reusable shell + game UI primitives
├── features/
│   ├── moods/             mood categories (data-driven)
│   ├── player/            type-only player data models
│   ├── audio/             audio architecture scaffold
│   └── theme/             theme engine scaffold
├── games/
│   ├── _shared/           cross-game HUD, anim, audio
│   ├── registry.ts        SINGLE source of truth for all games
│   └── <game-id>/         one folder per game
└── routes/
    ├── index.tsx          mood hub (home)
    ├── mood.$moodId.tsx   mood detail
    ├── play.$gameId.tsx   dynamic game host
    └── dev.docs.tsx       this page`}</Code>
        </Section>

        <Section title="Registries">
          <p>
            <strong>Games:</strong> <code>src/games/registry.ts</code>. {GAMES.length} entries
            ({GAMES.filter((g) => g.status === "live").length} live,{" "}
            {GAMES.filter((g) => g.comingSoon).length} coming soon).
          </p>
          <p>
            <strong>Moods:</strong> <code>src/features/moods/data.ts</code>. {MOODS.length}{" "}
            categories: {MOODS.map((m) => m.label).join(", ")}.
          </p>
          <p>
            Adding a new game requires <em>only</em> a registry entry plus a module folder.
          </p>
        </Section>

        <Section title="Routing">
          <p>
            TanStack Router, file-based. All gameplay flows through the dynamic host{" "}
            <code>/play/$gameId</code>, which resolves via the registry and either lazy-loads
            the game or falls back to the shared <code>ComingSoon</code> experience. Unknown
            ids never 404.
          </p>
          <Code>{`/                      Mood hub
/mood/$moodId          Mood detail + featured + game list
/play/$gameId          Dynamic game host (lazy + ComingSoon fallback)
/dev/docs              This page (DEV only)`}</Code>
        </Section>

        <Section title="Game Module Standard">
          <p>
            Every future game MUST follow this folder structure. See{" "}
            <code>docs/GAME_MODULE_STANDARD.md</code> for the full contract.
          </p>
          <Code>{`src/games/<game-id>/
├── index.tsx        default export of <Game/>
├── Game.tsx         top-level component (HUD + canvas + overlays)
├── constants.ts     palette, sizes, modes
├── types.ts         game-specific TS types
├── hooks/           useGameLoop, useInput, ...
├── components/      <GameHUD/>, overlays
├── utils/           pure helpers (physics, board, scoring)
└── assets/          (optional) thumbnails, sprites`}</Code>
          <p>
            Games MUST compose UI from <code>@/components/platform</code> and{" "}
            <code>@/games/_shared</code>. Do not fork HUD/overlay/celebration components per
            game.
          </p>
        </Section>

        <Section title="Theme System">
          <p>
            Tokens live in <code>src/styles.css</code>. The engine scaffold in{" "}
            <code>src/features/theme/types.ts</code> defines the contract for a future runtime
            switcher. Registered themes: {THEMES.map((t) => t.title).join(", ")}.
          </p>
        </Section>

        <Section title="Audio">
          <p>
            Tactile SFX synth at <code>src/games/_shared/audio.ts</code> — no assets shipped.
            The scaffold at <code>src/features/audio/types.ts</code> defines buckets (ui,
            gameplay, victory, ambience, transitions) and the loader contract a future
            asset-backed pack must implement.
          </p>
        </Section>

        <Section title="Future Expansion">
          <ul className="list-disc space-y-1 pl-5">
            <li>New game = registry entry + module folder. Nothing else changes.</li>
            <li>New mood = entry in <code>data.ts</code>. Mood pages adapt automatically.</li>
            <li>New theme = entry in <code>THEMES</code> + token overrides in styles.css.</li>
            <li>
              Player progression, multiplayer, backend, monetization — intentionally NOT
              wired. Type contracts at <code>src/features/player/types.ts</code> are ready
              for Lovable Cloud later.
            </li>
          </ul>
        </Section>
      </div>
    </AppShell>
  );
}
