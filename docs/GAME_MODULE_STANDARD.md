# Game Module Standard

This document is the **mandatory contract** every mini-game in the platform
must follow. It exists so future games inherit the platform's emotional and
technical consistency without bespoke wiring.

## Folder structure

```
src/games/<game-id>/
├── index.tsx          # default export of the game component
├── Game.tsx           # top-level: HUD + playfield + overlays
├── constants.ts       # palette, sizes, modes, scoring tuning
├── types.ts           # game-specific TS types
├── hooks/             # useGameLoop, useInput, useScoring, ...
├── components/        # <GameHUD/>, mode-select, intro overlays
├── utils/             # pure helpers (physics, board, generators)
└── assets/            # optional — thumbnails, sprites, sounds
```

`index.tsx` MUST default-export the playable component so the registry can
lazy-load it:

```ts
export { Game as default } from "./Game";
```

## Registry entry

Add ONE row to `src/games/registry.ts`. No other file in the project should
need to change to add a new game.

```ts
game({
  id: "my-game",
  title: "My Game",
  shortDescription: "One-line vibe.",
  moodCategory: "chill-zone",
  difficulty: "medium",
  status: "live",          // or "coming-soon"
  estimatedPlayTime: 5,
  componentLoader: lazy(() => import("./my-game")),
}),
```

## Required compositions

Every game MUST compose UI from the shared primitives:

- HUD chips, icon buttons, stat tiles → `@/games/_shared/ArcadeHUD`
- End-of-round ceremony            → `@/components/platform` (`ResultModal`)
- Full-bleed pause / intro overlays → `@/components/platform` (`GameOverlay`)
- Tactile SFX + haptics            → `@/games/_shared/audio` (`Sfx`)
- Animation timing tokens          → `@/games/_shared/anim` (`EASE`, `DURATION`)

Do NOT fork HUD, celebration or overlay components per game.

## Sacred playfield rule

The playfield is sacred. HUD elements live only in screen corners. No
central chips, no full-width banners during gameplay. Pulses and
celebrations are allowed only between rounds.

## Mode naming

Mode names are player-facing first, designer-facing second. Use emotionally
direct labels ("Easy Pop", "Chain Blast") over abstract ones ("Combo Rush").

## Performance

- Single canvas, RAF loop, mutable `stateRef` — no React re-renders during play.
- Particle counts and glow intensity tuned for long-session comfort.
- All audio is procedurally generated until a real audio pack ships.

## Status lifecycle

```
coming-soon → beta → live
```

The dynamic host route `/play/$gameId` automatically renders the shared
`ComingSoon` experience for any game whose `componentLoader` is `null` or
whose `status` is `"coming-soon"`. You can register a game months before
its module folder exists.
