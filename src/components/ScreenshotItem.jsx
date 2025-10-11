import React from 'react';

function ScreenshotItem({
  item,
  isDragging,
  onDragStart,
  onDragEnd,
  onDragOver,
  onRemove,
  onSavePng,
}) {
  const date = new Date(item.createdAt);

  return (
    <div
      className={`item ${isDragging ? 'dragging' : ''}`}
      draggable
      data-id={item.id}
      onDragStart={(e) => onDragStart(e, item.id)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => onDragOver(e, item.id)}
    >
      <div className="drag">⠿</div>
      <img className="thumb" src={item.dataUrl} alt="Screenshot thumbnail" />
      <div className="meta">Page • {date.toLocaleTimeString()}</div>
      <div className="actions">
        <button title="Save PNG" onClick={() => onSavePng(item.dataUrl)}>
          💾
        </button>
        <button title="Remove" onClick={() => onRemove(item.id)}>
          ✖
        </button>
      </div>
    </div>
  );
}

export default ScreenshotItem;

