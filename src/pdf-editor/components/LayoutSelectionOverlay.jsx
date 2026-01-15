import React from 'react';
import { LAYOUT_TYPES } from '../utils/constants.js';

const XIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const layoutOptions = [
  {
    type: LAYOUT_TYPES.SINGLE,
    name: 'Single Image',
    description: 'One large image taking the full width',
    imageCount: '1 image',
    preview: (
      <div className="w-full h-full p-2">
        <div className="w-full h-full bg-gradient-to-br from-[#588AE8] to-[#5a5387] rounded"></div>
      </div>
    ),
  },
  {
    type: LAYOUT_TYPES.TWO_ROW,
    name: 'Two Rows (Stacked)',
    description: 'Two images stacked vertically',
    imageCount: '2 images',
    preview: (
      <div className="w-full h-full p-2 grid grid-rows-2 gap-1">
        <div className="bg-gradient-to-br from-[#588AE8] to-[#5a5387] rounded"></div>
        <div className="bg-gradient-to-br from-[#5a5387] to-[#574269] rounded"></div>
      </div>
    ),
  },
  {
    type: LAYOUT_TYPES.TWO_COLUMN,
    name: 'Two Column',
    description: 'Two images displayed side by side',
    imageCount: '2 images',
    preview: (
      <div className="w-full h-full p-2 grid grid-cols-2 gap-1">
        <div className="bg-gradient-to-br from-[#588AE8] to-[#5a5387] rounded"></div>
        <div className="bg-gradient-to-br from-[#5a5387] to-[#574269] rounded"></div>
      </div>
    ),
  },
  {
    type: LAYOUT_TYPES.THREE_GRID,
    name: 'Three Grid',
    description: 'Three images in an asymmetric grid layout',
    imageCount: '3 images',
    preview: (
      <div className="w-full h-full p-2 grid grid-cols-3 gap-1">
        <div className="bg-gradient-to-br from-[#588AE8] to-[#5a5387] rounded"></div>
        <div className="bg-gradient-to-br from-[#5a5387] to-[#574269] rounded"></div>
        <div className="bg-gradient-to-br from-[#574269] to-[#588AE8] rounded"></div>
      </div>
    ),
  },
  {
    type: LAYOUT_TYPES.FOUR_GRID,
    name: '2×2 Grid',
    description: 'Four images in a balanced grid',
    imageCount: '4 images',
    preview: (
      <div className="w-full h-full p-2 grid grid-cols-2 gap-1">
        <div className="bg-gradient-to-br from-[#588AE8] to-[#5a5387] rounded"></div>
        <div className="bg-gradient-to-br from-[#5a5387] to-[#574269] rounded"></div>
        <div className="bg-gradient-to-br from-[#574269] to-[#588AE8] rounded"></div>
        <div className="bg-gradient-to-br from-[#588AE8] to-[#5a5387] rounded"></div>
      </div>
    ),
  },
];

export function LayoutSelectionOverlay({
  currentLayout,
  onSelectLayout,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-[#588AE8]/5 to-[#5a5387]/5">
          <div>
            <h2 className="text-xl text-gray-900">Select Layout</h2>
            <p className="text-sm text-gray-600 mt-0.5">
              Choose how your images will be arranged on the page
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <XIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Layout Options Grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-2 gap-4">
            {layoutOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => onSelectLayout(option.type)}
                className={`relative group text-left rounded-xl border-2 transition-all overflow-hidden ${
                  currentLayout === option.type
                    ? 'border-[#588AE8] bg-[#588AE8]/5 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'
                }`}
              >
                {/* Preview Area */}
                <div className="aspect-video bg-gray-50 relative">
                  {option.preview}
                  
                  {/* Selected Badge */}
                  {currentLayout === option.type && (
                    <div className="absolute top-3 right-3 bg-[#588AE8] text-white p-1.5 rounded-full shadow-lg">
                      <CheckIcon className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`text-base ${
                      currentLayout === option.type ? 'text-[#588AE8]' : 'text-gray-900'
                    }`}>
                      {option.name}
                    </h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {option.imageCount}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {option.description}
                  </p>
                </div>

                {/* Hover Effect */}
                <div className={`absolute inset-0 pointer-events-none transition-opacity ${
                  currentLayout === option.type
                    ? 'opacity-0'
                    : 'opacity-0 group-hover:opacity-100'
                }`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#588AE8]/10 to-transparent"></div>
                </div>
              </button>
            ))}
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>Tip:</strong> The layout you choose will determine how many images can be displayed on the page. 
              You can add or remove images after selecting a layout.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

