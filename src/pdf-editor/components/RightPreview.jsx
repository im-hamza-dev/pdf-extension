import React, { useState } from 'react';
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

export function RightPreview({ page, reportType, pages, onImagesChange, availableImages = [], onAddImage, onImageSelect, onLocalImageAdd, onReplaceRequest, pendingReplaceSlot }) {
  const { metadata, images, layoutSettings } = page;
  
  // For bug reports, get report title/subtitle from first page
  const firstPageMetadata = reportType === 'bug-report' && pages && pages.length > 0 ? pages[0].metadata : null;
  const [draggedSlotIndex, setDraggedSlotIndex] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const getMaxImages = () => {
    switch (layoutSettings.layout) {
      case LAYOUT_TYPES.SINGLE: return 1;
      case LAYOUT_TYPES.TWO_ROW: return 2;
      case LAYOUT_TYPES.TWO_COLUMN: return 2;
      case LAYOUT_TYPES.THREE_GRID: return 3;
      case LAYOUT_TYPES.FOUR_GRID: return 4;
      default: return 1;
    }
  };

  const maxImages = getMaxImages();

  const handleAddImage = (selectedImage = null) => {
    if (images.length >= maxImages) {
      return;
    }

    const imageToAdd = selectedImage || (availableImages.length > 0 ? availableImages[0] : null);
    if (!imageToAdd) return;

    const newImage = {
      id: imageToAdd.id || Date.now().toString(),
      url: imageToAdd.dataUrl || imageToAdd.url || imageToAdd.imageUrl,
      imageUrl: imageToAdd.dataUrl || imageToAdd.url || imageToAdd.imageUrl,
      dataUrl: imageToAdd.dataUrl || imageToAdd.url || imageToAdd.imageUrl,
      alt: imageToAdd.title || `Screenshot ${images.length + 1}`,
      imageId: imageToAdd.id,
    };
    onImagesChange([...images, newImage]);
  };

  const handleReplaceImage = (index, selectedImage = null) => {
    const imageToAdd = selectedImage || (availableImages.length > 0 ? availableImages[0] : null);
    if (!imageToAdd) return;

    const newImages = [...images];
    newImages[index] = {
      ...newImages[index],
      id: imageToAdd.id || Date.now().toString(),
      url: imageToAdd.dataUrl || imageToAdd.url || imageToAdd.imageUrl,
      imageUrl: imageToAdd.dataUrl || imageToAdd.url || imageToAdd.imageUrl,
      dataUrl: imageToAdd.dataUrl || imageToAdd.url || imageToAdd.imageUrl,
      alt: imageToAdd.title || `Screenshot ${index + 1} (Updated)`,
      imageId: imageToAdd.id,
    };
    onImagesChange(newImages);
  };

  const handleRemoveImage = (index) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  // Handle drag & drop for local files
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = async (e, slotIndex = null) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    setDraggedSlotIndex(null);

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      const file = files[0];
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const imageData = {
        id: `local-${Date.now()}-${Math.random()}`,
        dataUrl,
        createdAt: Date.now(),
        title: file.name,
        isLocal: true
      };

      if (onLocalImageAdd) {
        onLocalImageAdd(imageData);
      }

      // Add or replace image in slot
      if (slotIndex !== null) {
        if (images[slotIndex]) {
          handleReplaceImage(slotIndex, imageData);
        } else {
          // Find first empty slot
          const emptySlotIndex = images.length;
          handleAddImage(imageData);
        }
      } else {
        // Find first empty slot or add to end
        if (images.length < maxImages) {
          handleAddImage(imageData);
        }
      }
    }
  };

  // Handle slot click - when user clicks empty slot, they should select from gallery
  const handleSlotClick = (index) => {
    // Empty slot clicked - user should select from gallery
    // The gallery component will handle the selection
  };

  // Create placeholder slots based on layout
  const slots = Array.from({ length: maxImages }, (_, i) => images[i] || null);

  return (
    <div 
      className="p-8 flex items-center justify-center min-h-full relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, null)}
    >
      {isDraggingOver && (
        <div className="absolute inset-0 bg-[#588AE8]/10 border-2 border-dashed border-[#588AE8] z-50 flex items-center justify-center pointer-events-none rounded-lg">
          <div className="text-center">
            <UploadIcon className="w-12 h-12 text-[#588AE8] mx-auto mb-2" />
            <p className="text-[#588AE8] font-medium">Drop image here</p>
          </div>
        </div>
      )}
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
          <div className="aspect-[8.5/11] overflow-y-auto" style={getBackgroundStyle(layoutSettings.background)}>
            {reportType === 'bug-report' ? (
              <>
                {/* Bug Report Header - Gradient Banner */}
                <div className="bg-gradient-to-r from-[#588AE8] to-[#5a5387] p-8 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 rounded-full bg-white/30" />
                    <div className="w-3 h-3 rounded-full bg-white/30" />
                    <div className="w-3 h-3 rounded-full bg-white/30" />
                  </div>
                  {firstPageMetadata?.title && (
                    <h3 className="text-3xl font-bold mb-2">
                      {firstPageMetadata.title}
                    </h3>
                  )}
                  {firstPageMetadata?.subtitle && (
                    <p className="text-white/90 text-lg mb-4">
                      {firstPageMetadata.subtitle}
                    </p>
                  )}
                </div>

                {/* Bug Report Content */}
                <div className="p-8">
                  {/* Priority, Browser, Device Tags - Above Description */}
                  {(metadata.priority || metadata.browser || metadata.device) && (
                    <div className="flex gap-2 mb-6">
                      {metadata.priority && (
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 border border-gray-300">
                          Priority: {metadata.priority}
                        </span>
                      )}
                      {metadata.browser && (
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 border border-gray-300">
                          Browser: {metadata.browser}
                        </span>
                      )}
                      {metadata.device && (
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 border border-gray-300">
                          Device: {metadata.device}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  {metadata.description && (
                    <div className="mb-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Description</h4>
                      <p className="text-gray-600 leading-relaxed">
                        {metadata.description}
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* General Report Header Section */}
                <div className="p-12 mb-8">
                  <h1 className="text-3xl text-gray-900 mb-3">
                    {metadata.title || 'Untitled Page'}
                  </h1>
                  
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
              </>
            )}

            {/* Images Grid */}
            {reportType === 'bug-report' ? (
              <div className="px-8 pb-8">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Screenshots</h4>
                <div className={`grid grid-cols-2 gap-4`}>
                  {slots.map((image, index) => (
                    <div
                      key={index}
                      className={`group relative rounded-lg overflow-hidden border-2 border-dashed bg-gray-50 transition-all aspect-video ${
                        image 
                          ? pendingReplaceSlot === index
                            ? 'border-[#588AE8] ring-2 ring-[#588AE8]/30'
                            : 'border-gray-300 hover:border-[#588AE8]' 
                          : draggedSlotIndex === index
                          ? 'border-[#588AE8] bg-[#588AE8]/5'
                          : pendingReplaceSlot === index
                          ? 'border-[#588AE8] bg-[#588AE8]/5'
                          : 'border-gray-300 hover:border-[#588AE8]'
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!image) {
                          setDraggedSlotIndex(index);
                        }
                      }}
                      onDragLeave={() => {
                        setDraggedSlotIndex(null);
                      }}
                      onDrop={(e) => handleDrop(e, index)}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!image) {
                          handleSlotClick(index);
                        }
                      }}
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
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onReplaceRequest) {
                                  onReplaceRequest(index);
                                }
                              }}
                              className={`px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm ${
                                pendingReplaceSlot === index 
                                  ? 'bg-[#588AE8] text-white hover:bg-[#3d6290]' 
                                  : 'bg-white text-gray-900'
                              }`}
                              title={pendingReplaceSlot === index ? "Click an image from the gallery to replace" : "Click to replace this image"}
                            >
                              <UploadIcon className="w-4 h-4" />
                              {pendingReplaceSlot === index ? 'Select from Gallery' : 'Replace'}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage(index);
                              }}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 text-sm"
                            >
                              <TrashIcon className="w-4 h-4" />
                              Remove
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-[#588AE8] hover:bg-[#588AE8]/5 transition-all cursor-pointer">
                          <div className="w-12 h-12 rounded-full bg-gray-200 group-hover:bg-[#588AE8]/10 flex items-center justify-center transition-colors">
                            <PlusIcon className="w-6 h-6" />
                          </div>
                          <div className="text-sm text-center">
                            <div className="font-medium">Add Image</div>
                            <div className="text-xs text-gray-400">Click or drag & drop</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`p-12 grid ${getGridClass(layoutSettings.layout)} ${getSpacingClass(layoutSettings.spacing)}`}>
              {slots.map((image, index) => (
                <div
                  key={index}
                  className={`group relative rounded-lg overflow-hidden border-2 border-dashed bg-gray-50 transition-all ${
                    image 
                      ? pendingReplaceSlot === index
                        ? 'border-[#588AE8] ring-2 ring-[#588AE8]/30'
                        : 'border-gray-300 hover:border-[#588AE8]' 
                      : draggedSlotIndex === index
                      ? 'border-[#588AE8] bg-[#588AE8]/5'
                      : pendingReplaceSlot === index
                      ? 'border-[#588AE8] bg-[#588AE8]/5'
                      : 'border-gray-300 hover:border-[#588AE8]'
                  }`}
                  style={{ aspectRatio: '16/10' }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!image) {
                      setDraggedSlotIndex(index);
                    }
                  }}
                  onDragLeave={() => {
                    setDraggedSlotIndex(null);
                  }}
                  onDrop={(e) => handleDrop(e, index)}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!image) {
                      handleSlotClick(index);
                    }
                  }}
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onReplaceRequest) {
                              onReplaceRequest(index);
                            }
                          }}
                          className={`px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm ${
                            pendingReplaceSlot === index 
                              ? 'bg-[#588AE8] text-white hover:bg-[#3d6290]' 
                              : 'bg-white text-gray-900'
                          }`}
                          title={pendingReplaceSlot === index ? "Click an image from the gallery to replace" : "Click to replace this image"}
                        >
                          <UploadIcon className="w-4 h-4" />
                          {pendingReplaceSlot === index ? 'Select from Gallery' : 'Replace'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(index);
                          }}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 text-sm"
                        >
                          <TrashIcon className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-[#588AE8] hover:bg-[#588AE8]/5 transition-all cursor-pointer">
                      <div className="w-12 h-12 rounded-full bg-gray-200 group-hover:bg-[#588AE8]/10 flex items-center justify-center transition-colors">
                        <PlusIcon className="w-6 h-6" />
                      </div>
                      <div className="text-sm text-center">
                        <div className="font-medium">Add Image</div>
                        <div className="text-xs text-gray-400">Click or drag & drop</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              </div>
            )}

            {reportType !== 'bug-report' && images.length === 0 && (
              <div className="px-12 mt-8 flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-white/50">
                <ImageIcon className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg text-gray-600 mb-2">No images added yet</h3>
                <p className="text-sm text-gray-400 mb-4">Select from gallery, drag & drop, or click to add</p>
              </div>
            )}

            {reportType !== 'bug-report' && metadata.description && (
              <div className="px-12 pb-12">
                <p className="text-base text-gray-600 leading-relaxed">
                  {metadata.description}
                </p>
              </div>
            )}

            {reportType === 'bug-report' && (
              <>
                {/* Steps to Reproduce (if any) */}
                {metadata.stepsToReproduce && metadata.stepsToReproduce.length > 0 && (
                  <div className="px-8 mb-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Steps to Reproduce</h4>
                    <ol className="list-decimal list-inside space-y-1 text-gray-600">
                      {metadata.stepsToReproduce.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Footer */}
                <div className="px-8 pt-6 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
                  <span>Generated by SnapDoc</span>
                  <span>Page 1 of 1</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick Actions Below Preview */}
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

