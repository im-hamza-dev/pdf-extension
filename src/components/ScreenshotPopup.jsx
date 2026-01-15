import React, { useState } from 'react';
import { ScreenshotCard } from './ScreenshotCard';

// Simple SVG Icon Components
const X = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Camera = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const FileText = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const FileDown = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
  </svg>
);

const Trash2 = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const Maximize2 = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h4m-4 0V4m0 4l5-5m5 5V4m0 4h4m-4 0v4m0-4l-5-5m-5 5l5 5m-5-5v4m0-4H4" />
  </svg>
);

export function ScreenshotPopup({
  screenshots,
  onClose,
  onCapture,
  onEdit,
  onSave,
  onDelete,
  onExportToLayout,
  onClearAll,
  isPopupContext = false,
}) {
  const [hoveredId, setHoveredId] = useState(null);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return 'Today';
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Content that's shared between both contexts
  const content = (
    <>
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#4974a7" }}>
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl text-gray-900">Screenshot Manager</h2>
              <p className="text-sm text-gray-500">
                {screenshots.length} {screenshots.length === 1 ? 'screenshot' : 'screenshots'} captured
              </p>
            </div>
          </div>
          
          {!isPopupContext && (
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

        {/* Action Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {/* Primary Actions */}
            <button
              onClick={onCapture}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white shadow-sm hover:shadow-md transition-all"
              style={{ backgroundColor: "#4974a7" }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#3d6290"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#4974a7"}
            >
              <Maximize2 className="w-4 h-4" />
              <span className="text-sm font-medium">Capture Screen</span>
            </button>

            <button
              onClick={onExportToLayout}
              disabled={screenshots.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#5a5387" }}
              onMouseOver={(e) => !screenshots.length ? null : e.currentTarget.style.backgroundColor = "#4a4370"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#5a5387"}
            >
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">Layout & Export Report</span>
            </button>

            <div className="flex-1"></div>

            {/* Secondary Actions */}
            {screenshots.length > 0 && (
              <button
                onClick={() => {
                  if (confirm(`Clear all ${screenshots.length} screenshot(s)?`)) {
                    onClearAll();
                  }
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 transition-all text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Screenshots Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {screenshots.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <Camera className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg text-gray-900 mb-2">No screenshots yet</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-md">
                Capture your first screenshot to get started. You can then edit, save, or add them to a PDF report.
              </p>
              <button
                onClick={onCapture}
                className="flex items-center gap-2 px-6 py-3 rounded-lg text-white shadow-sm hover:shadow-md transition-all"
                style={{ backgroundColor: "#4974a7" }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#3d6290"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#4974a7"}
              >
                <Maximize2 className="w-4 h-4" />
                <span className="font-medium">Capture Screen</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {screenshots.map((screenshot, index) => (
                <ScreenshotCard
                  key={screenshot.id}
                  screenshot={screenshot}
                  index={index}
                  onEdit={() => onEdit(screenshot)}
                  onSave={() => onSave(screenshot)}
                  onDelete={() => onDelete(screenshot.id)}
                  onPreview={() => {
                    // Open image in new tab for preview
                    window.open(screenshot.url, '_blank');
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {screenshots.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileDown className="w-4 h-4" />
                <span>
                  Ready to export? Use <span className="font-medium text-[#5a5387]">Layout & Export Report</span> to create your PDF
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">{screenshots.length} ready</span>
              </div>
            </div>
          </div>
        )}
    </>
  );

  // For popup context, render directly without modal wrapper
  if (isPopupContext) {
    return (
      <div 
        className="bg-white w-full h-full flex flex-col overflow-hidden"
        style={{ 
          backgroundColor: 'white', 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden' 
        }}
      >
        {content}
      </div>
    );
  }

  // For modal context, wrap in overlay
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        {content}
      </div>
    </div>
  );
}

