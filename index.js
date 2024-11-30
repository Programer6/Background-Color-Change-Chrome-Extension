document.addEventListener("DOMContentLoaded", async () => {
  const colorPicker = document.getElementById("color-picker");
  const changeBackgroundButton = document.getElementById("change-background");
  const saveFavoriteButton = document.getElementById("save-favorite");
  const favoritesList = document.getElementById("favorites-list");
  const subdomainToggle = document.getElementById("subdomain-toggle");

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentDomain = new URL(tab.url).hostname;

  // Load favorites and subdomain mode from storage
  chrome.storage.local.get(["favorites", "appliedDomains"], (result) => {
    renderFavorites(result.favorites || []);
    subdomainToggle.checked = result.appliedDomains?.[currentDomain] ? true : false;
  });

  subdomainToggle.addEventListener("change", () => {
    toggleDomainColor(currentDomain, colorPicker.value);
  });

  changeBackgroundButton.addEventListener("click", () => {
    const selectedColor = colorPicker.value;
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (color) => {
        document.body.style.backgroundColor = color;
      },
      args: [selectedColor],
    });
    if (subdomainToggle.checked) {
      toggleDomainColor(currentDomain, selectedColor);
    }
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
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (color) => {
          document.body.style.backgroundColor = color;
        },
        args: [color],
      });
    }
  });

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

  function toggleDomainColor(domain, color) {
    chrome.storage.local.get("appliedDomains", (result) => {
      const appliedDomains = result.appliedDomains || {};
      if (subdomainToggle.checked) {
        appliedDomains[domain] = color;
      } else {
        delete appliedDomains[domain];
      }
      chrome.storage.local.set({ appliedDomains });
    });
  }
});

