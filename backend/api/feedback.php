<?php
/**
 * POST /api/feedback.php — store a reaction / bug report for a game
 * GET  /api/feedback.php?game_id=snake — recent feedback counts for a game
 */

declare(strict_types=1);

require_once dirname(__DIR__) . '/config/database.php';

vg_cors();

const VG_FEEDBACK_TYPES = ['love', 'meh', 'issue'];

vg_guard(function (): void {
    $method = $_SERVER['REQUEST_METHOD'] ?? '';

    if ($method === 'GET') {
        $gameId = vg_str($_GET, 'game_id', 1, 64);
        if ($gameId === null) {
            vg_fail('game_id is required.', 422);
        }
        $stmt = vg_db()->prepare(
            'SELECT type, COUNT(*) AS total
             FROM feedback
             WHERE game_id = :game_id
             GROUP BY type'
        );
        $stmt->execute([':game_id' => $gameId]);
        vg_json(['ok' => true, 'game_id' => $gameId, 'counts' => $stmt->fetchAll()]);
    }

    vg_require_method('POST');

    $body = vg_body();
    $type = vg_enum($body, 'type', VG_FEEDBACK_TYPES);
    $message = vg_str($body, 'message', 0, 280) ?? '';
    $gameId = vg_str($body, 'game_id', 1, 64);

    if ($type === null) {
        vg_fail('type must be one of: ' . implode(', ', VG_FEEDBACK_TYPES) . '.', 422);
    }
    if ($gameId === null) {
        vg_fail('game_id is required.', 422);
    }

    $stmt = vg_db()->prepare(
        'INSERT INTO feedback (type, message, game_id)
         VALUES (:type, :message, :game_id)'
    );
    $stmt->execute([
        ':type'    => $type,
        ':message' => $message,
        ':game_id' => $gameId,
    ]);

    vg_json(['ok' => true, 'id' => (int) vg_db()->lastInsertId()], 201);
});
