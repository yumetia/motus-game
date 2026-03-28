<?php

class LeaderboardController extends Controller {

    public function handle(): void {
        $method = $_SERVER['REQUEST_METHOD'];
        $url = $_SERVER['REQUEST_URI'];

        match(true) {
            $method === 'GET' && $url === '/api/leaderboard' => $this->getLeaderboard(),
            default => $this->json(["error" => "Method not allowed"], 405)
        };
    }

    private function getLeaderboard(): void {
        $pdo = Database::getInstance()->getPdo();

        $stmt = $pdo->query("
            SELECT
                u.username,
                COUNT(l.id)                          AS total_games,
                SUM(l.won)                           AS total_wins,
                ROUND(AVG(l.attempts), 1)            AS avg_attempts,
                ROUND(AVG(l.time_seconds), 0)        AS avg_time,
                MIN(l.attempts)                      AS best_attempt
            FROM leaderboard l
            JOIN users u ON u.id = l.user_id
            GROUP BY u.id, u.username
            ORDER BY total_wins DESC, avg_attempts ASC, avg_time ASC
            LIMIT 10
        ");

        $this->json($stmt->fetchAll());
    }
}

$controller = new LeaderboardController();
$controller->handle();
