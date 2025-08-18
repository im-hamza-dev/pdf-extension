// popup.js
// import { jsPDF } from "./vendor/jspdf.umd.min.js";
console.log(window);
const { jsPDF } = window.jspdf || {};

const $ = (sel) => document.querySelector(sel);
const list = $("#list");
const btnCapture = $("#btnCapture");
const btnExport = $("#btnExport");
const btnClear = $("#btnClear");

function send(msg) {
  console.log("sending message", msg);
  return new Promise((resolve) => chrome.runtime.sendMessage(msg, resolve));
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "QUEUE_UPDATED") {
    refresh();
  }
});

async function refresh() {
  const { ok, queue, error } = await send({ type: "GET_LIST" });
  if (!ok) return console.error(error);
  render(queue);
}

function render(queue) {
  list.innerHTML = "";
  queue.forEach((item) => {
    const row = document.createElement("div");
    row.className = "item";
    row.draggable = true;
    row.dataset.id = item.id;

    const drag = document.createElement("div");
    drag.textContent = "⠿";
    drag.className = "drag";
    row.appendChild(drag);

    const img = document.createElement("img");
    img.className = "thumb";
    img.src = item.dataUrl;
    row.appendChild(img);

    const meta = document.createElement("div");
    meta.className = "meta";
    const date = new Date(item.createdAt);
    meta.textContent = `Page • ${date.toLocaleTimeString()}`;
    row.appendChild(meta);

    const actions = document.createElement("div");
    actions.className = "actions";
    const saveBtn = document.createElement("button");
    saveBtn.title = "Save PNG";
    saveBtn.textContent = "💾";
    saveBtn.addEventListener("click", async () => {
      await send({ type: "SAVE_PNG", dataUrl: item.dataUrl });
    });
    actions.appendChild(saveBtn);

    const rmBtn = document.createElement("button");
    rmBtn.title = "Remove";
    rmBtn.textContent = "✖";
    rmBtn.addEventListener("click", async () => {
      const { ok } = await send({ type: "REMOVE", id: item.id });
      if (ok) refresh();
    });
    actions.appendChild(rmBtn);

    row.appendChild(actions);
    list.appendChild(row);
  });

  enableDragSort();
}

function enableDragSort() {
  let dragEl = null;
  list.querySelectorAll(".item").forEach((el) => {
    el.addEventListener("dragstart", (e) => {
      dragEl = el;
      e.dataTransfer.effectAllowed = "move";
      el.style.opacity = "0.5";
    });
    el.addEventListener("dragend", () => {
      if (!dragEl) return;
      dragEl.style.opacity = "1";
      dragEl = null;
      // persist order
      const order = [...list.querySelectorAll(".item")].map(
        (n) => n.dataset.id
      );
      send({ type: "REORDER", order });
    });
    el.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      const target = closestItem(e.target);
      if (!dragEl || !target || dragEl === target) return;
      const rect = target.getBoundingClientRect();
      const before = (e.clientY - rect.top) / rect.height < 0.5;
      list.insertBefore(dragEl, before ? target : target.nextSibling);
    });
  });
}

function closestItem(node) {
  while (node && !node.classList?.contains("item")) node = node.parentNode;
  return node;
}

btnCapture.addEventListener("click", async () => {
  console.log("capture click ");
  await send({ type: "CAPTURE" });
  await refresh();
});

btnClear.addEventListener("click", async () => {
  await send({ type: "CLEAR" });
  await refresh();
});

btnExport.addEventListener("click", async () => {
  const { queue } = await send({ type: "GET_LIST" });
  if (!queue || !queue.length) {
    alert("No pages yet. Capture something first.");
    return;
  }
  console.log("export pdf:", queue);
  await exportPDF(queue.map((q) => q.dataUrl));
});

async function exportPDF(images) {
  console.log("pdf export:", jsPDF, images, window.jspdf.jsPDF);
  const pdf = new window.jspdf.jsPDF("p", "mm", "a4");
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < images.length; i++) {
    if (i > 0) pdf.addPage();
    const { width, height } = await measureImage(images[i]);

    // Scale to fit within A4 while preserving aspect ratio
    const scale = Math.min(pageW / pxToMm(width), pageH / pxToMm(height));
    const w = pxToMm(width) * scale;
    const h = pxToMm(height) * scale;
    const x = (pageW - w) / 2;
    const y = (pageH - h) / 2;

    pdf.addImage(images[i], "PNG", x, y, w, h);
  }

  pdf.save("screenshots.pdf");
}

function measureImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = dataUrl;
  });
}

// Helper: pixels → mm (assuming 96 DPI ≈ 3.78 px/mm)
function pxToMm(px) {
  return px / 3.7795275591;
}

refresh();
