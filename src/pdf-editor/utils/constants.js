// A4 dimensions in mm (at scale 0.7, so in pixels for display)
export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;
export const SCALE = 0.7;
export const MM_TO_PX = 3.7795275591; // 96 DPI
export const A4_WIDTH_PX = A4_WIDTH_MM * MM_TO_PX * SCALE;
export const A4_HEIGHT_PX = A4_HEIGHT_MM * MM_TO_PX * SCALE;
export const PAGE_PADDING_MM = 20;
export const PAGE_PADDING_PX = PAGE_PADDING_MM * MM_TO_PX * SCALE;

// Layout types
export const LAYOUT_TYPES = {
  SINGLE: 'single',
  TWO_COLUMN: 'two-column',
  THREE_GRID: 'three-grid',
  FOUR_GRID: 'four-grid',
  TWO_ROW: 'two-row',
};

// Spacing types
export const SPACING_TYPES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
};

// Background types
export const BACKGROUND_TYPES = {
  WHITE: 'white',
  LIGHT_GRAY: 'light-gray',
  GRADIENT: 'gradient',
};

// Report types
export const REPORT_TYPES = {
  GENERAL: 'general-report',
  BUG: 'bug-report',
};

// Priority levels
export const PRIORITY_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

// Priority colors (RGB for PDF, Tailwind classes for preview)
export const PRIORITY_COLORS = {
  'Low': {
    rgb: { r: 220, g: 252, b: 231 }, // green-100
    textRgb: { r: 22, g: 101, b: 52 }, // green-800
    tailwind: 'bg-green-100 text-green-800 border-green-300',
  },
  'Medium': {
    rgb: { r: 254, g: 243, b: 199 }, // yellow-100
    textRgb: { r: 133, g: 77, b: 14 }, // yellow-800
    tailwind: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  },
  'High': {
    rgb: { r: 254, g: 226, b: 226 }, // red-100
    textRgb: { r: 153, g: 27, b: 27 }, // red-800
    tailwind: 'bg-red-100 text-red-800 border-red-300',
  },
  'Critical': {
    rgb: { r: 254, g: 226, b: 226 }, // red-100 (darker red)
    textRgb: { r: 127, g: 29, b: 29 }, // red-900
    tailwind: 'bg-red-200 text-red-900 border-red-400',
  },
};
