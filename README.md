# Vibe Games

A mood-first mini-game arcade for mobile browsers. Pick a vibe, play a short
game, come back tomorrow. Built as a full **LAMP + React** web application.

## Live library

| Game | Mood | Rendering |
| --- | --- | --- |
| Bubble Shooter | Chill Zone | Canvas + RAF |
| Block Puzzle | Brain Boost | DOM grid + drag |
| Survival Rush | Action Rush | Canvas + RAF |
| Memory Match | Brain Boost | DOM 3D flip cards |
| 2048 | Satisfaction Lab | DOM grid |
| Tap Reflex | Quick Hits | DOM + RAF engine |
| Snake | Quick Hits | DOM grid + fixed-timestep RAF |
| Tic-Tac-Toe | Brain Boost | DOM grid + minimax bot |

Coming soon: Endless Runner, Chess, Sorting Master, Word Puzzle, Reaction Challenge.

## Stack roles

| Layer | Technology | Responsibility |
| --- | --- | --- |
| **Linux** | Ubuntu/Debian host | Runs Apache, PHP and MySQL; process isolation, file permissions, environment variables holding DB credentials |
| **Apache** | Apache 2.4 (`mod_php`/PHP-FPM, `mod_headers`) | Serves the built static frontend, exposes `/backend/api/*.php`, applies security headers, denies access to `.env`, `.sql` and `config/` |
| **MySQL** | MySQL 8 / MariaDB | Persists game requests, feedback reactions, score submissions and the game catalogue (`backend/schema.sql`) |
| **PHP** | PHP 8.1+ with PDO MySQL | REST/JSON endpoints, input validation, prepared statements, error handling |
| **Frontend** | Vite build (HTML/CSS/JS), Tailwind CSS v4 | Static assets served by Apache; design tokens and responsive mobile-first layout |
| **React** | React 19 + TanStack Start/Router | Hub UI, mood pages, routing, game shell, daily challenge, forms and state |
| **Canvas / DOM** | `<canvas>` 2D + `requestAnimationFrame`, DOM grids | Real-time game rendering and input; mutable refs keep the render loop out of React |

## Architecture

```
src/
├── routes/              # TanStack file routes (hub, moods, /play/$gameId, suggest, roadmap, about)
├── games/               # One folder per game + _shared/ primitives (ArcadeHUD, Sfx, anim)
├── games/registry.ts    # Single source of truth: add a game = 1 row + 1 folder
├── features/            # moods, player stats, daily challenge, feedback store, api client
└── components/platform/ # ResultModal, GameOverlay, GameCard, FeedbackBar, ...
backend/                 # PHP + MySQL API (see backend/README.md)
docs/                    # Module standard, roadmap, blueprints, design system
```

## Backend (optional but real)

The PHP/MySQL API is **additive**. Set `VITE_API_BASE_URL` to the deployed
`backend/api` folder and suggestions, feedback and scores are persisted to
MySQL; leave it unset and everything falls back to localStorage so the arcade
stays fully playable. Setup, endpoints and the security model are documented in
[`backend/README.md`](backend/README.md).

Note: the hosted Lovable deployment runs on an edge runtime and does not execute
PHP — the LAMP backend is intended for a Linux/Apache host (college server,
XAMPP, or any VM).

## Development

```bash
bun install
bun run dev        # http://localhost:8080
```

Adding a game: follow [`docs/GAME_MODULE_STANDARD.md`](docs/GAME_MODULE_STANDARD.md).
