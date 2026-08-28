<?php
/**
 * GET /api/games.php — catalogue snapshot for the platform.
 *
 * Read-only. Returns the registered games plus lightweight community
 * signals (feedback counts, top score) so any client — including a plain
 * HTML/PHP page — can render the library without the React bundle.
 */

declare(strict_types=1);

require_once dirname(__DIR__) . '/config/database.php';

vg_cors();
vg_require_method('GET');

/**
 * Mirror of src/games/registry.ts. Kept as static data because the
 * registry is code-owned on the frontend; the backend only augments it
 * with database-derived stats.
 */
const VG_GAMES = [
    ['id' => 'bubble-shooter', 'title' => 'Bubble Shooter', 'mood' => 'chill-zone', 'status' => 'live'],
    ['id' => 'block-puzzle',   'title' => 'Block Puzzle',   'mood' => 'brain-boost', 'status' => 'live'],
    ['id' => 'survival-rush',  'title' => 'Survival Rush',  'mood' => 'action-rush', 'status' => 'live'],
    ['id' => 'memory-match',   'title' => 'Memory Match',   'mood' => 'brain-boost', 'status' => 'live'],
    ['id' => 'twenty48',       'title' => '2048',           'mood' => 'satisfaction-lab', 'status' => 'live'],
    ['id' => 'tap-reflex',     'title' => 'Tap Reflex',     'mood' => 'quick-hits',  'status' => 'live'],
    ['id' => 'snake',          'title' => 'Snake',          'mood' => 'quick-hits',  'status' => 'live'],
    ['id' => 'tic-tac-toe',    'title' => 'Tic-Tac-Toe',    'mood' => 'brain-boost', 'status' => 'live'],
    ['id' => 'endless-runner', 'title' => 'Endless Runner', 'mood' => 'action-rush', 'status' => 'coming-soon'],
    ['id' => 'chess',          'title' => 'Chess',          'mood' => 'brain-boost', 'status' => 'coming-soon'],
    ['id' => 'sorting-master', 'title' => 'Sorting Master', 'mood' => 'satisfaction-lab', 'status' => 'coming-soon'],
    ['id' => 'word-puzzle',    'title' => 'Word Puzzle',    'mood' => 'satisfaction-lab', 'status' => 'coming-soon'],
    ['id' => 'reaction-challenge', 'title' => 'Reaction Challenge', 'mood' => 'quick-hits', 'status' => 'coming-soon'],
];

vg_guard(function (): void {
    $db = vg_db();

    $tops = [];
    foreach ($db->query('SELECT game_id, MAX(score) AS top FROM scores GROUP BY game_id') as $row) {
        $tops[$row['game_id']] = (int) $row['top'];
    }

    $loves = [];
    $stmt = $db->prepare('SELECT game_id, COUNT(*) AS total FROM feedback WHERE type = :type GROUP BY game_id');
    $stmt->execute([':type' => 'love']);
    foreach ($stmt->fetchAll() as $row) {
        $loves[$row['game_id']] = (int) $row['total'];
    }

    $games = array_map(static function (array $g) use ($tops, $loves): array {
        $g['top_score'] = $tops[$g['id']] ?? null;
        $g['loves']     = $loves[$g['id']] ?? 0;
        return $g;
    }, VG_GAMES);

    vg_json([
        'ok'    => true,
        'count' => count($games),
        'games' => $games,
    ]);
});
