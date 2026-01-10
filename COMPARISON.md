# Before vs After: React Migration Comparison

## 📁 File Structure Comparison

### Before (Vanilla JS):

```
pdf-extension/
├── popup/
│   ├── popup.html
│   └── popup.js
├── annotation/
│   ├── annotation.html
│   └── annotation.js
├── vendor/
│   └── jspdf.umd.min.js
├── background.js
├── manifest.json
└── icon01.jpg
```

### After (React):

```
pdf-extension/
├── src/
│   ├── popup/
│   │   ├── index.html
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── App.jsx
│   ├── annotation/
│   │   ├── index.html
│   │   ├── annotation.css
│   │   ├── main.jsx
│   │   └── AnnotationApp.jsx
│   ├── components/
│   │   ├── ScreenshotList.jsx
│   │   └── ScreenshotItem.jsx
│   └── utils/
│       ├── chromeApi.js
│       └── pdfExport.js
├── background.js (unchanged)
├── manifest.json
├── icon01.jpg
├── package.json
├── vite.config.js
└── dist/ (built files)
```

---

## 🔄 Code Comparison

### Popup - State Management

#### Before (`popup/popup.js`):

```javascript
const list = $("#list");

async function refresh() {
  const { ok, queue, error } = await send({ type: "GET_LIST" });
  if (!ok) return console.error(error);
  render(queue);
}

function render(queue) {
  list.innerHTML = "";
  queue.forEach((item) => {
    // Manual DOM manipulation
    const row = document.createElement("div");
    row.className = "item";
    // ... more DOM manipulation
    list.appendChild(row);
  });
}
```

#### After (`src/popup/App.jsx`):

```javascript
function App() {
  const [queue, setQueue] = useState([]);

  async function refresh() {
    const { ok, queue: newQueue } = await sendMessage({ type: 'GET_LIST' });
    if (ok && newQueue) {
      setQueue(newQueue); // React auto-updates UI
    }
  }

  return (
    <div>
      <ScreenshotList queue={queue} ... />
    </div>
  );
}
```

---

### Popup - Rendering Items

#### Before:

```javascript
function render(queue) {
  list.innerHTML = "";
  queue.forEach((item) => {
    const row = document.createElement("div");
    row.className = "item";
    row.draggable = true;
    row.dataset.id = item.id;

    const img = document.createElement("img");
    img.className = "thumb";
    img.src = item.dataUrl;
    row.appendChild(img);

    const rmBtn = document.createElement("button");
    rmBtn.textContent = "✖";
    rmBtn.addEventListener("click", async () => {
      await send({ type: "REMOVE", id: item.id });
      refresh();
    });
    row.appendChild(rmBtn);

    list.appendChild(row);
  });
}
```

#### After (`src/components/ScreenshotItem.jsx`):

```jsx
function ScreenshotItem({ item, onRemove }) {
  const date = new Date(item.createdAt);

  return (
    <div className="item" draggable data-id={item.id}>
      <div className="drag">⠿</div>
      <img className="thumb" src={item.dataUrl} alt="Screenshot" />
      <div className="meta">Page • {date.toLocaleTimeString()}</div>
      <div className="actions">
        <button onClick={() => onRemove(item.id)}>✖</button>
      </div>
    </div>
  );
}
```

---

### Popup - Event Handlers

#### Before:

```javascript
btnCapture.addEventListener("click", async () => {
  await send({ type: "CAPTURE" });
  await refresh();
});

btnClear.addEventListener("click", async () => {
  await send({ type: "CLEAR" });
  await refresh();
});

btnExport.addEventListener("click", async () => {
  const { queue } = await send({ type: "GET_LIST" });
  await exportPDF(queue.map((q) => q.dataUrl));
});
```

#### After:

```jsx
function App() {
  async function handleCapture() {
    await sendMessage({ type: "CAPTURE" });
    await refresh();
  }

  async function handleClear() {
    await sendMessage({ type: "CLEAR" });
    await refresh();
  }

  async function handleExport() {
    const images = queue.map((q) => q.dataUrl);
    await exportPDF(images);
  }

  return (
    <div className="row">
      <button onClick={handleCapture}>📸 Capture</button>
      <button onClick={handleExport}>📥 Export PDF</button>
      <button onClick={handleClear}>🗑️ Clear</button>
    </div>
  );
}
```

---

### Annotation - Canvas Drawing

#### Before (`annotation/annotation.js`):

```javascript
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let drawing = false;
let img = new Image();

const params = new URLSearchParams(window.location.search);
const screenshot = params.get("img");

img.onload = () => {
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
};
img.src = screenshot;

canvas.addEventListener("mousedown", () => (drawing = true));
canvas.addEventListener("mouseup", () => (drawing = false));
canvas.addEventListener("mousemove", draw);

function draw(e) {
  if (!drawing) return;
  ctx.lineWidth = 3;
  ctx.strokeStyle = "red";
  // ... drawing logic
}

document.getElementById("save").addEventListener("click", () => {
  const editedDataURL = canvas.toDataURL("image/png");
  chrome.runtime.sendMessage({
    type: "saveAnnotatedImage",
    dataUrl: editedDataURL,
  });
  window.close();
});
```

#### After (`src/annotation/AnnotationApp.jsx`):

```jsx
function AnnotationApp() {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const imageRef = useRef(new Image());

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const screenshot = params.get("img");

    const img = imageRef.current;
    img.onload = () => {
      const canvas = canvasRef.current;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
    };
    img.src = screenshot;
  }, []);

  const draw = (e) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    // ... drawing logic
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    const editedDataURL = canvas.toDataURL("image/png");
    chrome.runtime.sendMessage({
      type: "saveAnnotatedImage",
      dataUrl: editedDataURL,
    });
    window.close();
  };

  return (
    <>
      <div className="toolbar">
        <button onClick={handleSave}>💾 Save</button>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={() => setDrawing(true)}
        onMouseUp={() => setDrawing(false)}
        onMouseMove={draw}
      />
    </>
  );
}
```

---

### PDF Export

#### Before (Inline in `popup.js`):

```javascript
async function exportPDF(images) {
  const pdf = new window.jspdf.jsPDF("p", "mm", "a4");
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < images.length; i++) {
    if (i > 0) pdf.addPage();
    const { width, height } = await measureImage(images[i]);
    // ... scaling logic
    pdf.addImage(images[i], "PNG", x, y, w, h);
  }

  pdf.save("screenshots.pdf");
}
```

#### After (Separate utility - `src/utils/pdfExport.js`):

```javascript
import { jsPDF } from "jspdf";

export async function exportPDF(images) {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < images.length; i++) {
    if (i > 0) pdf.addPage();
    const { width, height } = await measureImage(images[i]);
    // ... scaling logic
    pdf.addImage(images[i], "PNG", x, y, w, h);
  }

  pdf.save("screenshots.pdf");
}
```

---

## 🎯 Key Benefits of React Version

### 1. **Better Code Organization**

- Modular components
- Separated concerns (UI, logic, styles)
- Reusable components

### 2. **Easier State Management**

- No manual DOM manipulation
- React handles re-renders automatically
- Cleaner, more readable code

### 3. **Modern Development**

- Use npm packages directly
- Hot module reloading
- Better debugging tools (React DevTools)

### 4. **Type Safety (Optional)**

- Easy to add TypeScript
- Better autocomplete
- Catch errors before runtime

### 5. **Testing**

- React Testing Library
- Component-level testing
- Better test coverage

### 6. **Community & Ecosystem**

- Huge library ecosystem
- UI component libraries (MUI, Chakra, etc.)
- More resources and tutorials

---

## 📦 Dependencies Comparison

### Before:

```html
<!-- Loaded via CDN/vendor folder -->
<script src="./vendor/jspdf.umd.min.js"></script>
```

### After:

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "jspdf": "^2.5.1"
  }
}
```

---

## 🚀 Development Workflow

### Before:

1. Edit files
2. Reload extension manually
3. Check console for errors
4. Repeat

### After:

1. Run `npm run dev`
2. Edit files
3. Vite rebuilds automatically
4. Reload extension
5. Much faster iteration!

---

## 💡 What Stayed the Same

✅ **Background service worker** - No changes needed!
✅ **Chrome APIs** - Used exactly the same way
✅ **manifest.json** - Only path updates
✅ **Extension functionality** - Everything works the same
✅ **User experience** - Looks and behaves identically

---

## 🎓 Learning Resources

- [React Official Docs](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [React Hooks](https://react.dev/reference/react)
