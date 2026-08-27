<?php
/**
 * POST /api/scores.php — submit a score for a game
 * GET  /api/scores.php?game_id=snake&limit=10 — leaderboard for one game
 */

declare(strict_types=1);

require_once dirname(__DIR__) . '/config/database.php';

vg_cors();

const VG_MAX_SCORE = 100000000;

vg_guard(function (): void {
    $method = $_SERVER['REQUEST_METHOD'] ?? '';

    if ($method === 'GET') {
        $gameId = vg_str($_GET, 'game_id', 1, 64);
        if ($gameId === null) {
            vg_fail('game_id is required.', 422);
        }
        $limit = vg_int($_GET, 'limit', 1, 50) ?? 10;

        $stmt = vg_db()->prepare(
            'SELECT id, game_id, player_name, score, created_at
             FROM scores
             WHERE game_id = :game_id
             ORDER BY score DESC, created_at ASC
             LIMIT :limit'
        );
        $stmt->bindValue(':game_id', $gameId);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        vg_json(['ok' => true, 'game_id' => $gameId, 'scores' => $stmt->fetchAll()]);
    }

    vg_require_method('POST');

    $body = vg_body();
    $gameId = vg_str($body, 'game_id', 1, 64);
    $score = vg_int($body, 'score', 0, VG_MAX_SCORE);
    // Anonymous play is the default — a name is optional.
    $player = vg_str($body, 'player_name', 1, 24) ?? 'anonymous';

    if ($gameId === null) {
        vg_fail('game_id is required.', 422);
    }
    if ($score === null) {
        vg_fail('score must be an integer between 0 and ' . VG_MAX_SCORE . '.', 422);
    }

    $stmt = vg_db()->prepare(
        'INSERT INTO scores (game_id, player_name, score)
         VALUES (:game_id, :player_name, :score)'
    );
    $stmt->execute([
        ':game_id'     => $gameId,
        ':player_name' => $player,
        ':score'       => $score,
    ]);

    vg_json(['ok' => true, 'id' => (int) vg_db()->lastInsertId()], 201);
});
