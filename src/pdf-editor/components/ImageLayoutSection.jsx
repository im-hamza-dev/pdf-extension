import React from 'react';
import { getGridClass, getSpacingClass } from '../utils/layoutHelpers.js';
import { LAYOUT_TYPES } from '../utils/constants.js';

// Simple icon components
const GripIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
  </svg>
);

const TrashIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const PlusIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const LayoutGridIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

function DraggableImage({ image, index, onRemove, onDragStart, onDragEnd, isDragging }) {
  const handleMouseDown = (e) => {
    if (onDragStart) {
      onDragStart(e, index);
    }
  };

  return (
    <div
      className={`relative group rounded-lg overflow-hidden border-2 border-gray-200 bg-white transition-all ${
        isDragging ? 'opacity-50 scale-95' : 'opacity-100'
      }`}
      style={{ aspectRatio: '16/10' }}
    >
      <img
        src={image.url || image.imageUrl || image.dataUrl}
        alt={image.alt || image.title || 'Screenshot'}
        className="w-full h-full object-cover"
      />
      
      {/* Overlay controls */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute top-2 left-2">
          <button
            onMouseDown={handleMouseDown}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors cursor-grab active:cursor-grabbing"
            aria-label="Drag to reorder"
          >
            <GripIcon className="w-4 h-4 text-gray-700" />
          </button>
        </div>
        
        <div className="absolute top-2 right-2">
          <button
            onClick={() => onRemove(image.id)}
            className="p-2 bg-red-500/90 backdrop-blur-sm rounded-lg hover:bg-red-600 transition-colors"
            aria-label="Remove image"
          >
            <TrashIcon className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="absolute bottom-2 left-2 right-2">
          <div className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded text-xs text-gray-700 truncate">
            {image.alt || image.title || 'Screenshot'}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ImageLayoutSection({
  images,
  layoutSettings,
  onImagesChange,
  onShowLayoutSelection,
  availableImages = [],
  onAddImage,
}) {
  const handleRemoveImage = (id) => {
    onImagesChange(images.filter(img => img.id !== id));
  };

  const handleAddImage = () => {
    if (onAddImage && availableImages.length > 0) {
      const imageToAdd = availableImages[0];
      const newImage = {
        id: imageToAdd.id || Date.now().toString(),
        url: imageToAdd.dataUrl,
        imageUrl: imageToAdd.dataUrl,
        dataUrl: imageToAdd.dataUrl,
        alt: imageToAdd.title || 'New screenshot',
        title: imageToAdd.title || '',
        imageId: imageToAdd.id,
      };
      onImagesChange([...images, newImage]);
    }
  };

  const maxImages = layoutSettings.layout === LAYOUT_TYPES.SINGLE ? 1 :
                   layoutSettings.layout === LAYOUT_TYPES.TWO_COLUMN ? 2 :
                   layoutSettings.layout === LAYOUT_TYPES.THREE_GRID ? 3 : 4;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg text-gray-900">Image Layout</h2>
          <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
            {images.length} {images.length === 1 ? 'image' : 'images'}
          </span>
        </div>
        
        <button
          onClick={onShowLayoutSelection}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <LayoutGridIcon className="w-4 h-4" />
          Change Layout
        </button>
      </div>

      {/* Image Grid */}
      {images.length > 0 ? (
        <div className={`grid ${getGridClass(layoutSettings.layout)} ${getSpacingClass(layoutSettings.spacing)} mb-4`}>
          {images.map((image, index) => (
            <DraggableImage
              key={image.id}
              image={image}
              index={index}
              onRemove={handleRemoveImage}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-lg mb-4">
          <LayoutGridIcon className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-gray-500 mb-1">No images added yet</p>
          <p className="text-sm text-gray-400">Add screenshots to begin</p>
        </div>
      )}

      {/* Add Image Button */}
      {images.length < maxImages && availableImages.length > 0 && (
        <button
          onClick={handleAddImage}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#4974a7] hover:text-[#4974a7] hover:bg-[#4974a7]/5 transition-all flex items-center justify-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add Screenshot
        </button>
      )}

      {images.length >= maxImages && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            Maximum of {maxImages} images per page for this layout. Remove an image to add a new one.
          </p>
        </div>
      )}
    </div>
  );
}

