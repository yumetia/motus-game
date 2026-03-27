// okay so here is the actual main game logic file.
// before any other things, we need to send an ajax request to the api so we can decide:
// 1) go to the login page by default: user unauthenticated
// 2) user auhtenticated: we go to the game page

const API_URL = "http://localhost:8888";

async function checkAuth() {
    try {
        const response = await fetch(`${API_URL}/api/auth/check`, {
            method: "GET",
            credentials: "include" // sends the session cookie
        });

        const data = await response.json();

        if (response.ok && data.authenticated) {
            loadGame();
        } else {
            window.location.href = "login";
        }
    } catch (error) {
        console.error("Auth check failed:", error);
        window.location.href = "login";
    }
}

function loadGame() {
    console.log("user authenticated, loading game...");
    // game logic here
}


checkAuth();
