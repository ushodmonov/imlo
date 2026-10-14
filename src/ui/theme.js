// Kunduzgi / tungi mavzu. Boshlang‘ich qiymatni index.html <head> dagi skript o‘rnatadi.

const STORAGE_KEY = "imlo-theme";
const systemDark = matchMedia("(prefers-color-scheme: dark)");

const root = document.documentElement;

function savedTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function applyTheme(theme) {
  root.dataset.theme = theme;
}

function saveTheme(theme) {
  try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* maxfiy rejim */ }
}

export function setupThemeToggle(button) {
  button.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next);
    saveTheme(next);
  });

  // Foydalanuvchi o‘zi tanlamagan bo‘lsa, tizim sozlamasiga ergashamiz
  systemDark.addEventListener("change", (event) => {
    if (!savedTheme()) applyTheme(event.matches ? "dark" : "light");
  });
}
