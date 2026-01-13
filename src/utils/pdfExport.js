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

// Helper: mm → pixels
function mmToPx(mm) {
  return mm * 3.7795275591;
}

// Export PDF with custom layout
export async function exportPDFWithLayout(pages, queue) {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const SCALE = 0.7; // Same scale used in editor
  const PAGE_PADDING_MM = 20;

  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    if (pageIndex > 0) pdf.addPage();
    
    const pageItems = pages[pageIndex];
    
    // Add page title if it's the first page
    if (pageIndex === 0) {
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("Screenshots Collection", PAGE_PADDING_MM, PAGE_PADDING_MM - 10);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.text(new Date().toLocaleDateString(), pageW - PAGE_PADDING_MM - 30, PAGE_PADDING_MM - 10);
    }

    // Convert display coordinates to PDF coordinates (mm)
    // Display uses: A4_WIDTH_PX = A4_WIDTH_MM * MM_TO_PX * SCALE
    // So: display_px = (mm * MM_TO_PX * SCALE)
    // Reverse: mm = display_px / (MM_TO_PX * SCALE)
    const SCALE_FACTOR = 1 / (SCALE * 3.7795275591);

    for (const item of pageItems) {
      // Convert item position and size from display pixels to mm
      const x_mm = PAGE_PADDING_MM + item.x * SCALE_FACTOR;
      const y_mm = PAGE_PADDING_MM + item.y * SCALE_FACTOR;
      const w_mm = item.width * SCALE_FACTOR;
      const h_mm = item.height * SCALE_FACTOR;

      // Add image
      pdf.addImage(item.imageUrl, "PNG", x_mm, y_mm, w_mm, h_mm);

      // Add title if present
      if (item.title) {
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        const titleY = y_mm + h_mm + 5;
        if (titleY < pageH - PAGE_PADDING_MM) {
          pdf.text(item.title, x_mm, titleY);
        }
      }

      // Add description if present
      if (item.description) {
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        const descY = y_mm + h_mm + (item.title ? 10 : 5);
        if (descY < pageH - PAGE_PADDING_MM) {
          const lines = pdf.splitTextToSize(item.description, w_mm);
          pdf.text(lines, x_mm, descY);
        }
      }

      // Add tags if present
      if (item.tags) {
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "italic");
        const tagsY = y_mm + h_mm + (item.description ? 20 : item.title ? 15 : 10);
        if (tagsY < pageH - PAGE_PADDING_MM) {
          pdf.text(`Tags: ${item.tags}`, x_mm, tagsY);
        }
      }
    }
  }

  pdf.save("screenshots-layout.pdf");
}