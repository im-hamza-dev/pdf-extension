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
