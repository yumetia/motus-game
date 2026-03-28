const API_URL = "http://localhost:8888";

async function init() {
    try {
        // auth check
        const authRes = await fetch(`${API_URL}/api/auth/check`, {
            method: "GET",
            credentials: "include"
        });
        if (!authRes.ok) {
            window.location.href = "/login";
            return;
        }

        // fetch leaderboard
        const res  = await fetch(`${API_URL}/api/leaderboard`, {
            method: "GET",
            credentials: "include"
        });
        const data = await res.json();

        if (!res.ok || !Array.isArray(data)) {
            showEmpty();
            return;
        }

        if (data.length === 0) {
            showEmpty();
            return;
        }

        renderPodium(data.slice(0, 3));
        renderTable(data);

    } catch (e) {
        console.error("Leaderboard error:", e);
        showEmpty();
    }
}

// ─── Podium (top 3) ───────────────────────────────────────────
function renderPodium(top) {
    // reorder: 2nd, 1st, 3rd for visual podium layout
    const order = [top[1], top[0], top[2]].filter(Boolean);
    const ranks = top[1] ? [2, 1, 3] : [1, 2, 3];

    const podium = document.createElement("div");
    podium.classList.add("podium");

    order.forEach((player, idx) => {
        const rank = ranks[idx];
        const item = document.createElement("div");
        item.classList.add("podium-item", `rank-${rank}`);

        item.innerHTML = `
            <div class="podium-avatar">${player.username[0].toUpperCase()}</div>
            <div class="podium-name">${escapeHtml(player.username)}</div>
            <div class="podium-wins">${player.total_wins} victoire${player.total_wins > 1 ? 's' : ''}</div>
            <div class="podium-block">${rank}</div>
        `;

        podium.appendChild(item);
    });

    document.getElementById("leaderboard-container").prepend(podium);
}

// ─── Full table ───────────────────────────────────────────────
function renderTable(data) {
    const container = document.getElementById("leaderboard-container");
    container.innerHTML = "";

    const table = document.createElement("table");
    table.classList.add("lb-table");

    table.innerHTML = `
        <thead>
            <tr>
                <th>#</th>
                <th>Joueur</th>
                <th>Victoires</th>
                <th>Parties</th>
                <th>Moy. tentatives</th>
                <th>Moy. temps</th>
            </tr>
        </thead>
        <tbody id="lb-body"></tbody>
    `;

    container.appendChild(table);

    const tbody = document.getElementById("lb-body");

    data.forEach((player, index) => {
        const rank = index + 1;
        const tr   = document.createElement("tr");
        tr.style.animationDelay = `${index * 0.05}s`;

        const rankBadge = rank <= 3
            ? `<span class="rank-badge rank-${rank}">${rank}</span>`
            : `<span style="color:#444">${rank}</span>`;

        const avgTime = player.avg_time >= 60
            ? `${Math.floor(player.avg_time / 60)}m ${player.avg_time % 60}s`
            : `${player.avg_time}s`;

        tr.innerHTML = `
            <td>${rankBadge}</td>
            <td class="username">${escapeHtml(player.username)}</td>
            <td>${player.total_wins}</td>
            <td>${player.total_games}</td>
            <td>${player.avg_attempts}</td>
            <td>${avgTime}</td>
        `;

        tbody.appendChild(tr);
    });
}

function showEmpty() {
    document.getElementById("leaderboard-container").innerHTML = `
        <div class="empty">Aucun score enregistré pour le moment.</div>
    `;
}

function escapeHtml(str) {
    return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

async function logout() {
    await fetch(`${API_URL}/api/logout`, {
        method: "POST",
        credentials: "include"
    });
    window.location.href = "/login";
}

init();
