import React from 'react';
import { LAYOUT_TYPES } from '../utils/constants.js';

// Icon components (simple SVG icons)
const SquareIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const ColumnsIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
  </svg>
);

const Grid3x3Icon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const Grid2x2Icon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const RowsIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 17h16M4 11h16M4 13h16" />
  </svg>
);

const PaletteIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
  </svg>
);

const layoutOptions = [
  { type: LAYOUT_TYPES.SINGLE, icon: SquareIcon, label: 'Single' },
  { type: LAYOUT_TYPES.TWO_ROW, icon: RowsIcon, label: '2 Rows' },
  { type: LAYOUT_TYPES.TWO_COLUMN, icon: ColumnsIcon, label: 'Two Column' },
  { type: LAYOUT_TYPES.THREE_GRID, icon: Grid3x3Icon, label: 'Three Grid' },
  { type: LAYOUT_TYPES.FOUR_GRID, icon: Grid2x2Icon, label: '2×2 Grid' },
];

const spacingOptions = [
  { type: 'small', label: 'Small' },
  { type: 'medium', label: 'Medium' },
  { type: 'large', label: 'Large' },
];

const backgroundOptions = [
  { type: 'white', label: 'White', preview: '#FFFFFF' },
  { type: 'light-gray', label: 'Light Gray', preview: '#F5F6F8' },
  { type: 'gradient', label: 'Gradient', preview: 'linear-gradient(135deg, #F5F6F8 0%, #E8EAF0 100%)' },
];

export function LayoutControlsPanel({
  layoutSettings,
  onLayoutSettingsChange,
  onShowLayoutSelection,
}) {
  return (
    <div className="space-y-6 sticky top-24">
      {/* Layout Quick Select */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-base text-gray-900 mb-3">Layout</h3>
        <div className="grid grid-cols-2 gap-2">
          {layoutOptions.map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => onLayoutSettingsChange({ ...layoutSettings, layout: type })}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                layoutSettings.layout === type
                  ? 'border-[#4974a7] bg-[#4974a7]/5'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <Icon
                className={`w-6 h-6 ${
                  layoutSettings.layout === type ? 'text-[#4974a7]' : 'text-gray-600'
                }`}
              />
              <span className={`text-xs ${
                layoutSettings.layout === type ? 'text-[#4974a7]' : 'text-gray-600'
              }`}>
                {label}
              </span>
            </button>
          ))}
        </div>
        
        <button
          onClick={onShowLayoutSelection}
          className="w-full mt-3 py-2 text-sm text-[#4974a7] hover:bg-[#4974a7]/5 rounded-lg transition-colors"
        >
          View All Layouts
        </button>
      </div>

      {/* Spacing Options */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-base text-gray-900 mb-3">Spacing</h3>
        <div className="space-y-2">
          {spacingOptions.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => onLayoutSettingsChange({ ...layoutSettings, spacing: type })}
              className={`w-full px-4 py-2.5 rounded-lg text-sm text-left transition-all ${
                layoutSettings.spacing === type
                  ? 'bg-[#4974a7] text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Background Style */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <PaletteIcon className="w-4 h-4 text-gray-600" />
          <h3 className="text-base text-gray-900">Background</h3>
        </div>
        <div className="space-y-2">
          {backgroundOptions.map(({ type, label, preview }) => (
            <button
              key={type}
              onClick={() => onLayoutSettingsChange({ ...layoutSettings, background: type })}
              className={`w-full px-4 py-3 rounded-lg text-sm text-left transition-all border-2 flex items-center gap-3 ${
                layoutSettings.background === type
                  ? 'border-[#4974a7] bg-[#4974a7]/5'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div
                className="w-8 h-8 rounded border border-gray-300"
                style={{ background: preview }}
              />
              <span className={
                layoutSettings.background === type ? 'text-[#4974a7]' : 'text-gray-700'
              }>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-br from-[#4974a7]/10 to-[#5a5387]/10 rounded-xl border border-[#4974a7]/20 p-5">
        <h3 className="text-sm text-gray-900 mb-2">💡 Pro Tip</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Drag and drop images to reorder them. Use layouts that best showcase your screenshots' content.
        </p>
      </div>
    </div>
  );
}

