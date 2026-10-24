const PASSWORD = "change-me"; // Change this one value only when needed
const STORAGE_KEY = "game-library-unlocked";

const lockScreen = document.getElementById("lock-screen");
const app = document.getElementById("app");
const passwordForm = document.getElementById("password-form");
const passwordInput = document.getElementById("password-input");
const passwordError = document.getElementById("password-error");
const searchInput = document.getElementById("search-input");
const gameList = document.getElementById("game-list");
const gameFrame = document.getElementById("game-frame");
const fullscreenBtn = document.getElementById("fullscreen-btn");
const logoutBtn = document.getElementById("logout-btn");

let games = Array.isArray(window.GAME_LIST) ? [...window.GAME_LIST] : [];
let selectedGameIndex = 0;

function isUnlocked() {
  return localStorage.getItem(STORAGE_KEY) === "true";
}

function unlockApp() {
  localStorage.setItem(STORAGE_KEY, "true");
  lockScreen.classList.add("fade-out");
  app.classList.remove("hidden");
  setTimeout(() => {
    lockScreen.classList.add("hidden");
  }, 550);
}

function logout() {
  localStorage.removeItem(STORAGE_KEY);
  gameFrame.src = "about:blank";
  passwordInput.value = "";
  passwordError.classList.add("hidden");
  lockScreen.classList.remove("hidden");
  lockScreen.classList.remove("fade-out");
  app.classList.add("hidden");
}

function renderGames(filterText = "") {
  const q = filterText.trim().toLowerCase();
  const filtered = games.filter((game) => {
    const titleMatch = (game.title || "").toLowerCase().includes(q);
    const pathMatch = (game.path || "").toLowerCase().includes(q);
    return titleMatch || pathMatch;
  });

  if (!filtered.length) {
    gameList.innerHTML = `
      <div class="game-item">
        <span class="game-item-title">No games found</span>
        <span class="game-item-subtitle">Try another search</span>
      </div>
    `;
    return;
  }

  gameList.innerHTML = filtered
    .map((game) => {
      const realIndex = games.findIndex((g) => g.path === game.path && g.title === game.title);
      const isActive = realIndex === selectedGameIndex;
      return `
        <button
          class="game-item ${isActive ? "active" : ""}"
          type="button"
          data-index="${realIndex}"
        >
          <span class="game-item-title">${game.title}</span>
          <span class="game-item-subtitle">${game.path}</span>
        </button>
      `;
    })
    .join("");

  gameList.querySelectorAll(".game-item").forEach((button) => {
    button.addEventListener("click", () => {
      const idx = Number(button.dataset.index);
      selectedGameIndex = idx;
      openGame(games[idx]);
      renderGames(searchInput.value);
    });
  });
}

function openGame(game) {
  if (!game) return;
  gameFrame.src = game.path;
}

passwordForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = passwordInput.value.trim();
  if (value === PASSWORD) {
    unlockApp();
  } else {
    passwordError.classList.remove("hidden");
    passwordError.textContent = "Incorrect password";
  }
});

searchInput.addEventListener("input", (event) => {
  renderGames(event.target.value);
});

fullscreenBtn.addEventListener("click", async () => {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (error) {
    console.error("Fullscreen failed:", error);
  }
});

logoutBtn.addEventListener("click", logout);

if (!games.length) {
  gameList.innerHTML = `
    <div class="game-item">
      <span class="game-item-title">No games added yet</span>
      <span class="game-item-subtitle">Edit game-list.js</span>
    </div>
  `;
} else {
  selectedGameIndex = 0;
  openGame(games[0]);
  renderGames();
}

if (isUnlocked()) {
  unlockApp();
}
