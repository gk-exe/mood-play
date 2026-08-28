# Vibe Games — LAMP Backend

A genuine **Linux + Apache + MySQL + PHP** backend for Vibe Games. It is
*additive*: the React frontend stays fully playable without it (localStorage
fallback), and persists to MySQL whenever the API base URL is configured.

## Stack roles

| Layer | Technology | Role in Vibe Games |
| --- | --- | --- |
| **L**inux | Ubuntu/Debian host | Runs the web server, PHP-FPM and MySQL; file permissions and env isolation |
| **A**pache | Apache 2.4 + `mod_rewrite`, `mod_headers` | Serves the built frontend and routes `/api/*.php` to PHP; sets security headers, denies `.env`/`.sql` |
| **M**ySQL | MySQL 8 / MariaDB | Stores game requests, feedback, scores, and the game catalogue |
| **P**HP | PHP 8.1+ with PDO MySQL | JSON REST endpoints, validation, prepared statements |
| Frontend | Vite build output | Static HTML/CSS/JS served by Apache |
| React | React 19 + TanStack Router | Hub UI, routing, game shell, forms |
| Canvas / DOM | `<canvas>` + RAF, DOM grids | Real-time games (Bubble Shooter, Survival Rush, Tap Reflex, Snake) and grid games (Block Puzzle, 2048, Memory Match, Tic-Tac-Toe) |

## Layout

```
backend/
├── config/database.php     # PDO bootstrap + validation/JSON helpers (env-based credentials)
├── api/game-requests.php   # POST create / GET recent ideas
├── api/feedback.php        # POST reaction / GET per-game counts
├── api/scores.php          # POST score / GET leaderboard
├── api/games.php           # GET catalogue + community stats
├── schema.sql              # Database, tables, indexes, seed catalogue
├── .env.example            # Credential template
└── .htaccess               # Apache hardening
```

## Setup

```bash
sudo apt install apache2 mysql-server php php-mysql libapache2-mod-php
mysql -u root -p < backend/schema.sql
cp backend/.env.example backend/.env   # then edit credentials
sudo cp -r backend /var/www/vibe-games/backend
sudo chown -R www-data:www-data /var/www/vibe-games
sudo a2enmod headers rewrite && sudo systemctl restart apache2
```

Point the frontend at it by setting `VITE_API_BASE_URL=https://your-host/backend/api`
before building. With the variable unset, the app silently uses localStorage only.

Smoke test:

```bash
curl -s https://your-host/backend/api/games.php
curl -s -X POST https://your-host/backend/api/feedback.php \
  -H 'Content-Type: application/json' \
  -d '{"game_id":"snake","type":"love"}'
```

## Security model

- **Prepared statements everywhere** — `PDO::ATTR_EMULATE_PREPARES = false`, so
  no user value is ever interpolated into SQL.
- **Strict input validation** — every field is type-checked, length-bounded and
  enum-restricted (`vg_str`, `vg_enum`, `vg_int`); bodies above 20 KB are rejected.
- **Control characters stripped** on ingest; output is JSON, and React escapes on
  render, so stored text can never execute.
- **No credentials in source** — read from the environment or a git-ignored
  `backend/.env`; Apache denies direct access to `.env`, `.sql` and `config/`.
- **Errors never leak** — SQL/driver messages go to the Apache error log; clients
  receive a generic `{"ok":false,"error":"Server error."}`.
- **CORS locked down** — set `ALLOWED_ORIGIN` to the exact site origin in production.
- **Least privilege** — the app DB user needs only `SELECT, INSERT`.

## API summary

| Method | Endpoint | Body / Query | Response |
| --- | --- | --- | --- |
| POST | `/api/game-requests.php` | `title` (2–80), `description` (≤600), `category` enum | `{ok, id}` 201 |
| GET | `/api/game-requests.php` | `limit` (1–50) | `{ok, requests[]}` |
| POST | `/api/feedback.php` | `game_id`, `type` (love/meh/issue), `message` (≤280) | `{ok, id}` 201 |
| GET | `/api/feedback.php` | `game_id` | `{ok, counts[]}` |
| POST | `/api/scores.php` | `game_id`, `score` (int), `player_name` (≤24) | `{ok, id}` 201 |
| GET | `/api/scores.php` | `game_id`, `limit` | `{ok, scores[]}` |
| GET | `/api/games.php` | — | `{ok, count, games[]}` |

## Known environment limitation

The Lovable preview/published deployment runs on an edge runtime, not Apache,
so these PHP endpoints are **not** executed there. They are built to run on a
real LAMP host (college server, XAMPP, or any Linux VM) — which is exactly why
the frontend treats the API as optional and keeps localStorage as the fallback.
