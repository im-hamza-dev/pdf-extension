import { jsPDF } from "jspdf";

export async function exportPDF(images) {
  const pdf = new jsPDF("p", "mm", "a4");
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
