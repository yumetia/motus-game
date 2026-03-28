// okay so here is the actual main game logic file.
// before any other things, we need to send an ajax request to the api so we can decide:
// 1) go to the login page by default: user unauthenticated
// 2) user auhtenticated: we go to the game page

const API_URL = "http://localhost:8888";

let word = ""
let wordLength   = 0;
let currentRow   = 0;
let currentInput = "";
let gameOver     = false;

// ─── Auth check ───────────────────────────────────────────────
async function checkAuth() {
    try {
        const res = await fetch(`${API_URL}/api/auth/check`, {
            method: "GET",
            credentials: "include"
        });
        const data = await res.json();
        if (res.ok && data.authenticated) {
            startGame();
        } else {
            window.location.href = "/login";
        }
    } catch (e) {
        window.location.href = "/login";
    }
}

// ─── Start / New game ─────────────────────────────────────────
async function startGame() {
    currentRow   = 0;
    currentInput = "";
    gameOver     = false;

    setMessage("", "");
    document.getElementById("newGameBtn").style.display = "none";
    document.getElementById("attemptCount").textContent = "0";

    try {
        const res  = await fetch(`${API_URL}/api/game/word`, {
            method: "GET",
            credentials: "include"
        });
        const data = await res.json();

        if (!res.ok) { setMessage(data.error || "Erreur serveur", "error"); return; }
        word = data.word
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

            // first letter of first row is revealed
            if (r === 0 && c === 0) {
                cell.textContent = firstLetter;
                cell.classList.add("correct");
            }

            row.appendChild(cell);
        }

        grid.appendChild(row);
    }

    highlightRow(0);

    // pre-fill first letter in input
    currentInput = firstLetter;
}

// ─── Keyboard handling ────────────────────────────────────────
document.addEventListener("keydown", (e) => {
    if (gameOver) return;

    const key = e.key.toUpperCase();

    if (e.key === "Backspace") {
        handleBackspace();
    } else if (e.key === "Enter") {
        handleEnter();
    } else if (/^[A-ZÀÂÄÉÈÊËÎÏÔÙÛÜŸÇŒÆ]$/.test(key)) {
        handleLetter(key);
    }
});

function handleLetter(letter) {
    if (currentInput.length >= wordLength) return;

    currentInput += letter;
    const col  = currentInput.length - 1;
    const cell = document.getElementById(`cell-${currentRow}-${col}`);
    cell.textContent = letter;
    cell.classList.add("filled");
    setTimeout(() => cell.classList.remove("filled"), 150);
}

function handleBackspace() {
    // can't delete the first letter
    if (currentInput.length <= 1) return;

    const col  = currentInput.length - 1;
    const cell = document.getElementById(`cell-${currentRow}-${col}`);
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

        if (!res.ok) {
            setMessage(data.error || "Erreur", "error");
            return;
        }

        applyResult(data.result);
        document.getElementById("attemptCount").textContent = data.attempts;

        if (data.won) {
            gameOver = true;
            setMessage("Bravo ! Mot trouvé 🎉", "win");
            document.getElementById("newGameBtn").style.display = "inline-block";
        } else if (data.lost) {
            gameOver = true;
            setMessage(`Perdu ! Le mot était "${word}". Nouvelle tentative ?`, "lose");
            document.getElementById("newGameBtn").style.display = "inline-block";
        } else {
            currentRow++;
            currentInput = "";
            highlightRow(currentRow);

            // reveal first letter of next row
            const firstCell = document.getElementById(`cell-${currentRow}-0`);
            // first letter is always correct — get it from result[0]
            const firstLetter = data.result[0].letter;
            firstCell.textContent = firstLetter;
            firstCell.classList.add("correct");
            currentInput = firstLetter;
        }
    } catch (e) {
        setMessage("Impossible de contacter le serveur.", "error");
    }
}

// ─── Apply color result to row ────────────────────────────────
function applyResult(result) {
   
    const row = currentRow; // capture now before it changes
    result.forEach((item, i) => {
        const cell = document.getElementById(`cell-${row}-${i}`);
        if (!cell) return;
        cell.textContent = item.letter;
        cell.classList.remove("filled", "active-row");

        setTimeout(() => {
            cell.classList.add(item.status);
        }, i * 80);
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

// ─── Logout ───────────────────────────────────────────────────
async function logout() {
    await fetch(`${API_URL}/api/logout`, {
        method: "POST",
        credentials: "include"
    });
    window.location.href = "/login";
}

// ─── Init ─────────────────────────────────────────────────────
checkAuth();
