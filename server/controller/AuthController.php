<?php

class AuthController {
    private $userModel;

    public function __construct() {
        $this->userModel = new UserModel();
    }

    public function handle(): void {
        $method = $_SERVER['REQUEST_METHOD'];
        $url = $_SERVER['REQUEST_URI'];

        match(true) {
            $method === 'POST' && $url === '/api/login' => $this->login(),
            $method === 'POST' && $url === '/api/register' => $this->register(),
            default => $this->json(["error" => "Method not allowed"], 405)
        };
    }

    private function login(): void {
        $data = $this->getBody();

        if (empty($data['email']) || empty($data['password'])) {
            $this->json(["error" => "Email and password are required"], 400);
            return;
        }

        $user = $this->userModel->findByEmail($data['email']);

        if (!$user || !password_verify($data['password'], $user['password'])) {
            $this->json(["error" => "Invalid credentials"], 401);
            return;
        }

        $_SESSION['user'] = [
            'id' => $user['id'],
            'email' => $user['email'],
        ];

        $this->json(["message" => "Login successful"]);
    }

    private function register(): void {
        $data = $this->getBody();

        if (empty($data['email']) || empty($data['password']) || empty($data['username'])) {
            $this->json(["error" => "All fields are required"], 400);
            return;
        }

        if (strlen($data['password']) < 8) {
            $this->json(["error" => "Password must be at least 8 characters"], 400);
            return;
        }

        if ($this->userModel->findByEmail($data['email'])) {
            $this->json(["error" => "Email already exists"], 409);
            return;
        }

        $hashed = password_hash($data['password'], PASSWORD_BCRYPT);

        $this->userModel->create([
            'username' => $data['username'],
            'email' => $data['email'],
            'password' => $hashed,
        ]);

        $this->json(["message" => "Register successful"], 201);
    }

    private function getBody(): array {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }

    private function json(array $data, int $status = 200): void {
        http_response_code($status);
        echo json_encode($data);
        exit;
    }
}

$controller = new AuthController();
$controller->handle();
