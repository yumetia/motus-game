<?php

class UserModel {
    private $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance()->getPdo();
    }

    public function findAll(): array {
        return $this->pdo->query("SELECT * FROM users")->fetchAll();
    }
}
