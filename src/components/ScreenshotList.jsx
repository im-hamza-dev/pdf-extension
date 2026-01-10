import React, { useState } from 'react';
import ScreenshotItem from './ScreenshotItem';

function ScreenshotList({ queue, onRemove, onSavePng, onReorder, onEdit }) {
  const [draggedId, setDraggedId] = useState(null);

  const handleDragStart = (e, id) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    // Persist order
    const items = document.querySelectorAll('.item');
    const order = Array.from(items).map((el) => el.dataset.id);
    onReorder(order);
  };

  const handleDragOver = (e, targetId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (!draggedId || draggedId === targetId) return;

    const draggedEl = document.querySelector(`[data-id="${draggedId}"]`);
    const targetEl = document.querySelector(`[data-id="${targetId}"]`);

    if (!draggedEl || !targetEl) return;

    const rect = targetEl.getBoundingClientRect();
    const before = (e.clientY - rect.top) / rect.height < 0.5;

    const list = targetEl.parentNode;
    list.insertBefore(draggedEl, before ? targetEl : targetEl.nextSibling);
  };

  return (
    <div className="list">
      {queue.map((item) => (
        <ScreenshotItem
          key={item.id}
          item={item}
          isDragging={draggedId === item.id}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onRemove={onRemove}
          onSavePng={onSavePng}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}

export default ScreenshotList;

