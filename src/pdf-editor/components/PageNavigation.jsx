import React from 'react';

// Icon components
const PlusIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const TrashIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export function PageNavigation({
  pages,
  currentPageIndex,
  onPageChange,
  onAddPage,
  onDeletePage,
}) {
  return (
    <div className="bg-white border-t border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center gap-4">
          {/* Page Thumbnails */}
          <div className="flex-1 flex items-center gap-3 overflow-x-auto pb-2">
            {pages.map((page, index) => (
              <div
                key={page.id}
                className="flex-shrink-0 group relative"
              >
                <button
                  onClick={() => onPageChange(index)}
                  className={`w-20 h-24 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                    currentPageIndex === index
                      ? 'border-[#588AE8] bg-[#588AE8]/10 shadow-lg'
                      : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:shadow-md'
                  }`}
                >
                  {/* Page thumbnail mini preview */}
                  <div className="w-12 h-14 bg-white rounded border border-gray-200 overflow-hidden">
                    {page.images && page.images.length > 0 ? (
                      <img
                        src={page.images[0].url || page.images[0].imageUrl || page.images[0].dataUrl}
                        alt={`Page ${index + 1} preview`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-3 h-3 rounded bg-gray-200"></div>
                      </div>
                    )}
                  </div>
                  
                  <span className={`text-xs ${
                    currentPageIndex === index ? 'text-[#588AE8] font-medium' : 'text-gray-600'
                  }`}>
                    Page {index + 1}
                  </span>
                </button>

                {/* Delete button (only show if more than 1 page) */}
                {pages.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete Page ${index + 1}?`)) {
                        onDeletePage(index);
                      }
                    }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                    aria-label={`Delete page ${index + 1}`}
                  >
                    <TrashIcon className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}

            {/* Add Page Button */}
            <button
              onClick={onAddPage}
              className="w-20 h-24 flex-shrink-0 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-[#588AE8] hover:bg-[#588AE8]/5 transition-all flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-[#588AE8]"
            >
              <PlusIcon className="w-5 h-5" />
              <span className="text-xs">Add Page</span>
            </button>
          </div>

          {/* Page Counter */}
          <div className="flex-shrink-0 px-4 py-2 bg-gray-100 rounded-lg">
            <span className="text-sm text-gray-600">
              {pages.length} {pages.length === 1 ? 'page' : 'pages'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

