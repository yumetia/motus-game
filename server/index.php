<?php
session_start();

spl_autoload_register(function($class) {
    $folders = ['controller/', 'model/'];
    
    foreach ($folders as $folder) {
        $file = $folder . $class . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

$routes = [
    "/api/login" => "controller/AuthController.php",
    "/api/register" => "controller/AuthController.php",
    "/api/game" => "controller/GameController.php",
];

$url = $_SERVER['REQUEST_URI'] =="/" ? "/login":$_SERVER['REQUEST_URI'] ;


// let static files pass through
if (preg_match('/\.(png|jpg|css|js|ico)$/', $url)) {
    return false;
}

// since the user is logged from there, we get the current url so we can redirect to it but:
// if we know this url==> OK redirect
// if we dont know this url==> 404
if (array_key_exists($url, $routes)){
    $page = $routes[$url];
    require_once $page;
} else {
    require_once 'view/404/404.php';
}


