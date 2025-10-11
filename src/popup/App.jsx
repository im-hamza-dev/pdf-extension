import React, { useState, useEffect } from 'react';
import ScreenshotList from '../components/ScreenshotList';
import { exportPDF } from '../utils/pdfExport';
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
    const images = queue.map((q) => q.dataUrl);
    await exportPDF(images);
  }

  async function handleRemove(id) {
    const { ok } = await sendMessage({ type: 'REMOVE', id });
    if (ok) {
      await refresh();
    }
  }

  async function handleSavePng(dataUrl) {
    await sendMessage({ type: 'SAVE_PNG', dataUrl });
  }

  async function handleReorder(order) {
    await sendMessage({ type: 'REORDER', order });
  }

  return (
    <div>
      <div className="row">
        <button className="primary" onClick={handleCapture}>
          📸 Capture
        </button>
        <button className="secondary" onClick={handleExport}>
          📥 Export PDF
        </button>
        <button className="danger" onClick={handleClear}>
          🗑️ Clear
        </button>
      </div>

      <ScreenshotList
        queue={queue}
        onRemove={handleRemove}
        onSavePng={handleSavePng}
        onReorder={handleReorder}
      />
    </div>
  );
}

export default App;

