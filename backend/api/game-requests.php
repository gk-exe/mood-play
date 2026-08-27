<?php
/**
 * POST /api/game-requests.php  — store a player's game idea
 * GET  /api/game-requests.php  — list the most recent public ideas
 */

declare(strict_types=1);

require_once dirname(__DIR__) . '/config/database.php';

vg_cors();

const VG_REQUEST_CATEGORIES = ['new-game', 'feature', 'improvement', 'bug', 'other'];

vg_guard(function (): void {
    $method = $_SERVER['REQUEST_METHOD'] ?? '';

    if ($method === 'GET') {
        $limit = vg_int($_GET, 'limit', 1, 50) ?? 10;
        $stmt = vg_db()->prepare(
            'SELECT id, title, description, category, created_at
             FROM game_requests
             ORDER BY created_at DESC
             LIMIT :limit'
        );
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        vg_json(['ok' => true, 'requests' => $stmt->fetchAll()]);
    }

    vg_require_method('POST');

    $body = vg_body();
    $title = vg_str($body, 'title', 2, 80);
    $description = vg_str($body, 'description', 0, 600) ?? '';
    $category = vg_enum($body, 'category', VG_REQUEST_CATEGORIES);

    if ($title === null) {
        vg_fail('Title must be 2–80 characters.', 422);
    }
    if ($category === null) {
        vg_fail('Unknown category.', 422);
    }

    $stmt = vg_db()->prepare(
        'INSERT INTO game_requests (title, description, category)
         VALUES (:title, :description, :category)'
    );
    $stmt->execute([
        ':title'       => $title,
        ':description' => $description,
        ':category'    => $category,
    ]);

    vg_json([
        'ok' => true,
        'id' => (int) vg_db()->lastInsertId(),
    ], 201);
});
