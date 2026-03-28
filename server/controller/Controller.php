<?php

abstract class Controller {
    protected function json(array $data, int $status = 200): void {
        http_response_code($status);
        echo json_encode($data);
        exit;
    }

    protected function getBody(): array {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }
}
