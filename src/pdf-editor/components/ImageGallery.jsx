import React, { useState, useRef } from 'react';

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

export function ImageGallery({ 
  screenshots = [], 
  onImageSelect, 
  onLocalImageAdd,
  selectedImageIds = [],
  pendingReplaceSlot = null
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      await handleFiles(files);
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files).filter(file => 
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      await handleFiles(files);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFiles = async (files) => {
    for (const file of files) {
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

      onLocalImageAdd(imageData);
    }
  };

  const handleImageClick = (image) => {
    onImageSelect(image);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      className="h-full flex flex-col bg-white border-l border-gray-200"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Image Gallery</h3>
        <p className="text-xs text-gray-500">
          {pendingReplaceSlot !== null 
            ? 'Click an image to replace the selected slot' 
            : 'Click to select or drag & drop'}
        </p>
        {pendingReplaceSlot !== null && (
          <div className="mt-2 px-3 py-2 bg-[#4974a7]/10 border border-[#4974a7] rounded text-xs text-[#4974a7]">
            Replace mode active - click an image to replace slot {pendingReplaceSlot + 1}
          </div>
        )}
      </div>

      {/* Upload Button */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <button
          onClick={handleUploadClick}
          className="w-full px-4 py-3 bg-[#4974a7] text-white rounded-lg hover:bg-[#3d6290] transition-colors flex items-center justify-center gap-2 text-sm font-medium"
        >
          <UploadIcon className="w-4 h-4" />
          Upload from Storage
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* Drag & Drop Zone */}
      {isDragging && (
        <div className="absolute inset-0 bg-[#4974a7]/10 border-2 border-dashed border-[#4974a7] z-50 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <UploadIcon className="w-12 h-12 text-[#4974a7] mx-auto mb-2" />
            <p className="text-[#4974a7] font-medium">Drop images here</p>
          </div>
        </div>
      )}

      {/* Gallery List */}
      <div className="flex-1 overflow-y-auto p-4">
        {screenshots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ImageIcon className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500 mb-1">No images available</p>
            <p className="text-xs text-gray-400">Take screenshots or upload images</p>
          </div>
        ) : (
          <div className="space-y-3">
            {screenshots.map((image) => {
              const isSelected = selectedImageIds.includes(image.id);
              return (
                <div
                  key={image.id}
                  onClick={() => handleImageClick(image)}
                  className={`
                    relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all
                    ${isSelected 
                      ? 'border-[#4974a7] ring-2 ring-[#4974a7]/20' 
                      : 'border-gray-200 hover:border-[#4974a7]/50'
                    }
                  `}
                >
                  <div className="aspect-video bg-gray-100 relative">
                    <img
                      src={image.dataUrl || image.url || image.imageUrl}
                      alt={image.title || 'Screenshot'}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#4974a7]/20 flex items-center justify-center">
                        <div className="bg-[#4974a7] text-white rounded-full w-8 h-8 flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs truncate">
                        {image.title || new Date(image.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  {image.isLocal && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      Local
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          {screenshots.length} {screenshots.length === 1 ? 'image' : 'images'} available
        </p>
      </div>
    </div>
  );
}
