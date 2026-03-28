<?php

class UserModel {
    private $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance()->getPdo();
    }

    public function findAll(): array {
        return $this->pdo->query("SELECT * FROM users")->fetchAll();
    }

    public function findByEmail(string $email): array|false {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE email = :email LIMIT 1");
        $stmt->execute([':email' => $email]);
        return $stmt->fetch();
    }

    public function create(array $data): void {
        $stmt = $this->pdo->prepare("
            INSERT INTO users (username, email, password)
            VALUES (:username, :email, :password)
        ");
        $stmt->execute([
            ':username' => htmlspecialchars($data['username']),
            ':email'    => $data['email'],
            ':password' => $data['password']
        ]);
    }
}
