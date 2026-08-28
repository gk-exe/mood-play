-- Vibe Games — MySQL schema (LAMP stack)
-- Usage:  mysql -u root -p < backend/schema.sql

CREATE DATABASE IF NOT EXISTS vibe_games
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE vibe_games;

-- Player-submitted game ideas / feature wishes / bug reports.
CREATE TABLE IF NOT EXISTS game_requests (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title       VARCHAR(80)  NOT NULL,
  description VARCHAR(600) NOT NULL DEFAULT '',
  category    ENUM('new-game','feature','improvement','bug','other') NOT NULL DEFAULT 'new-game',
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_game_requests_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Per-game reactions from the in-app feedback bar.
CREATE TABLE IF NOT EXISTS feedback (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  game_id    VARCHAR(64)  NOT NULL,
  type       ENUM('love','meh','issue') NOT NULL,
  message    VARCHAR(280) NOT NULL DEFAULT '',
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_feedback_game (game_id, type),
  KEY idx_feedback_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Score submissions (anonymous by default).
CREATE TABLE IF NOT EXISTS scores (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  game_id     VARCHAR(64)  NOT NULL,
  player_name VARCHAR(24)  NOT NULL DEFAULT 'anonymous',
  score       INT UNSIGNED NOT NULL DEFAULT 0,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_scores_leaderboard (game_id, score DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional catalogue table for admin-managed metadata.
CREATE TABLE IF NOT EXISTS games (
  id          VARCHAR(64)  NOT NULL,
  title       VARCHAR(80)  NOT NULL,
  mood        VARCHAR(32)  NOT NULL,
  status      ENUM('live','beta','coming-soon') NOT NULL DEFAULT 'coming-soon',
  description VARCHAR(160) NOT NULL DEFAULT '',
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO games (id, title, mood, status, description) VALUES
  ('bubble-shooter', 'Bubble Shooter', 'chill-zone',       'live',        'Pop, chain, ride the streak.'),
  ('block-puzzle',   'Block Puzzle',   'brain-boost',      'live',        'Drop, fit, clear. Just one more.'),
  ('survival-rush',  'Survival Rush',  'action-rush',      'live',        'Survive the incoming waves and see how long you can last.'),
  ('memory-match',   'Memory Match',   'brain-boost',      'live',        'See it. Hold it. Match it.'),
  ('twenty48',       '2048',           'satisfaction-lab', 'live',        'Slide, merge, chase the big tile.'),
  ('tap-reflex',     'Tap Reflex',     'quick-hits',       'live',        'Blink. Tap. Survive.'),
  ('snake',          'Snake',          'quick-hits',       'live',        'Swipe, eat, grow. Do not bite yourself.'),
  ('tic-tac-toe',    'Tic-Tac-Toe',    'brain-boost',      'live',        'Three in a row. Outthink the bot.')
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  mood = VALUES(mood),
  status = VALUES(status),
  description = VALUES(description);

-- Least-privilege application user (change the password before deploying).
-- CREATE USER 'vibe_games'@'localhost' IDENTIFIED BY 'change-me';
-- GRANT SELECT, INSERT ON vibe_games.* TO 'vibe_games'@'localhost';
-- FLUSH PRIVILEGES;
