import { jsPDF } from 'jspdf';

// Image optimization configuration
const MAX_IMAGE_DIMENSION = 3000; // Maximum width or height in pixels
const JPEG_QUALITY = 0.85; // Quality from 0.0 to 1.0 (higher = better quality, larger size)
const MAX_DISPLAY_WIDTH_MM = 210; // A4 width in mm
const MAX_DISPLAY_HEIGHT_MM = 297; // A4 height in mm
const MAX_DPI = 300; // Maximum DPI for PDF images (300 DPI is print quality)

/**
 * Optimize and compress an image before adding to PDF
 * @param {string} dataUrl - Image data URL
 * @param {number} maxWidth - Maximum width in pixels
 * @param {number} maxHeight - Maximum height in pixels
 * @param {number} quality - JPEG quality (0.0 to 1.0)
 * @returns {Promise<string>} Optimized image data URL (JPEG format)
 */
async function optimizeImage(dataUrl, maxWidth = MAX_IMAGE_DIMENSION, maxHeight = MAX_IMAGE_DIMENSION, quality = JPEG_QUALITY) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      // Calculate maximum dimensions based on display size and DPI
      // For A4 at 300 DPI: 210mm = 8.27in = 2480px, 297mm = 11.69in = 3508px
      const maxDisplayWidthPx = (MAX_DISPLAY_WIDTH_MM / 25.4) * MAX_DPI;
      const maxDisplayHeightPx = (MAX_DISPLAY_HEIGHT_MM / 25.4) * MAX_DPI;

      // Apply both dimension limits
      const maxW = Math.min(maxWidth, maxDisplayWidthPx);
      const maxH = Math.min(maxHeight, maxDisplayHeightPx);

      // Resize if image is too large
      if (width > maxW || height > maxH) {
        const scale = Math.min(maxW / width, maxH / height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw image on canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to JPEG with compression (always convert to JPEG for smaller file size)
      // Even if image is small, converting PNG to JPEG can reduce file size significantly
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * Get optimized image data URL, reusing original if already optimized
 * @param {string} imageUrl - Image URL (data URL or regular URL)
 * @returns {Promise<string>} Optimized image data URL
 */
async function getOptimizedImage(imageUrl) {
  // If it's already a data URL, optimize it
  if (imageUrl.startsWith('data:')) {
    return await optimizeImage(imageUrl);
  }
  // Otherwise, load it first then optimize
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      const optimized = await optimizeImage(dataUrl);
      resolve(optimized);
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
}

export async function exportPDF(images) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < images.length; i++) {
    if (i > 0) pdf.addPage();
    
    // Optimize image before adding
    const optimizedImage = await getOptimizedImage(images[i]);
    const { width, height } = await measureImage(optimizedImage);

    // Scale to fit within A4 while preserving aspect ratio
    const scale = Math.min(pageW / pxToMm(width), pageH / pxToMm(height));
    const w = pxToMm(width) * scale;
    const h = pxToMm(height) * scale;
    const x = (pageW - w) / 2;
    const y = (pageH - h) / 2;

    // Use JPEG format for optimized images
    pdf.addImage(optimizedImage, 'JPEG', x, y, w, h);
  }

  pdf.save('screenshots.pdf');
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

// Export PDF with custom layout matching the preview
export async function exportPDFWithLayout(pages, queue) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  // Constants matching the preview
  const PAGE_PADDING_MM = 12.7; // p-12 in Tailwind = 48px = 12.7mm at 96 DPI
  const HEADER_MARGIN_BOTTOM_MM = 8; // mb-8 = 32px = 8.5mm
  const MM_TO_PX = 3.7795275591;

  // Spacing in mm (matching Tailwind: gap-2=8px, gap-4=16px, gap-6=24px)
  const getSpacingMM = (spacing) => {
    switch (spacing) {
      case 'small':
        return 2.1; // 8px
      case 'large':
        return 6.4; // 24px
      default:
        return 4.2; // 16px (medium)
    }
  };

  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    if (pageIndex > 0) pdf.addPage();

    const page = pages[pageIndex];
    const { metadata, images, layoutSettings } = page;

    // Debug: log page info
    console.log(`Processing page ${pageIndex + 1}:`, {
      imagesCount: images?.length || 0,
      images: images?.map((img) => ({
        hasImageUrl: !!img?.imageUrl,
        hasUrl: !!img?.url,
        hasDataUrl: !!img?.dataUrl,
        imageId: img?.imageId,
      })),
    });

    // Set background color
    if (layoutSettings.background === 'light-gray') {
      pdf.setFillColor(245, 246, 248);
      pdf.rect(0, 0, pageW, pageH, 'F');
    } else if (layoutSettings.background === 'gradient') {
      // Simple gradient approximation
      pdf.setFillColor(245, 246, 248);
      pdf.rect(0, 0, pageW, pageH, 'F');
    } else {
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageW, pageH, 'F');
    }

    let currentY = PAGE_PADDING_MM;

    // Add header section (title, description, tags, date)
    if (metadata.title) {
      pdf.setFontSize(24); // text-3xl = 30px ≈ 8mm
      pdf.setFont('helvetica', 'bold');
      const titleLines = pdf.splitTextToSize(
        metadata.title,
        pageW - PAGE_PADDING_MM * 2
      );
      pdf.text(titleLines, PAGE_PADDING_MM, currentY);
      currentY += titleLines.length * 8 + 3; // mb-3 = 12px = 3mm
    }

    // Tags and date on same line
    if ((metadata.tags && metadata.tags.length > 0) || metadata.date) {
      let tagDateX = PAGE_PADDING_MM;

      // Add tags
      let tagDateY = currentY;
      if (metadata.tags && metadata.tags.length > 0) {
        pdf.setFontSize(10); // text-sm = 14px ≈ 3.7mm
        pdf.setFillColor(90, 83, 135); // #5a5387
        metadata.tags.forEach((tag, idx) => {
          const tagTextWidth = pdf.getTextWidth(tag);
          const tagPadding = 3; // px-3 = 12px = 3.2mm padding
          const tagWidth = tagTextWidth + tagPadding * 2;
          const tagHeight = 5; // Height for tag background
          if (tagDateX + tagWidth > pageW - PAGE_PADDING_MM) {
            tagDateX = PAGE_PADDING_MM;
            tagDateY += 6;
          }
          // Draw tag background
          pdf.rect(
            tagDateX,
            tagDateY - tagHeight + 1,
            tagWidth,
            tagHeight,
            'F'
          );
          pdf.setTextColor(255, 255, 255);
          pdf.text(tag, tagDateX + tagPadding, tagDateY);
          tagDateX += tagWidth + 2.1; // gap-2 = 8px = 2.1mm
        });
        pdf.setTextColor(0, 0, 0);
        tagDateX += 4.2; // gap-4 = 16px = 4.2mm
      }

      // Add date
      if (metadata.date) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(107, 114, 128); // text-gray-500
        const dateStr = new Date(metadata.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        pdf.text(dateStr, tagDateX, tagDateY);
        pdf.setTextColor(0, 0, 0);
      }

      // Update currentY based on tag/date height
      if (tagDateY > currentY) {
        currentY = tagDateY;
      }

      currentY += HEADER_MARGIN_BOTTOM_MM;
    } else {
      currentY += HEADER_MARGIN_BOTTOM_MM;
    }

    // Calculate grid layout for images
    const availableWidth = pageW - PAGE_PADDING_MM * 2;
    const availableHeight = pageH - currentY - PAGE_PADDING_MM;
    const spacingMM = getSpacingMM(layoutSettings.spacing);

    let cols, rows;
    switch (layoutSettings.layout) {
      case 'single':
        cols = 1;
        rows = 1;
        break;
      case 'two-row':
        cols = 1;
        rows = 2;
        break;
      case 'two-column':
        cols = 2;
        rows = Math.ceil(images.length / 2);
        break;
      case 'three-grid':
        cols = 3;
        rows = Math.ceil(images.length / 3);
        break;
      case 'four-grid':
        cols = 2;
        rows = Math.ceil(images.length / 2);
        break;
      default:
        cols = 1;
        rows = 1;
    }

    // Calculate image dimensions based on grid
    const totalSpacingWidth = spacingMM * (cols - 1);
    const totalSpacingHeight = spacingMM * (rows - 1);
    const imageWidth = (availableWidth - totalSpacingWidth) / cols;
    const imageHeight = imageWidth / (16 / 10); // 16:10 aspect ratio

    // If images are too tall, adjust
    const maxImageHeight = (availableHeight - totalSpacingHeight) / rows;
    let finalImageHeight = Math.min(imageHeight, maxImageHeight);
    let finalImageWidth = finalImageHeight * (16 / 10);

    // Recalculate if width doesn't fit
    if (finalImageWidth * cols + totalSpacingWidth > availableWidth) {
      finalImageWidth = (availableWidth - totalSpacingWidth) / cols;
      finalImageHeight = finalImageWidth / (16 / 10);
    }

    // Add images in grid - use Promise.all to wait for all images
    await Promise.all(
      images.map(async (image, index) => {
        // Check for image with any URL property
        const imageUrl = image?.imageUrl || image?.url || image?.dataUrl;
        if (!image || !imageUrl) {
          console.warn(
            `Skipping image at index ${index}: no valid URL found`,
            image
          );
          return;
        }

        const row = Math.floor(index / cols);
        const col = index % cols;

        const x = PAGE_PADDING_MM + col * (finalImageWidth + spacingMM);
        const y = currentY + row * (finalImageHeight + spacingMM);

        try {
          // Optimize image before adding
          const optimizedImage = await getOptimizedImage(imageUrl);
          
          // Load optimized image to get dimensions
          const img = await new Promise((resolve, reject) => {
            const imgEl = new Image();
            imgEl.onload = () => resolve(imgEl);
            imgEl.onerror = (err) => {
              console.error(
                `Failed to load optimized image at index ${index}:`,
                optimizedImage.substring(0, 50) + '...',
                err
              );
              reject(err);
            };
            imgEl.src = optimizedImage;
          });

          // Calculate actual dimensions maintaining aspect ratio
          const imgAspectRatio = img.width / img.height;
          const slotAspectRatio = 16 / 10;

          let w, h;
          if (imgAspectRatio > slotAspectRatio) {
            // Image is wider - fit to width
            w = finalImageWidth;
            h = finalImageWidth / imgAspectRatio;
            if (h > finalImageHeight) {
              h = finalImageHeight;
              w = finalImageHeight * imgAspectRatio;
            }
          } else {
            // Image is taller - fit to height
            h = finalImageHeight;
            w = finalImageHeight * imgAspectRatio;
            if (w > finalImageWidth) {
              w = finalImageWidth;
              h = finalImageWidth / imgAspectRatio;
            }
          }

          // Center image in slot
          const slotX = x + (finalImageWidth - w) / 2;
          const slotY = y + (finalImageHeight - h) / 2;

          // Use JPEG format for optimized images
          pdf.addImage(optimizedImage, 'JPEG', slotX, slotY, w, h);
        } catch (error) {
          console.error(`Error adding image at index ${index}:`, error);
          // Continue with other images even if one fails
        }
      })
    );

    // Move cursor BELOW the image grid before adding description
    const gridHeight = rows * finalImageHeight + totalSpacingHeight;
    currentY += gridHeight;
    // Add a little margin below images (similar to mt-4)
    currentY += 4.2;

    if (metadata.description) {
      pdf.setFontSize(16); // text-base = 16px ≈ 4.2mm
      pdf.setFont('helvetica', 'normal');
      const descLines = pdf.splitTextToSize(
        metadata.description,
        pageW - PAGE_PADDING_MM * 2
      );
      pdf.text(descLines, PAGE_PADDING_MM, currentY);
      currentY += descLines.length * 4.2 + 4.2; // line height + margin
    }
  }

  pdf.save('screenshots-layout.pdf');
}
