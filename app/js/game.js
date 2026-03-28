// okay so here is the actual main game logic file.
// before any other things, we need to send an ajax request to the api so we can decide:
// 1) go to the login page by default: user unauthenticated
// 2) user auhtenticated: we go to the game page
const API_URL = "http://localhost:8888";

let word         = "";
let wordLength   = 0;
let currentRow   = 0;
let currentInput = "";
let gameOver     = false;
let difficulty   = "normal";

// ─── Auth check ───────────────────────────────────────────────
async function checkAuth() {
    try {
        const res  = await fetch(`${API_URL}/api/auth/check`, { method: "GET", credentials: "include" });
        const data = await res.json();
        if (res.ok && data.authenticated) {
            showDifficulty();
        } else {
            window.location.href = "/login";
        }
    } catch (e) {
        window.location.href = "/login";
    }
}

// ─── Difficulty screen ────────────────────────────────────────
function showDifficulty() {
    document.getElementById("difficultyScreen").style.display = "flex";
    document.getElementById("gameScreen").style.display       = "none";
}

function selectDifficulty(d) {
    difficulty = d;
    startGame();
}

// ─── Start / New game ─────────────────────────────────────────
async function startGame() {
    currentRow   = 0;
    currentInput = "";
    gameOver     = false;

    document.getElementById("difficultyScreen").style.display  = "none";
    document.getElementById("gameScreen").style.display        = "flex";
    document.getElementById("newGameBtn").style.display        = "none";
    document.getElementById("sameDifficultyBtn").style.display = "none";
    document.getElementById("attemptCount").textContent        = "0";

    const labels = { easy: "Facile", normal: "Normal", hard: "Difficile" };
    document.getElementById("difficultyBadge").textContent = labels[difficulty] || "";
    document.getElementById("difficultyBadge").className   = `diff-badge ${difficulty}`;

    setMessage("", "");

    try {
        const res  = await fetch(`${API_URL}/api/game/word?difficulty=${difficulty}`, {
            method: "GET",
            credentials: "include"
        });
        const data = await res.json();

        if (!res.ok) { setMessage(data.error || "Erreur serveur", "error"); return; }

        word       = data.word || "";
        wordLength = data.length;
        buildGrid(data.first_letter);
    } catch (e) {
        setMessage("Impossible de contacter le serveur.", "error");
    }
}

// ─── Build grid ───────────────────────────────────────────────
function buildGrid(firstLetter) {
    const grid = document.getElementById("grid");
    grid.innerHTML = "";

    for (let r = 0; r < 6; r++) {
        const row = document.createElement("div");
        row.classList.add("row");
        row.id = `row-${r}`;

        for (let c = 0; c < wordLength; c++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.id = `cell-${r}-${c}`;

            if (r === 0 && c === 0) {
                cell.textContent = firstLetter;
                cell.classList.add("correct");
            }

            row.appendChild(cell);
        }

        grid.appendChild(row);
    }

    highlightRow(0);
    currentInput = firstLetter;
}

// ─── Keyboard handling ────────────────────────────────────────
document.addEventListener("keydown", (e) => {
    if (gameOver) return;
    if (document.getElementById("difficultyScreen").style.display !== "none") return;

    const key = e.key.toUpperCase();

    if (e.key === "Backspace")       handleBackspace();
    else if (e.key === "Enter")      handleEnter();
    else if (/^[A-ZÀÂÄÉÈÊËÎÏÔÙÛÜŸÇŒÆ]$/.test(key)) handleLetter(key);
});

function handleLetter(letter) {
    if (currentInput.length >= wordLength) return;
    currentInput += letter;
    const cell = document.getElementById(`cell-${currentRow}-${currentInput.length - 1}`);
    cell.textContent = letter;
    cell.classList.add("filled");
    setTimeout(() => cell.classList.remove("filled"), 150);
}

function handleBackspace() {
    if (currentInput.length <= 1) return;
    const cell = document.getElementById(`cell-${currentRow}-${currentInput.length - 1}`);
    cell.textContent = "";
    cell.classList.remove("filled");
    currentInput = currentInput.slice(0, -1);
}

async function handleEnter() {
    if (currentInput.length < wordLength) {
        shakeRow(currentRow);
        setMessage("Mot incomplet", "error");
        return;
    }

    setMessage("", "");

    try {
        const res  = await fetch(`${API_URL}/api/game/guess`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ guess: currentInput })
        });
        const data = await res.json();

        if (!res.ok) { setMessage(data.error || "Erreur", "error"); return; }

        applyResult(data.result);
        document.getElementById("attemptCount").textContent = data.attempts;

        if (data.won) {
            gameOver = true;
            setMessage("Bravo ! Mot trouvé 🎉", "win");
            showEndButtons();
        } else if (data.lost) {
            gameOver = true;
            setMessage(`Perdu ! Le mot était "${data.word || "?"}". Réessayez ?`, "lose");
            showEndButtons();
        } else {
            currentRow++;
            currentInput = "";
            highlightRow(currentRow);
            const firstLetter = data.result[0].letter;
            const firstCell   = document.getElementById(`cell-${currentRow}-0`);
            firstCell.textContent = firstLetter;
            firstCell.classList.add("correct");
            currentInput = firstLetter;
        }
    } catch (e) {
        setMessage("Impossible de contacter le serveur.", "error");
    }
}

function showEndButtons() {
    document.getElementById("newGameBtn").style.display        = "inline-block";
    document.getElementById("sameDifficultyBtn").style.display = "inline-block";
}

// ─── Apply result ─────────────────────────────────────────────
function applyResult(result) {
    const row = currentRow;
    result.forEach((item, i) => {
        const cell = document.getElementById(`cell-${row}-${i}`);
        if (!cell) return;
        cell.textContent = item.letter;
        cell.classList.remove("filled", "active-row");
        setTimeout(() => cell.classList.add(item.status), i * 80);
    });
}

// ─── UI helpers ───────────────────────────────────────────────
function highlightRow(row) {
    for (let r = 0; r < 6; r++) {
        const el = document.getElementById(`row-${r}`);
        if (el) el.querySelectorAll(".cell").forEach(c => c.classList.remove("active-row"));
    }
    const active = document.getElementById(`row-${row}`);
    if (active) active.querySelectorAll(".cell").forEach(c => c.classList.add("active-row"));
}

function shakeRow(row) {
    const el = document.getElementById(`row-${row}`);
    if (!el) return;
    el.classList.add("shake");
    setTimeout(() => el.classList.remove("shake"), 400);
}

function setMessage(text, type) {
    const el = document.getElementById("message");
    el.textContent = text;
    el.className   = type;
}

async function logout() {
    await fetch(`${API_URL}/api/logout`, { method: "POST", credentials: "include" });
    window.location.href = "/login";
}

checkAuth();
