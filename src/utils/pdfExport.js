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
async function optimizeImage(
  dataUrl,
  maxWidth = MAX_IMAGE_DIMENSION,
  maxHeight = MAX_IMAGE_DIMENSION,
  quality = JPEG_QUALITY
) {
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
export async function exportPDFWithLayout(
  pages,
  queue,
  reportType = 'general-report'
) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  // Constants matching the preview
  const PAGE_PADDING_MM = 12.7; // p-12 in Tailwind = 48px = 12.7mm at 96 DPI
  const TOP_PADDING_EXTRA_MM = 10; // Additional top padding for each page
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

    // Check if this is a bug report
    const isBugReport = reportType === 'bug-report';

    if (isBugReport) {
      // Get global metadata from first page (title, subtitle)
      const firstPageMetadata = pages[0]?.metadata || {};
      // Render bug report format - pass pageIndex to know if it's first page
      await renderBugReport(
        pdf,
        page,
        pageW,
        pageH,
        PAGE_PADDING_MM,
        pageIndex === 0, // isFirstPage
        firstPageMetadata // global metadata for title/subtitle
      );
    } else {
      // Render general report format (existing code)
      await renderGeneralReport(
        pdf,
        page,
        pageW,
        pageH,
        PAGE_PADDING_MM,
        HEADER_MARGIN_BOTTOM_MM,
        getSpacingMM
      );
    }
  }

  pdf.save(
    reportType === 'bug-report' ? 'bug-report.pdf' : 'screenshots-layout.pdf'
  );
}

async function renderBugReport(
  pdf,
  page,
  pageW,
  pageH,
  PAGE_PADDING_MM,
  isFirstPage,
  globalMetadata
) {
  const { metadata, images, layoutSettings } = page; // metadata is page-specific (description, priority, browser, device)

  // Set background color based on layoutSettings (like general report)
  if (layoutSettings?.background === 'light-gray') {
    pdf.setFillColor(245, 246, 248);
    pdf.rect(0, 0, pageW, pageH, 'F');
  } else if (layoutSettings?.background === 'gradient') {
    // Simple gradient approximation
    pdf.setFillColor(245, 246, 248);
    pdf.rect(0, 0, pageW, pageH, 'F');
  } else {
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageW, pageH, 'F');
  }

  // Increased top padding for each page
  const TOP_PADDING_EXTRA_MM = 10;
  let currentY = PAGE_PADDING_MM + TOP_PADDING_EXTRA_MM;

  // Only render header banner on first page with global title/subtitle
  if (isFirstPage) {
    // Calculate header content height first
    let headerContentY = 12; // Increased padding from top

    // Window controls (three dots)
    headerContentY += 12; // Increased space below dots

    // Title (from global metadata)
    if (globalMetadata.title) {
      pdf.setFontSize(20); // text-3xl equivalent
      const titleLines = pdf.splitTextToSize(
        globalMetadata.title,
        pageW - PAGE_PADDING_MM * 2
      );
      headerContentY += titleLines.length * 6 + 2;
    }

    // Subtitle (from global metadata)
    if (globalMetadata.subtitle) {
      pdf.setFontSize(12); // text-lg equivalent
      const subtitleLines = pdf.splitTextToSize(
        globalMetadata.subtitle,
        pageW - PAGE_PADDING_MM * 2
      );
      headerContentY += subtitleLines.length * 5 + 4;
    }

    // Don't include badges in header height calculation - they're shown above description

    const headerHeight = headerContentY + 8; // Add bottom padding

    // Draw header background with gradient effect from left to right
    // Since jsPDF doesn't support gradients directly, we'll use a gradient-like effect
    // by drawing multiple rectangles with different colors
    const gradientSteps = 20;
    const startColor = { r: 88, g: 138, b: 232 }; // #588AE8
    const endColor = { r: 90, g: 83, b: 135 }; // #5a5387

    for (let i = 0; i < gradientSteps; i++) {
      const ratio = i / (gradientSteps - 1);
      const r = Math.round(startColor.r + (endColor.r - startColor.r) * ratio);
      const g = Math.round(startColor.g + (endColor.g - startColor.g) * ratio);
      const b = Math.round(startColor.b + (endColor.b - startColor.b) * ratio);

      pdf.setFillColor(r, g, b);
      const x = (pageW / gradientSteps) * i;
      const w = pageW / gradientSteps;
      pdf.rect(x, 0, w + 1, headerHeight, 'F'); // +1 to avoid gaps, left to right gradient
    }

    // Now draw the content on top
    let headerY = 12; // Increased padding from top

    // Window controls (three dots)
    pdf.setFillColor(200, 200, 200); // Lighter color for opacity effect
    for (let i = 0; i < 3; i++) {
      pdf.circle(PAGE_PADDING_MM + i * 5, headerY, 1.5, 'F');
    }

    headerY += 12; // Increased space below dots

    // Title (from global metadata)
    if (globalMetadata.title) {
      pdf.setFontSize(20); // text-3xl equivalent
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      const titleLines = pdf.splitTextToSize(
        globalMetadata.title,
        pageW - PAGE_PADDING_MM * 2
      );
      pdf.text(titleLines, PAGE_PADDING_MM, headerY);
      headerY += titleLines.length * 6 + 2;
    }

    // Subtitle (from global metadata)
    if (globalMetadata.subtitle) {
      pdf.setFontSize(12); // text-lg equivalent
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(240, 240, 240); // Slightly lighter white for opacity effect
      const subtitleLines = pdf.splitTextToSize(
        globalMetadata.subtitle,
        pageW - PAGE_PADDING_MM * 2
      );
      pdf.text(subtitleLines, PAGE_PADDING_MM, headerY);
      headerY += subtitleLines.length * 5 + 4;
    }

    // Don't show badges in header - they'll be shown above description

    currentY = headerHeight + PAGE_PADDING_MM;
  }

  // Content section
  // Priority, Browser, Device tags (above description)
  if (metadata.priority || metadata.browser || metadata.device) {
    // Priority color mapping
    const PRIORITY_COLORS_PDF = {
      Low: { bg: { r: 220, g: 252, b: 231 }, text: { r: 22, g: 101, b: 52 } }, // green-100/800
      Medium: {
        bg: { r: 254, g: 243, b: 199 },
        text: { r: 133, g: 77, b: 14 },
      }, // yellow-100/800
      High: { bg: { r: 254, g: 226, b: 226 }, text: { r: 153, g: 27, b: 27 } }, // red-100/800
      Critical: {
        bg: { r: 254, g: 226, b: 226 },
        text: { r: 127, g: 29, b: 29 },
      }, // red-200/900
    };

    const badges = [];
    if (metadata.priority) {
      badges.push({
        text: `Priority: ${metadata.priority}`,
        type: 'priority',
        priority: metadata.priority,
      });
    }
    if (metadata.browser) {
      badges.push({ text: `Browser: ${metadata.browser}`, type: 'browser' });
    }
    if (metadata.device) {
      badges.push({ text: `Device: ${metadata.device}`, type: 'device' });
    }

    if (badges.length > 0) {
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');

      let badgeX = PAGE_PADDING_MM;
      badges.forEach((badge) => {
        const badgeWidth = pdf.getTextWidth(badge.text) + 6;
        if (badgeX + badgeWidth > pageW - PAGE_PADDING_MM) {
          badgeX = PAGE_PADDING_MM;
          currentY += 5;
        }

        // Use priority-specific color for priority badge, light blue for others
        let bgColor, textColor;
        if (badge.type === 'priority' && PRIORITY_COLORS_PDF[badge.priority]) {
          bgColor = PRIORITY_COLORS_PDF[badge.priority].bg;
          textColor = PRIORITY_COLORS_PDF[badge.priority].text;
        } else {
          bgColor = { r: 219, g: 234, b: 254 }; // Light blue for browser/device
          textColor = { r: 75, g: 85, b: 99 }; // text-gray-600
        }

        pdf.setFillColor(bgColor.r, bgColor.g, bgColor.b);
        // Use rounded rectangle with larger radius (3mm) to match rounded-full in preview
        // Increased vertical padding: height 6mm (from 4mm), position adjusted
        const badgeHeight = 6; // Increased from 4 to 6 for more vertical padding
        const badgePaddingY = 2; // Vertical padding for each tag (2mm)
        pdf.roundedRect(
          badgeX,
          currentY - badgeHeight / 2 + 1,
          badgeWidth,
          badgeHeight,
          3,
          3,
          'F'
        );
        pdf.setTextColor(textColor.r, textColor.g, textColor.b);
        pdf.text(badge.text, badgeX + 3, currentY + badgePaddingY);
        badgeX += badgeWidth + 2.1; // gap-2
      });
      pdf.setTextColor(0, 0, 0);
      currentY += 10; // Increased margin below badges
    }
  }

  // Description
  if (metadata.description) {
    currentY += 4; // Increased space above description heading
    pdf.setFontSize(12); // text-lg
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(17, 24, 39); // text-gray-900
    pdf.text('Description', PAGE_PADDING_MM, currentY);
    currentY += 8; // Increased space between heading and description text

    pdf.setFontSize(10); // text-base
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(75, 85, 99); // text-gray-600
    const descLines = pdf.splitTextToSize(
      metadata.description,
      pageW - PAGE_PADDING_MM * 2
    );
    pdf.text(descLines, PAGE_PADDING_MM, currentY);
    currentY += descLines.length * 4.5 + 6;
  }

  // Screenshots section
  if (images && images.length > 0) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(17, 24, 39);
    pdf.text('Screenshots', PAGE_PADDING_MM, currentY);
    currentY += 2.3; // 20px margin bottom (20px / 3.78 ≈ 5.3mm)

    // Grid layout for screenshots (1 column for single image, 2 columns for multiple)
    const cols = images.length === 1 ? 1 : 2;
    const rows = Math.ceil(images.length / cols);
    const availableWidth = pageW - PAGE_PADDING_MM * 2;
    const gap = 4.2; // gap-4 = 16px = 4.2mm
    const imageWidth = (availableWidth - gap) / cols;
    const imageHeight = imageWidth * (10 / 16); // 16:10 aspect ratio

    // Check available height for images
    const footerY = pageH - 15; // Reserve space for footer
    const availableHeightForImages = footerY - currentY;
    const maxRowsThatFit = Math.floor(
      (availableHeightForImages + gap) / (imageHeight + gap)
    );

    // Use Promise.all to load all images, then draw them
    const imagePromises = images.map(async (image, index) => {
      const imageUrl = image?.imageUrl || image?.url || image?.dataUrl;
      if (!imageUrl) return null;

      try {
        const optimizedImage = await getOptimizedImage(imageUrl);
        const img = await new Promise((resolve, reject) => {
          const imgEl = new Image();
          imgEl.onload = () => resolve(imgEl);
          imgEl.onerror = reject;
          imgEl.src = optimizedImage;
        });

        return {
          index,
          optimizedImage,
          img,
          width: img.width,
          height: img.height,
        };
      } catch (error) {
        console.error(`Error loading image ${index}:`, error);
        return null;
      }
    });

    const loadedImages = await Promise.all(imagePromises);

    // Draw images
    for (let i = 0; i < loadedImages.length; i++) {
      const imageData = loadedImages[i];
      if (!imageData) continue;

      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = PAGE_PADDING_MM + col * (imageWidth + gap);
      const y = currentY + row * (imageHeight + gap);

      // Check if this row fits on the page
      if (row >= maxRowsThatFit && row > 0) {
        // This would need to go to next page, but we'll try to fit it
        // For now, just continue drawing
      }

      const imgAspectRatio = imageData.width / imageData.height;
      const slotAspectRatio = 16 / 10;

      let w, h;
      if (imgAspectRatio > slotAspectRatio) {
        w = imageWidth;
        h = imageWidth / imgAspectRatio;
        if (h > imageHeight) {
          h = imageHeight;
          w = imageHeight * imgAspectRatio;
        }
      } else {
        h = imageHeight;
        w = imageHeight * imgAspectRatio;
        if (w > imageWidth) {
          w = imageWidth;
          h = imageWidth / imgAspectRatio;
        }
      }

      const slotX = x + (imageWidth - w) / 2;
      const slotY = y + (imageHeight - h) / 2;

      // Add box shadow effect (scattered/blurred shadow)
      // Draw multiple overlapping rectangles that progressively get larger, lighter, and more offset
      const shadowSpread = 4.5; // mm total spread of shadow (slightly more scattered)
      const shadowOffsetX = 0; // mm horizontal offset (shadow goes right)
      const shadowOffsetY = 0; // mm vertical offset (shadow goes down)
      const shadowLayers = 12; // More layers for smoother scattered effect

      // Draw shadow layers from largest (outermost, lightest) to smallest (innermost, darkest)
      // Each layer is progressively smaller and darker
      for (let i = shadowLayers - 1; i >= 0; i--) {
        const progress = i / (shadowLayers - 1); // 1.0 (outermost) to 0.0 (innermost)

        // Shadow spread increases from 0 to shadowSpread
        const spreadAmount = shadowSpread * progress;

        // Offset increases with layer (outer layers offset more)
        const offsetX = shadowOffsetX * (0.2 + progress * 0.8);
        const offsetY = shadowOffsetY * (0.2 + progress * 0.8);

        // Color gets lighter and more faded as we go outward (from light gray 220 to nearly white 250)
        const grayValue = 230 + progress * 20; // More light gray and faded

        pdf.setFillColor(grayValue, grayValue, grayValue);
        pdf.roundedRect(
          slotX + offsetX - spreadAmount / 2,
          slotY + offsetY - spreadAmount / 2,
          w + spreadAmount,
          h + spreadAmount,
          2 + spreadAmount / 4,
          2 + spreadAmount / 4,
          'F'
        );
      }

      // Draw image with rounded corners (overflow hidden by clipping to rounded rect)
      // Since jsPDF doesn't support clipping well, we'll draw a rounded rectangle mask
      // But for now, just draw the image - the rounded corners will be handled by the border if needed
      pdf.addImage(imageData.optimizedImage, 'JPEG', slotX, slotY, w, h);

      // No border - removed border drawing
    }

    // Update currentY based on actual rows drawn
    const actualRowsDrawn = Math.min(rows, maxRowsThatFit);
    currentY += actualRowsDrawn * (imageHeight + gap) + 6;
  }

  // Steps to Reproduce (page-specific)
  if (metadata.stepsToReproduce && metadata.stepsToReproduce.length > 0) {
    // Check if we have space before footer
    const footerY = pageH - 10;
    if (currentY < footerY - 20) {
      // We have space, add the steps
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(17, 24, 39);
      pdf.text('Steps to Reproduce', PAGE_PADDING_MM, currentY);
      currentY += 8; // Increased space between heading and steps

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(75, 85, 99);

      metadata.stepsToReproduce.forEach((step, index) => {
        // Check if we need to move to next line
        if (currentY > footerY - 15) {
          // Not enough space, skip remaining steps
          return;
        }
        const stepText = `${index + 1}. ${step}`;
        const stepLines = pdf.splitTextToSize(
          stepText,
          pageW - PAGE_PADDING_MM * 2 - 5
        );
        pdf.text(stepLines, PAGE_PADDING_MM + 5, currentY);
        currentY += stepLines.length * 4.5 + 1;
      });

      currentY += 4;
    }
  }

  // Footer - show on every page
  const footerY = pageH - 10;
  pdf.setDrawColor(229, 231, 235); // border-gray-200
  pdf.line(PAGE_PADDING_MM, footerY, pageW - PAGE_PADDING_MM, footerY);

  const footerTextY = footerY + 4;
  pdf.setFontSize(8); // text-sm
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(107, 114, 128); // text-gray-500
  // pdf.text('Generated by SnapDoc', PAGE_PADDING_MM, footerTextY);
}

async function renderGeneralReport(
  pdf,
  page,
  pageW,
  pageH,
  PAGE_PADDING_MM,
  HEADER_MARGIN_BOTTOM_MM,
  getSpacingMM
) {
  const { metadata, images, layoutSettings } = page;

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

  // Increased top padding for each page
  const TOP_PADDING_EXTRA_MM = 10;
  let currentY = PAGE_PADDING_MM + TOP_PADDING_EXTRA_MM;

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

    // Add tags (matching preview: rounded-full with #5a5387 background and white text)
    let tagDateY = currentY;
    if (metadata.tags && metadata.tags.length > 0) {
      pdf.setFontSize(10); // text-sm = 14px ≈ 3.7mm
      metadata.tags.forEach((tag, idx) => {
        const tagTextWidth = pdf.getTextWidth(tag);
        const tagPadding = 3.2; // px-3 = 12px = 3.2mm padding (consistent)
        const tagPaddingY = 2;
        const tagWidth = tagTextWidth + tagPadding * 2;
        const tagHeight = 6; // Increased height for proper vertical padding (matching bug report)
        if (tagDateX + tagWidth > pageW - PAGE_PADDING_MM) {
          tagDateX = PAGE_PADDING_MM;
          tagDateY += 7; // Slightly more space between rows
        }
        // Set fill color BEFORE drawing each tag background
        pdf.setFillColor(90, 83, 135); // #5a5387 - consistent background color
        // Draw tag background with rounded corners (rounded-full = large radius)
        // Use radius approximately half the height for rounded-full effect
        pdf.roundedRect(
          tagDateX,
          tagDateY - tagHeight / 2 + 1,
          tagWidth,
          tagHeight,
          3,
          3,
          'F'
        );

        pdf.setTextColor(255, 255, 255); // White text (consistent)
        pdf.text(tag, tagDateX + tagPadding, tagDateY + tagPaddingY);
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

        // Add box shadow effect (scattered/blurred shadow)
        // Draw multiple overlapping rectangles that progressively get larger, lighter, and more offset
        const shadowSpread = 4.5; // mm total spread of shadow (slightly more scattered)
        const shadowOffsetX = 0; // mm horizontal offset (shadow goes right)
        const shadowOffsetY = 0; // mm vertical offset (shadow goes down)
        const shadowLayers = 12; // More layers for smoother scattered effect

        // Draw shadow layers from largest (outermost, lightest) to smallest (innermost, darkest)
        // Each layer is progressively smaller and darker
        for (let i = shadowLayers - 1; i >= 0; i--) {
          const progress = i / (shadowLayers - 1); // 1.0 (outermost) to 0.0 (innermost)

          // Shadow spread increases from 0 to shadowSpread
          const spreadAmount = shadowSpread * progress;

          // Offset increases with layer (outer layers offset more)
          const offsetX = shadowOffsetX * (0.2 + progress * 0.8);
          const offsetY = shadowOffsetY * (0.2 + progress * 0.8);

          // Color gets lighter and more faded as we go outward (from light gray 200 to nearly white 250)
          const grayValue = 230 + progress * 20; // More light gray and faded

          pdf.setFillColor(grayValue, grayValue, grayValue);
          pdf.roundedRect(
            slotX + offsetX - spreadAmount / 2,
            slotY + offsetY - spreadAmount / 2,
            w + spreadAmount,
            h + spreadAmount,
            2 + spreadAmount / 4,
            2 + spreadAmount / 4,
            'F'
          );
        }

        // Draw image with rounded corners (overflow hidden by clipping to rounded rect)
        // Since jsPDF doesn't support clipping well, we'll just draw the image
        pdf.addImage(optimizedImage, 'JPEG', slotX, slotY, w, h);

        // No border - removed border drawing
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
    // Add "Description" heading similar to bug report
    pdf.setFontSize(12); // text-lg, same as bug report
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(17, 24, 39); // text-gray-900
    pdf.text('Description', PAGE_PADDING_MM, currentY);
    currentY += 8; // Space between heading and description text (like bug report)

    // Description text
    pdf.setFontSize(10); // text-base, same as bug report
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(75, 85, 99); // text-gray-600
    const descLines = pdf.splitTextToSize(
      metadata.description,
      pageW - PAGE_PADDING_MM * 2
    );
    pdf.text(descLines, PAGE_PADDING_MM, currentY);
    currentY += descLines.length * 4.5 + 6; // line height + margin (same as bug report)
  }
}
