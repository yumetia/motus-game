<?php
session_start();

if (!isset($_SESSION["user"])){
    header("Location: /login");
    exit();
}

// since the user is logged, we get the current url so we can redirect to it but:
// if we know this url==> OK redirect
// if we dont know this url==> 404

$url = $_SERVER['REQUEST_URI'];


$routes = [
    "login" => "server/view/login.php",
    "register" => "server/view/register.php",
    "game" => "server/view/game.php",
]


?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Motus Game</title>
</head>
<body>
    
</body>
</html>

