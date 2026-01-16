import React from 'react';
import { getGridClass, getSpacingClass, getBackgroundStyle } from '../utils/layoutHelpers.js';

const FileTextIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export function PreviewMode({ metadata, images, layoutSettings }) {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-6 flex items-center gap-3">
        <FileTextIcon className="w-6 h-6 text-[#588AE8]" />
        <div>
          <h2 className="text-xl text-gray-900">Preview Mode</h2>
          <p className="text-sm text-gray-500">See how your page will appear in the final PDF</p>
        </div>
      </div>

      {/* PDF Page Preview */}
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Page content with proper aspect ratio */}
        <div className="aspect-[8.5/11] p-12" style={getBackgroundStyle(layoutSettings.background)}>
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl text-gray-900 mb-3">{metadata.title}</h1>
            
            {metadata.description && (
              <p className="text-base text-gray-600 leading-relaxed mb-4">
                {metadata.description}
              </p>
            )}

            <div className="flex items-center gap-4 flex-wrap">
              {/* Tags */}
              {metadata.tags && metadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {metadata.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-sm text-white"
                      style={{ backgroundColor: '#5a5387' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Date */}
              {metadata.date && (
                <div className="text-sm text-gray-500">
                  {new Date(metadata.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Images Section */}
          {images.length > 0 && (
            <div className={`grid ${getGridClass(layoutSettings.layout)} ${getSpacingClass(layoutSettings.spacing)}`}>
              {images.map((image) => (
                <div
                  key={image.id}
                  className="rounded-lg overflow-hidden border border-gray-200 shadow-sm"
                  style={{ aspectRatio: '16/10' }}
                >
                  <img
                    src={image.url || image.imageUrl || image.dataUrl}
                    alt={image.alt || image.title || 'Screenshot'}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {images.length === 0 && (
            <div className="flex items-center justify-center py-16 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-400">No images to display</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Preview:</strong> This is how your page will appear in the exported PDF document. 
          The layout, spacing, and styling will be preserved.
        </p>
      </div>
    </div>
  );
}

