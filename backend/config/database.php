<?php
/**
 * Vibe Games — database bootstrap + shared API helpers.
 *
 * Credentials NEVER live in source. They are read from the environment
 * (Apache SetEnv / .env exported by the host / docker env). A local
 * backend/.env file is supported for development only and is git-ignored.
 */

declare(strict_types=1);

/** Loads KEY=VALUE pairs from backend/.env when present (development only). */
function vg_load_env(): void
{
    static $loaded = false;
    if ($loaded) {
        return;
    }
    $loaded = true;

    $path = dirname(__DIR__) . '/.env';
    if (!is_readable($path)) {
        return;
    }
    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value, " \t\n\r\0\x0B\"'");
        if (getenv($key) === false) {
            putenv("$key=$value");
        }
    }
}

function vg_env(string $key, ?string $default = null): ?string
{
    vg_load_env();
    $value = getenv($key);
    return ($value === false || $value === '') ? $default : $value;
}

/** Single shared PDO connection. Throws on failure — never leaks credentials. */
function vg_db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $host = vg_env('DB_HOST', '127.0.0.1');
    $port = vg_env('DB_PORT', '3306');
    $name = vg_env('DB_NAME', 'vibe_games');
    $user = vg_env('DB_USER', 'vibe_games');
    $pass = vg_env('DB_PASS', '');

    $dsn = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";

    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        // Real prepared statements — no client-side interpolation.
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);

    return $pdo;
}

/* ------------------------------------------------------------------ */
/* HTTP helpers                                                        */
/* ------------------------------------------------------------------ */

function vg_cors(): void
{
    $allowed = vg_env('ALLOWED_ORIGIN', '*');
    header('Access-Control-Allow-Origin: ' . $allowed);
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Vary: Origin');

    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function vg_json(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function vg_fail(string $message, int $status = 400, array $extra = []): void
{
    vg_json(array_merge(['ok' => false, 'error' => $message], $extra), $status);
}

/** Decodes a JSON request body into an array. Rejects anything else. */
function vg_body(): array
{
    $raw = file_get_contents('php://input') ?: '';
    if (strlen($raw) > 20000) {
        vg_fail('Payload too large.', 413);
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        vg_fail('Expected a JSON object body.', 400);
    }
    return $data;
}

function vg_require_method(string $method): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== $method) {
        header('Allow: ' . $method . ', OPTIONS');
        vg_fail('Method not allowed.', 405);
    }
}

/** Trimmed string field with length bounds. Returns null when invalid. */
function vg_str(array $src, string $key, int $min, int $max): ?string
{
    $value = $src[$key] ?? null;
    if (!is_string($value)) {
        return null;
    }
    $value = trim($value);
    // Strip control characters; storage stays plain text, escaping is the client's job.
    $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $value) ?? '';
    $len = mb_strlen($value);
    if ($len < $min || $len > $max) {
        return null;
    }
    return $value;
}

function vg_enum(array $src, string $key, array $allowed): ?string
{
    $value = $src[$key] ?? null;
    return (is_string($value) && in_array($value, $allowed, true)) ? $value : null;
}

function vg_int(array $src, string $key, int $min, int $max): ?int
{
    $value = $src[$key] ?? null;
    if (!is_int($value) && !(is_string($value) && ctype_digit($value))) {
        return null;
    }
    $value = (int) $value;
    return ($value < $min || $value > $max) ? null : $value;
}

/** Uniform handler wrapper: never leaks SQL or credentials to the client. */
function vg_guard(callable $handler): void
{
    try {
        $handler();
    } catch (Throwable $e) {
        error_log('[vibe-games] ' . $e->getMessage());
        vg_fail('Server error.', 500);
    }
}
