<?php

class GameController extends Controller {

    public function handle(): void {
        $method = $_SERVER['REQUEST_METHOD'];
        $url = $_SERVER['REQUEST_URI'];

        match(true) {
            $method === 'GET'  && $url === '/api/game/word'  => $this->getWord(),
            $method === 'POST' && $url === '/api/game/guess' => $this->guess(),
            default => $this->json(["error" => "Method not allowed"], 405)
        };
    }

    private function getWord(): void {
        $pdo = Database::getInstance()->getPdo();

        $stmt = $pdo->query("SELECT ortho FROM lexique ORDER BY RAND() LIMIT 1");
        $row = $stmt->fetch();

        if (!$row) {
            $this->json(["error" => "No word found"], 500);
            return;
        }

        $word = strtoupper($row['ortho']);

        $_SESSION['word'] = $word;
        $_SESSION['attempts'] = 0;
        $_SESSION['start_time'] = time();

        $this->json([
            "word"=> $word,
            "length" => strlen($word),
            "first_letter" => $word[0]
        ]);
        
    }

    private function guess(): void {
        $data = $this->getBody();

        if (empty($data['guess'])) {
            $this->json(["error" => "No guess provided"], 400);
            return;
        }

        if (!isset($_SESSION['word'])) {
            $this->json(["error" => "No active game"], 400);
            return;
        }

        $guess  = strtoupper(trim($data['guess']));
        $word   = $_SESSION['word'];

        if (strlen($guess) !== strlen($word)) {
            $this->json(["error" => "Wrong word length"], 400);
            return;
        }

        $_SESSION['attempts']++;

        $result = $this->compare($guess, $word);
        $won    = $guess === $word;
        $lost   = $_SESSION['attempts'] >= 6 && !$won;

        if ($won || $lost) {
            $this->saveScore($won);
        }

        $this->json([
            "result"   => $result,
            "won"      => $won,
            "lost"     => $lost,
            "attempts" => $_SESSION['attempts']
        ]);
    }

    private function compare(string $guess, string $word): array {
        $result   = array_fill(0, strlen($word), 'wrong');
        $wordArr  = str_split($word);
        $guessArr = str_split($guess);
        $used     = array_fill(0, strlen($word), false);

        // first pass: correct position (red)
        for ($i = 0; $i < strlen($word); $i++) {
            if ($guessArr[$i] === $wordArr[$i]) {
                $result[$i] = 'correct';
                $used[$i]   = true;
            }
        }

        // second pass: wrong position (yellow)
        for ($i = 0; $i < strlen($word); $i++) {
            if ($result[$i] === 'correct') continue;

            for ($j = 0; $j < strlen($word); $j++) {
                if (!$used[$j] && $guessArr[$i] === $wordArr[$j]) {
                    $result[$i] = 'misplaced';
                    $used[$j]   = true;
                    break;
                }
            }
        }

        return array_map(fn($letter, $status) => [
            'letter' => $letter,
            'status' => $status // correct | misplaced | wrong
        ], $guessArr, $result);
    }

    private function saveScore(bool $won): void {
        if (!isset($_SESSION['user'])) return;

        $pdo  = Database::getInstance()->getPdo();
        $stmt = $pdo->prepare("
            INSERT INTO leaderboard (user_id, attempts, won, time_seconds)
            VALUES (:user_id, :attempts, :won, :time_seconds)
        ");

        $stmt->execute([
            ':user_id'      => $_SESSION['user']['id'],
            ':attempts'     => $_SESSION['attempts'],
            ':won'          => $won ? 1 : 0,
            ':time_seconds' => time() - $_SESSION['start_time']
        ]);
    }
}

$controller = new GameController();
$controller->handle();
