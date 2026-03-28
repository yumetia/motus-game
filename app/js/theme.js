// js/theme.js

const THEMES = ["dracula", "cyberpunk", "synthwave"];

function getTheme() {
    return localStorage.getItem("theme") || "dracula";
}

function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
}

function cycleTheme() {
    const current = getTheme();
    const nextIndex = (THEMES.indexOf(current) + 1) % THEMES.length;
    setTheme(THEMES[nextIndex]);
    updateToggleLabel();
}

function updateToggleLabel() {
    const btn = document.getElementById("themeToggle");
    if (btn) btn.textContent = getTheme();
}

// apply on load
setTheme(getTheme());
document.addEventListener("DOMContentLoaded", updateToggleLabel);