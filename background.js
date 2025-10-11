// background.js (MV3 service worker)
const storage = chrome.storage.session || chrome.storage.local;
const KEY = "screenshotsQueue";

async function getQueue() {
  const data = await storage.get(KEY);
  return data[KEY] || [];
}

async function setQueue(queue) {
  await storage.set({ [KEY]: queue });
}

async function addToQueue(dataUrl) {
  const queue = await getQueue();
  queue.push({
    id: crypto.randomUUID(),
    dataUrl,
    createdAt: Date.now(),
  });
  await setQueue(queue);
  chrome.runtime.sendMessage({ type: "QUEUE_UPDATED" });

  return queue;
}

async function clearQueue() {
  await setQueue([]);
}

// Capture the visible area of the current active tab
async function captureVisible() {
  console.log("capture visible calls");
  const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: "png" });
  chrome.windows.create({
    url:
      chrome.runtime.getURL("annotation/annotation.html") +
      "?img=" +
      encodeURIComponent(dataUrl),
    type: "popup",
    width: 1000,
    height: 800,
  });
}

// Messages from popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  (async () => {
    try {
      if (message.type === "CAPTURE") {
        await captureVisible();
        sendResponse({ ok: true });
      } else if (message.type === "GET_LIST") {
        const queue = await getQueue();
        sendResponse({ ok: true, queue });
      } else if (message.type === "CLEAR") {
        await clearQueue();
        chrome.action.setBadgeText({ text: "" });
        sendResponse({ ok: true });
      } else if (message.type === "REMOVE") {
        const queue = await getQueue();
        const next = queue.filter((x) => x.id !== message.id);
        await setQueue(next);
        chrome.action.setBadgeText({
          text: next.length ? String(next.length) : "",
        });
        sendResponse({ ok: true, queue: next });
      } else if (message.type === "REORDER") {
        // message.order is an array of ids in desired order
        const queue = await getQueue();
        const map = new Map(queue.map((i) => [i.id, i]));
        const reordered = message.order
          .map((id) => map.get(id))
          .filter(Boolean);
        await setQueue(reordered);
        sendResponse({ ok: true, queue: reordered });
      } else if (message.type === "SAVE_PNG") {
        // Download a specific item as PNG
        await chrome.downloads.download({
          url: message.dataUrl,
          filename: `screenshot-${Date.now()}.png`,
          saveAs: true,
        });
        sendResponse({ ok: true });
      } else if (message.type === "saveAnnotatedImage") {
        console.log("Annotated image received:", message.dataUrl);
        // Store it in extension storage
        await addToQueue(message.dataUrl);
        // optional: show a toast via popup messaging, or use badge
        chrome.action.setBadgeText({ text: String((await getQueue()).length) });
        chrome.action.setBadgeBackgroundColor({ color: "#3b82f6" });
      } else {
        sendResponse({ ok: false, error: "Unknown message type" });
      }
    } catch (e) {
      console.error(e);
      sendResponse({ ok: false, error: String(e) });
    }
  })();
  return true; // keep channel open for async
});

// Keyboard shortcut (optional)
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "capture-screenshot") {
    await captureVisible();
  }
});
