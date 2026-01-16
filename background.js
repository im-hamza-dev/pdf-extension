// background.js (MV3 service worker)
const storage = chrome.storage.session || chrome.storage.local;
const KEY = 'screenshotsQueue';

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
  chrome.runtime.sendMessage({ type: 'QUEUE_UPDATED' });

  return queue;
}

async function clearQueue() {
  await setQueue([]);
}

// Capture the visible area of the current active tab
async function captureVisible() {
  console.log('capture visible calls');
  const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
  await openEditorTab(dataUrl);
}

// Open editor in a new tab (or edit existing screenshot)
async function openEditorTab(dataUrl, itemId = null) {
  const url =
    chrome.runtime.getURL('src/annotation/index.html') +
    '?img=' +
    encodeURIComponent(dataUrl) +
    (itemId ? '&id=' + encodeURIComponent(itemId) : '');
  await chrome.tabs.create({ url });
}

// Messages from popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  (async () => {
    try {
      if (message.type === 'CAPTURE') {
        await captureVisible();
        sendResponse({ ok: true });
      } else if (message.type === 'GET_LIST') {
        const queue = await getQueue();
        sendResponse({ ok: true, queue });
      } else if (message.type === 'CLEAR') {
        await clearQueue();
        chrome.action.setBadgeText({ text: '' });
        sendResponse({ ok: true });
      } else if (message.type === 'REMOVE') {
        const queue = await getQueue();
        const next = queue.filter((x) => x.id !== message.id);
        await setQueue(next);
        chrome.action.setBadgeText({
          text: next.length ? String(next.length) : '',
        });
        sendResponse({ ok: true, queue: next });
      } else if (message.type === 'REORDER') {
        // message.order is an array of ids in desired order
        const queue = await getQueue();
        const map = new Map(queue.map((i) => [i.id, i]));
        const reordered = message.order
          .map((id) => map.get(id))
          .filter(Boolean);
        await setQueue(reordered);
        sendResponse({ ok: true, queue: reordered });
      } else if (message.type === 'SAVE_PNG') {
        // Download a specific item as PNG
        await chrome.downloads.download({
          url: message.dataUrl,
          filename: `screenshot-${Date.now()}.png`,
          saveAs: true,
        });
        sendResponse({ ok: true });
      } else if (message.type === 'EDIT_IMAGE') {
        // Open editor for an existing screenshot
        const queue = await getQueue();
        const item = queue.find((x) => x.id === message.id);
        if (item) {
          await openEditorTab(item.dataUrl, item.id);
          sendResponse({ ok: true });
        } else {
          sendResponse({ ok: false, error: 'Item not found' });
        }
      } else if (message.type === 'OPEN_PDF_EDITOR') {
        // Open PDF layout editor in new tab
        const url = chrome.runtime.getURL('src/pdf-editor/index.html');
        await chrome.tabs.create({ url });
        sendResponse({ ok: true });
      } else if (message.type === 'saveAnnotatedImage') {
        console.log('Annotated image received:', message.dataUrl);
        // If itemId is provided, update existing item; otherwise add new
        if (message.itemId) {
          const queue = await getQueue();
          const index = queue.findIndex((x) => x.id === message.itemId);
          if (index !== -1) {
            queue[index].dataUrl = message.dataUrl;
            await setQueue(queue);
            chrome.runtime.sendMessage({ type: 'QUEUE_UPDATED' });
          }
        } else {
          // Store it in extension storage as new item
          await addToQueue(message.dataUrl);
        }
        // optional: show a toast via popup messaging, or use badge
        const queue = await getQueue();
        chrome.action.setBadgeText({ text: String(queue.length) });
        chrome.action.setBadgeBackgroundColor({ color: '#3b82f6' });

        // Close the editor tab if tabId is provided
        if (message.tabId) {
          try {
            await chrome.tabs.remove(message.tabId);
          } catch (e) {
            console.error('Failed to close tab:', e);
          }
        }

        sendResponse({ ok: true });
      } else if (message.type === 'CLOSE_EDITOR_TAB') {
        // Handle request to close editor tab
        if (message.tabId) {
          try {
            await chrome.tabs.remove(message.tabId);
            sendResponse({ ok: true });
          } catch (e) {
            console.error('Failed to close tab:', e);
            sendResponse({ ok: false, error: String(e) });
          }
        } else {
          sendResponse({ ok: false, error: 'No tabId provided' });
        }
      } else {
        sendResponse({ ok: false, error: 'Unknown message type' });
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
  if (command === 'capture-screenshot') {
    await captureVisible();
  }
});
