import React from 'react';
import { getGridClass, getSpacingClass, getBackgroundStyle } from '../utils/layoutHelpers.js';
import { LAYOUT_TYPES } from '../utils/constants.js';

// Icon components
const PlusIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const ImageIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const UploadIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const TrashIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export function RightPreview({ page, onImagesChange, availableImages = [], onAddImage }) {
  const { metadata, images, layoutSettings } = page;

  const getMaxImages = () => {
    switch (layoutSettings.layout) {
      case LAYOUT_TYPES.SINGLE: return 1;
      case LAYOUT_TYPES.TWO_COLUMN: return 2;
      case LAYOUT_TYPES.THREE_GRID: return 3;
      case LAYOUT_TYPES.FOUR_GRID: return 4;
      default: return 1;
    }
  };

  const maxImages = getMaxImages();

  const handleAddImage = () => {
    if (images.length < maxImages && availableImages.length > 0) {
      const imageToAdd = availableImages[0];
      const newImage = {
        id: imageToAdd.id || Date.now().toString(),
        url: imageToAdd.dataUrl || imageToAdd.url,
        imageUrl: imageToAdd.dataUrl || imageToAdd.url,
        dataUrl: imageToAdd.dataUrl || imageToAdd.url,
        alt: imageToAdd.title || `Screenshot ${images.length + 1}`,
        imageId: imageToAdd.id,
      };
      onImagesChange([...images, newImage]);
    }
  };

  const handleReplaceImage = (index) => {
    if (availableImages.length > 0) {
      const imageToAdd = availableImages[0];
      const newImages = [...images];
      newImages[index] = {
        ...newImages[index],
        id: imageToAdd.id || Date.now().toString(),
        url: imageToAdd.dataUrl || imageToAdd.url,
        imageUrl: imageToAdd.dataUrl || imageToAdd.url,
        dataUrl: imageToAdd.dataUrl || imageToAdd.url,
        alt: imageToAdd.title || `Screenshot ${index + 1} (Updated)`,
        imageId: imageToAdd.id,
      };
      onImagesChange(newImages);
    }
  };

  const handleRemoveImage = (index) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  // Create placeholder slots based on layout
  const slots = Array.from({ length: maxImages }, (_, i) => images[i] || null);

  return (
    <div className="p-8 flex items-center justify-center min-h-full">
      <div className="w-full max-w-4xl">
        {/* Preview Label */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Live Preview</h3>
            <p className="text-xs text-gray-400 mt-0.5">How your page will appear in the PDF</p>
          </div>
          <div className="text-xs text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200">
            {images.length} / {maxImages} images
          </div>
        </div>

        {/* PDF Page Preview */}
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="aspect-[8.5/11] p-12 overflow-y-auto" style={getBackgroundStyle(layoutSettings.background)}>
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-3xl text-gray-900 mb-3">
                {metadata.title || 'Untitled Page'}
              </h1>
              
              {metadata.description && (
                <p className="text-base text-gray-600 leading-relaxed mb-4">
                  {metadata.description}
                </p>
              )}

              <div className="flex items-center gap-4 flex-wrap">
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

            {/* Images Grid */}
            <div className={`grid ${getGridClass(layoutSettings.layout)} ${getSpacingClass(layoutSettings.spacing)}`}>
              {slots.map((image, index) => (
                <div
                  key={index}
                  className="group relative rounded-lg overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 transition-all hover:border-[#4974a7]"
                  style={{ aspectRatio: '16/10' }}
                >
                  {image ? (
                    <>
                      <img
                        src={image.url || image.imageUrl || image.dataUrl}
                        alt={image.alt || 'Screenshot'}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {availableImages.length > 0 && (
                          <button
                            onClick={() => handleReplaceImage(index)}
                            className="px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm"
                          >
                            <UploadIcon className="w-4 h-4" />
                            Replace
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 text-sm"
                        >
                          <TrashIcon className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={handleAddImage}
                      disabled={availableImages.length === 0}
                      className="w-full h-full flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-[#4974a7] hover:bg-[#4974a7]/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="w-12 h-12 rounded-full bg-gray-200 group-hover:bg-[#4974a7]/10 flex items-center justify-center transition-colors">
                        <PlusIcon className="w-6 h-6" />
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">Add Image</div>
                        <div className="text-xs text-gray-400">Click to add screenshot</div>
                      </div>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Empty State */}
            {images.length === 0 && (
              <div className="mt-8 flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-white/50">
                <ImageIcon className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg text-gray-600 mb-2">No images added yet</h3>
                <p className="text-sm text-gray-400 mb-4">Click the + button above to add screenshots</p>
                {availableImages.length > 0 && (
                  <button
                    onClick={handleAddImage}
                    className="px-5 py-2.5 bg-[#4974a7] text-white rounded-lg hover:bg-[#3d6290] transition-colors flex items-center gap-2"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add First Image
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Below Preview */}
        {images.length > 0 && images.length < maxImages && availableImages.length > 0 && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleAddImage}
              className="px-6 py-3 bg-white border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-[#4974a7] hover:text-[#4974a7] hover:bg-[#4974a7]/5 transition-all flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Add Another Image ({images.length}/{maxImages})
            </button>
          </div>
        )}

        {images.length >= maxImages && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 text-center">
              ✨ All image slots filled! Change layout on the left to add more images.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

