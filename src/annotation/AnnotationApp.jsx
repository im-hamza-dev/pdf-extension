import React, { useRef, useEffect, useState } from 'react';

function AnnotationApp() {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef(new Image());

  useEffect(() => {
    // Load screenshot from query param
    const params = new URLSearchParams(window.location.search);
    const screenshot = params.get('img');

    if (!screenshot) {
      alert('No image provided');
      return;
    }

    const img = imageRef.current;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      setImageLoaded(true);
    };
    img.src = screenshot;
  }, []);

  const draw = (e) => {
    if (!drawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    // Calculate actual canvas coordinates considering scaling
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.lineWidth = 3;
    ctx.strokeStyle = 'red';
    ctx.lineCap = 'round';

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleMouseDown = () => {
    setDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
  };

  const handleMouseUp = () => {
    setDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imageRef.current, 0, 0);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    const editedDataURL = canvas.toDataURL('image/png');

    // Send back to background for storage
    chrome.runtime.sendMessage({
      type: 'saveAnnotatedImage',
      dataUrl: editedDataURL,
    });

    window.close(); // Close popup after saving
  };

  return (
    <>
      <div className="toolbar">
        <button onClick={handleSave}>💾 Save</button>
        <button onClick={handleClear} className="secondary">
          🔄 Clear
        </button>
      </div>
      <canvas
        ref={canvasRef}
        id="canvas"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={draw}
        onMouseLeave={handleMouseUp}
      />
    </>
  );
}

export default AnnotationApp;

