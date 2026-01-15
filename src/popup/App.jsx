import React, { useState, useEffect } from 'react';
import { ScreenshotPopup } from '../components/ScreenshotPopup';
import { sendMessage } from '../utils/chromeApi';

function App() {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    // Initial load
    refresh();

    // Listen for queue updates
    const listener = (message) => {
      if (message.type === 'QUEUE_UPDATED') {
        refresh();
      }
    };
    chrome.runtime.onMessage.addListener(listener);

    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, []);

  async function refresh() {
    const { ok, queue: newQueue } = await sendMessage({ type: 'GET_LIST' });
    if (ok && newQueue) {
      setQueue(newQueue);
    }
  }

  // Convert queue items to Screenshot format
  const screenshots = queue.map((item) => ({
    id: item.id,
    url: item.dataUrl,
    timestamp: item.createdAt ? new Date(item.createdAt) : new Date(),
    thumbnail: item.dataUrl, // Use dataUrl as thumbnail
  }));

  async function handleCapture() {
    await sendMessage({ type: 'CAPTURE' });
    await refresh();
  }

  async function handleClear() {
    await sendMessage({ type: 'CLEAR' });
    await refresh();
  }

  async function handleExport() {
    if (!queue || queue.length === 0) {
      alert('No pages yet. Capture something first.');
      return;
    }
    // Open PDF layout editor in new tab
    await sendMessage({ type: 'OPEN_PDF_EDITOR' });
  }

  async function handleSave(screenshot) {
    await sendMessage({ type: 'SAVE_PNG', dataUrl: screenshot.url });
  }

  async function handleDelete(id) {
    const { ok } = await sendMessage({ type: 'REMOVE', id });
    if (ok) {
      await refresh();
    }
  }

  async function handleEdit(screenshot) {
    await sendMessage({ type: 'EDIT_IMAGE', id: screenshot.id });
    // Don't need to refresh immediately - the edit will update the item
    // The queue will refresh when the user saves from the editor
  }

  // For popup, we don't need a close handler since it's always visible
  const handleClose = () => {
    // In popup context, we can't close it, but this is here for consistency
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ScreenshotPopup
        screenshots={screenshots}
        onClose={handleClose}
        onCapture={handleCapture}
        onEdit={handleEdit}
        onSave={handleSave}
        onDelete={handleDelete}
        onExportToLayout={handleExport}
        onClearAll={handleClear}
        isPopupContext={true}
      />
    </div>
  );
}

export default App;

