chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ appliedDomains: {} });
  });
  
  chrome.webNavigation.onCompleted.addListener((details) => {
    chrome.storage.local.get("appliedDomains", ({ appliedDomains }) => {
      const domain = new URL(details.url).hostname;
      if (appliedDomains[domain]) {
        chrome.scripting.executeScript({
          target: { tabId: details.tabId },
          func: (color) => {
            document.body.style.backgroundColor = color;
          },
          args: [appliedDomains[domain]],
        });
      }
    });
  });
  
