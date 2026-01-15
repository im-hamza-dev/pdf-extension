import React, { useState } from 'react';

// Simple SVG Icon Components
const Edit3 = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const Download = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const Trash2 = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ZoomIn = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
  </svg>
);

const Clock = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export function ScreenshotCard({
  screenshot,
  index,
  onEdit,
  onSave,
  onDelete,
  onPreview,
}) {
  const [isHovered, setIsHovered] = useState(false);

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

  return (
    <div
      className="group relative bg-white border-2 border-gray-200 rounded-xl hover:border-[#4974a7] hover:shadow-lg transition-all overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Screenshot Preview */}
        <div className="relative flex-shrink-0">
          <button
            onClick={onPreview}
            className="w-32 h-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:border-[#4974a7] transition-all group/preview"
          >
            <img
              src={screenshot.thumbnail || screenshot.url}
              alt={`Screenshot ${index + 1}`}
              className="w-full h-full object-cover group-hover/preview:scale-105 transition-transform"
            />
            
            {/* Preview Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
              <ZoomIn className="w-6 h-6 text-white" />
            </div>
          </button>

          {/* Screenshot Number Badge */}
          <div 
            className="absolute -top-2 -left-2 w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-semibold shadow-md"
            style={{ backgroundColor: "#4974a7" }}
          >
            {index + 1}
          </div>
        </div>

        {/* Screenshot Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h4 className="text-sm font-medium text-gray-900">
              Screenshot {index + 1}
            </h4>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
              {formatDate(screenshot.timestamp)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(screenshot.timestamp)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`flex items-center gap-2 transition-all ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
        }`}>
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all text-sm"
            title="Edit screenshot"
          >
            <Edit3 className="w-4 h-4" />
            <span className="hidden lg:inline">Edit</span>
          </button>

          <button
            onClick={onSave}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-white transition-all text-sm shadow-sm hover:shadow"
            style={{ backgroundColor: "#5a5387" }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#4a4370"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#5a5387"}
            title="Save screenshot"
          >
            <Download className="w-4 h-4" />
            <span className="hidden lg:inline">Save</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Delete this screenshot?')) {
                onDelete();
              }
            }}
            className="w-9 h-9 rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 transition-all flex items-center justify-center"
            title="Delete screenshot"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hover Effect Border Gradient */}
      <div 
        className={`absolute inset-0 pointer-events-none rounded-xl transition-opacity ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ 
          background: 'linear-gradient(to right, rgba(73, 116, 167, 0.05), rgba(90, 83, 135, 0.05))'
        }}
      ></div>
    </div>
  );
}

