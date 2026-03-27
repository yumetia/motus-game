<?php
session_start();
$routes = [
    "/login" => "view/login.php",
    "/register" => "view/register.php",
    "/game" => "view/game.php",
];

$url = $_SERVER['REQUEST_URI'] ?? "/login";

// since the user is logged from there, we get the current url so we can redirect to it but:
// if we know this url==> OK redirect
// if we dont know this url==> 404

if (array_key_exists($url, $routes)){
    $page = $routes[$url];
    require_once $page;
} else {
    require_once 'view/404/404.php';
}


