document.addEventListener("DOMContentLoaded", async () => {
  const colorPicker = document.getElementById("color-picker");
  const changeBackgroundButton = document.getElementById("change-background");
  const saveFavoriteButton = document.getElementById("save-favorite");
  const favoritesList = document.getElementById("favorites-list");

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.storage.local.get("favorites", (result) => {
    renderFavorites(result.favorites || []);
  });

  changeBackgroundButton.addEventListener("click", () => {
    const selectedColor = colorPicker.value;
    applyBackground(tab.id, selectedColor);
  });

  saveFavoriteButton.addEventListener("click", () => {
    const selectedColor = colorPicker.value;
    chrome.storage.local.get("favorites", (result) => {
      const favorites = result.favorites || [];
      if (!favorites.includes(selectedColor)) {
        favorites.push(selectedColor);
        chrome.storage.local.set({ favorites });
        renderFavorites(favorites);
      }
    });
  });

  favoritesList.addEventListener("click", (event) => {
    if (event.target.classList.contains("delete-favorite-btn")) {
      deleteFavorite(event.target.dataset.color);
    } else if (event.target.tagName === "LI") {
      const color = event.target.style.backgroundColor;
      applyBackground(tab.id, color);
    }
  });

  function applyBackground(tabId, color) {
    chrome.scripting.executeScript({
      target: { tabId },
      func: (color) => (document.body.style.backgroundColor = color),
      args: [color],
    });
  }

  function renderFavorites(favorites) {
    favoritesList.innerHTML = "";
    favorites.forEach((color) => {
      const li = document.createElement("li");
      li.style.backgroundColor = color;
      li.innerHTML = `<button class="delete-favorite-btn" data-color="${color}">×</button>`;
      favoritesList.appendChild(li);
    });
  }

  function deleteFavorite(color) {
    chrome.storage.local.get("favorites", (result) => {
      const updatedFavorites = result.favorites.filter((fav) => fav !== color);
      chrome.storage.local.set({ favorites: updatedFavorites });
      renderFavorites(updatedFavorites);
    });
  }
});
