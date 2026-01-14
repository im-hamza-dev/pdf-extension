import { A4_WIDTH_PX, A4_HEIGHT_PX, PAGE_PADDING_PX, LAYOUT_TYPES } from './constants.js';

/**
 * Create a layout item for an image based on layout type and position
 */
export async function createLayoutItem(image, index, layoutType, totalPerPage = 1) {
  const pageWidth = A4_WIDTH_PX - PAGE_PADDING_PX * 2;
  const pageHeight = A4_HEIGHT_PX - PAGE_PADDING_PX * 2;

  // Load image to get dimensions
  const imageUrl = image.dataUrl || image.url || image.imageUrl;
  const img = await new Promise((resolve, reject) => {
    const imgEl = new Image();
    imgEl.onload = () => resolve(imgEl);
    imgEl.onerror = reject;
    imgEl.src = imageUrl;
  });

  const aspectRatio = img.width / img.height;
  let x, y, width, height;

  switch (layoutType) {
    case LAYOUT_TYPES.SINGLE:
      // Center single image, maintain aspect ratio
      width = Math.min(pageWidth * 0.9, 500);
      height = width / aspectRatio;
      if (height > pageHeight * 0.9) {
        height = pageHeight * 0.9;
        width = height * aspectRatio;
      }
      x = (A4_WIDTH_PX - width) / 2 - PAGE_PADDING_PX;
      y = (A4_HEIGHT_PX - height) / 2 - PAGE_PADDING_PX;
      break;

    case LAYOUT_TYPES.TWO_COLUMN:
      // Two images: side by side
      width = (pageWidth - 10) / 2;
      height = width / aspectRatio;
      if (height > pageHeight / 2 - 10) {
        height = pageHeight / 2 - 10;
        width = height * aspectRatio;
      }
      x = PAGE_PADDING_PX + (index % 2) * ((pageWidth - 10) / 2 + 10);
      y = PAGE_PADDING_PX + Math.floor(index / 2) * (pageHeight / 2 + 10);
      break;

    case LAYOUT_TYPES.THREE_GRID:
      // Three images: 1 large + 2 small
      if (index === 0) {
        // Large image on left
        width = (pageWidth - 10) * 0.6;
        height = width / aspectRatio;
        if (height > pageHeight - 10) {
          height = pageHeight - 10;
          width = height * aspectRatio;
        }
        x = PAGE_PADDING_PX;
        y = PAGE_PADDING_PX;
      } else {
        // Two smaller images on right
        width = (pageWidth - 10) * 0.35;
        height = width / aspectRatio;
        if (height > (pageHeight - 10) / 2) {
          height = (pageHeight - 10) / 2;
          width = height * aspectRatio;
        }
        x = PAGE_PADDING_PX + (pageWidth - 10) * 0.6 + 10;
        y = PAGE_PADDING_PX + (index - 1) * ((pageHeight - 10) / 2 + 10);
      }
      break;

    case LAYOUT_TYPES.FOUR_GRID:
      // Four images: 2x2 grid
      width = (pageWidth - 10) / 2;
      height = width / aspectRatio;
      if (height > (pageHeight - 10) / 2) {
        height = (pageHeight - 10) / 2;
        width = height * aspectRatio;
      }
      x = PAGE_PADDING_PX + (index % 2) * ((pageWidth - 10) / 2 + 10);
      y = PAGE_PADDING_PX + Math.floor(index / 2) * ((pageHeight - 10) / 2 + 10);
      break;

    default:
      // Fallback: center
      width = Math.min(pageWidth * 0.9, 500);
      height = width / aspectRatio;
      x = (A4_WIDTH_PX - width) / 2 - PAGE_PADDING_PX;
      y = (A4_HEIGHT_PX - height) / 2 - PAGE_PADDING_PX;
  }

  return {
    id: image.id || `item-${Date.now()}-${index}`,
    imageId: image.id,
    imageUrl: imageUrl,
    url: imageUrl,
    dataUrl: imageUrl,
    x,
    y,
    width,
    height,
    title: '',
    description: '',
    tags: '',
    originalWidth: img.width,
    originalHeight: img.height,
  };
}

/**
 * Get grid class for layout type
 */
export function getGridClass(layoutType) {
  switch (layoutType) {
    case LAYOUT_TYPES.SINGLE:
      return 'grid-cols-1';
    case LAYOUT_TYPES.TWO_ROW:
      return 'grid-cols-1';
    case LAYOUT_TYPES.TWO_COLUMN:
      return 'grid-cols-2';
    case LAYOUT_TYPES.THREE_GRID:
      return 'grid-cols-3';
    case LAYOUT_TYPES.FOUR_GRID:
      return 'grid-cols-2';
    default:
      return 'grid-cols-1';
  }
}

/**
 * Get spacing class
 */
export function getSpacingClass(spacing) {
  switch (spacing) {
    case 'small':
      return 'gap-2';
    case 'medium':
      return 'gap-4';
    case 'large':
      return 'gap-6';
    default:
      return 'gap-4';
  }
}

/**
 * Get background style
 */
export function getBackgroundStyle(backgroundType) {
  switch (backgroundType) {
    case 'white':
      return { backgroundColor: '#FFFFFF' };
    case 'light-gray':
      return { backgroundColor: '#F5F6F8' };
    case 'gradient':
      return { background: 'linear-gradient(135deg, #F5F6F8 0%, #E8EAF0 100%)' };
    default:
      return { backgroundColor: '#FFFFFF' };
  }
}

