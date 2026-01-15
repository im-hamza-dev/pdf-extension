import React, { useState, useEffect } from 'react';
import { sendMessage } from '../utils/chromeApi';
import { exportPDFWithLayout } from '../utils/pdfExport';
import { LeftControls } from './components/LeftControls';
import { RightPreview } from './components/RightPreview';
import { PageNavigation } from './components/PageNavigation';
import { ImageGallery } from './components/ImageGallery';
import { ScreenshotPopup } from '../components/ScreenshotPopup';
import { createLayoutItem } from './utils/layoutHelpers';
import { LAYOUT_TYPES } from './utils/constants';

function PDFLayoutEditor() {
  const [queue, setQueue] = useState([]);
  const [localImages, setLocalImages] = useState([]);
  const [pages, setPages] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pendingReplaceSlot, setPendingReplaceSlot] = useState(null);
  const [showScreenshotPopup, setShowScreenshotPopup] = useState(false);

  useEffect(() => {
    loadQueue();
  }, []);

  async function loadQueue() {
    const { ok, queue: newQueue } = await sendMessage({ type: 'GET_LIST' });
    if (ok && newQueue) {
      setQueue(newQueue);
      // Initialize pages with images
      await initializePages(newQueue);
    }
  }

  async function initializePages(images) {
    if (images.length === 0) {
      // Create empty page
      const emptyPage = createEmptyPage();
      setPages([emptyPage]);
      return;
    }

    // Create pages based on images
    const layoutType = LAYOUT_TYPES.SINGLE;
    const maxImagesPerLayout = 1; // Start with single layout

    const newPages = [];
    for (let i = 0; i < images.length; i += maxImagesPerLayout) {
      const pageImages = images.slice(i, i + maxImagesPerLayout);
      const pageItems = await Promise.all(
        pageImages.map((img, idx) => createLayoutItem(img, idx, layoutType, maxImagesPerLayout))
      );
      
      const pageImagesFormatted = pageItems.map(item => ({
        id: item.id,
        url: item.imageUrl,
        imageUrl: item.imageUrl,
        dataUrl: item.dataUrl,
        alt: item.title || 'Screenshot',
        imageId: item.imageId,
      }));

      const page = {
        id: `page-${i}`,
        metadata: {
          title: `Page ${newPages.length + 1}`,
          description: '',
          tags: [],
          date: new Date().toISOString().split('T')[0]
        },
        images: pageImagesFormatted,
        layoutSettings: {
          layout: layoutType,
          spacing: 'medium',
          background: 'white'
        }
      };
      newPages.push(page);
    }

    if (newPages.length === 0) {
      newPages.push(createEmptyPage());
    }
    
    setPages(newPages);
  }

  function createEmptyPage() {
    return {
      id: `page-${Date.now()}`,
      metadata: {
        title: 'New Page',
        description: '',
        tags: [],
        date: new Date().toISOString().split('T')[0]
      },
      images: [],
      layoutSettings: {
        layout: LAYOUT_TYPES.SINGLE,
        spacing: 'medium',
        background: 'white'
      }
    };
  }

  const currentPage = pages[currentPageIndex] || createEmptyPage();

  const updateCurrentPage = (updates) => {
    setPages(pages.map((page, index) => 
      index === currentPageIndex ? { ...page, ...updates } : page
    ));
  };

  const handleAddPage = () => {
    const newPage = createEmptyPage();
    setPages([...pages, newPage]);
    setCurrentPageIndex(pages.length);
  };

  const handleDeletePage = (index) => {
    if (pages.length === 1) return; // Don't delete if only one page
    
    const newPages = pages.filter((_, i) => i !== index);
    setPages(newPages);
    
    // Adjust current page index if needed
    if (currentPageIndex >= newPages.length) {
      setCurrentPageIndex(newPages.length - 1);
    } else if (currentPageIndex >= index) {
      setCurrentPageIndex(Math.max(0, currentPageIndex - 1));
    }
  };

  const handleImagesChange = async (newImages) => {
    // If layout changed, we might need to adjust images
    const maxImages =
      currentPage.layoutSettings.layout === LAYOUT_TYPES.SINGLE ? 1 :
      currentPage.layoutSettings.layout === LAYOUT_TYPES.TWO_ROW ? 2 :
      currentPage.layoutSettings.layout === LAYOUT_TYPES.TWO_COLUMN ? 2 :
      currentPage.layoutSettings.layout === LAYOUT_TYPES.THREE_GRID ? 3 : 4;

    // Limit images to max for current layout
    const limitedImages = newImages.slice(0, maxImages);
    updateCurrentPage({ images: limitedImages });
  };

  const handleLayoutSettingsChange = async (newLayoutSettings) => {
    const oldMaxImages =
      currentPage.layoutSettings.layout === LAYOUT_TYPES.SINGLE ? 1 :
      currentPage.layoutSettings.layout === LAYOUT_TYPES.TWO_ROW ? 2 :
      currentPage.layoutSettings.layout === LAYOUT_TYPES.TWO_COLUMN ? 2 :
      currentPage.layoutSettings.layout === LAYOUT_TYPES.THREE_GRID ? 3 : 4;
    
    const newMaxImages =
      newLayoutSettings.layout === LAYOUT_TYPES.SINGLE ? 1 :
      newLayoutSettings.layout === LAYOUT_TYPES.TWO_ROW ? 2 :
      newLayoutSettings.layout === LAYOUT_TYPES.TWO_COLUMN ? 2 :
      newLayoutSettings.layout === LAYOUT_TYPES.THREE_GRID ? 3 : 4;

    // If reducing max images, trim the images array
    let images = currentPage.images;
    if (newMaxImages < images.length) {
      images = images.slice(0, newMaxImages);
    }

    // If increasing max images and we have available images, add them
    if (newMaxImages > images.length && queue.length > 0) {
      const availableImages = queue.filter(
        (img) => !images.some((item) => item.imageId === img.id)
      );
      
      if (availableImages.length > 0) {
        const imagesToAdd = availableImages.slice(0, newMaxImages - images.length);
        const newImageItems = await Promise.all(
          imagesToAdd.map((img, idx) => createLayoutItem(img, images.length + idx, newLayoutSettings.layout, newMaxImages))
        );
        
        const formattedNewImages = newImageItems.map(item => ({
          id: item.id,
          url: item.imageUrl,
          imageUrl: item.imageUrl,
          dataUrl: item.dataUrl,
          alt: item.title || 'Screenshot',
          imageId: item.imageId,
        }));
        
        images = [...images, ...formattedNewImages];
      }
    }

    updateCurrentPage({ 
      layoutSettings: newLayoutSettings,
      images: images
    });
  };

  const handleAddImage = async (image) => {
    const maxImages =
      currentPage.layoutSettings.layout === LAYOUT_TYPES.SINGLE ? 1 :
      currentPage.layoutSettings.layout === LAYOUT_TYPES.TWO_ROW ? 2 :
      currentPage.layoutSettings.layout === LAYOUT_TYPES.TWO_COLUMN ? 2 :
      currentPage.layoutSettings.layout === LAYOUT_TYPES.THREE_GRID ? 3 : 4;

    if (currentPage.images.length >= maxImages) {
      alert(`Maximum ${maxImages} images allowed for this layout. Please change layout or remove an image first.`);
      return;
    }

    const newItem = await createLayoutItem(image, currentPage.images.length, currentPage.layoutSettings.layout, maxImages);
    const newImage = {
      id: newItem.id,
      url: newItem.imageUrl,
      imageUrl: newItem.imageUrl,
      dataUrl: newItem.dataUrl,
      alt: newItem.title || 'Screenshot',
      imageId: newItem.imageId,
    };

    updateCurrentPage({ images: [...currentPage.images, newImage] });
  };

  const handleImageSelect = async (image, slotIndex = null) => {
    if (!image) {
      // If no image provided, nothing to do
      return;
    }

    const maxImages =
      currentPage.layoutSettings.layout === LAYOUT_TYPES.SINGLE ? 1 :
      currentPage.layoutSettings.layout === LAYOUT_TYPES.TWO_ROW ? 2 :
      currentPage.layoutSettings.layout === LAYOUT_TYPES.TWO_COLUMN ? 2 :
      currentPage.layoutSettings.layout === LAYOUT_TYPES.THREE_GRID ? 3 : 4;

    // Check if we have a pending replace operation
    const targetSlot = pendingReplaceSlot !== null ? pendingReplaceSlot : (slotIndex !== null ? slotIndex : null);

    if (targetSlot !== null && targetSlot >= 0) {
      // Replace image at specific slot
      if (targetSlot >= maxImages) {
        setPendingReplaceSlot(null);
        return;
      }
      
      const newItem = await createLayoutItem(image, targetSlot, currentPage.layoutSettings.layout, maxImages);
      const newImage = {
        id: newItem.id,
        url: newItem.imageUrl,
        imageUrl: newItem.imageUrl,
        dataUrl: newItem.dataUrl,
        alt: newItem.title || 'Screenshot',
        imageId: newItem.imageId,
      };

      const newImages = [...currentPage.images];
      // Ensure array is long enough
      while (newImages.length <= targetSlot) {
        newImages.push(null);
      }
      newImages[targetSlot] = newImage;
      // Remove nulls at the end
      while (newImages.length > 0 && newImages[newImages.length - 1] === null) {
        newImages.pop();
      }
      updateCurrentPage({ images: newImages });
      setPendingReplaceSlot(null);
    } else {
      // Add to first available slot (when user clicks image in gallery)
      if (currentPage.images.length >= maxImages) {
        alert(`Maximum ${maxImages} images allowed for this layout. Please change layout or remove an image first.`);
        return;
      }

      await handleAddImage(image);
    }
  };

  const handleReplaceRequest = (slotIndex) => {
    // If clicking the same slot, cancel replace mode
    if (pendingReplaceSlot === slotIndex) {
      setPendingReplaceSlot(null);
    } else {
      setPendingReplaceSlot(slotIndex);
    }
  };

  const handleCancelReplace = () => {
    setPendingReplaceSlot(null);
  };

  const handleLocalImageAdd = (imageData) => {
    // Add to local images list
    setLocalImages(prev => [...prev, imageData]);
    // Don't automatically add to page - user should select from gallery
  };

  async function handleExportPDF() {
    try {
      // Pass pages directly - export function now handles the layout matching the preview
      await exportPDFWithLayout(pages, queue);
      // Close the tab after export
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0]) {
          chrome.tabs.remove(tabs[0].id);
        }
      });
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export PDF. Please try again.');
    }
  }

  const handleSaveDraft = () => {
    // Save draft functionality - could store in chrome.storage
    alert('Draft saved!');
  };

  // Convert queue items to Screenshot format for popup
  const screenshots = queue.map((item) => ({
    id: item.id,
    url: item.dataUrl,
    timestamp: item.createdAt ? new Date(item.createdAt) : new Date(),
    thumbnail: item.dataUrl,
  }));

  async function handleScreenshotCapture() {
    await sendMessage({ type: 'CAPTURE' });
    await loadQueue();
  }

  async function handleScreenshotClear() {
    await sendMessage({ type: 'CLEAR' });
    await loadQueue();
  }

  async function handleScreenshotSave(screenshot) {
    await sendMessage({ type: 'SAVE_PNG', dataUrl: screenshot.url });
  }

  async function handleScreenshotDelete(id) {
    const { ok } = await sendMessage({ type: 'REMOVE', id });
    if (ok) {
      await loadQueue();
    }
  }

  async function handleScreenshotEdit(screenshot) {
    await sendMessage({ type: 'EDIT_IMAGE', id: screenshot.id });
    // Queue will refresh when user saves from editor
  }

  async function handleScreenshotExportToLayout() {
    setShowScreenshotPopup(false);
    // Already in layout editor, just refresh the queue
    await loadQueue();
  }

  // Combine screenshots and local images
  const allAvailableImages = [...queue, ...localImages];
  
  const availableImages = allAvailableImages.filter(
    (img) => !currentPage.images.some((item) => item.imageId === img.id)
  );

  const selectedImageIds = currentPage.images.map(img => img.imageId).filter(Boolean);

  return (
    <div className="h-screen flex flex-col bg-[#f5f6f8]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#4974a7] flex items-center justify-center">
                <span className="text-white font-semibold">PDF</span>
              </div>
              <div>
                <h1 className="text-xl text-gray-900">PDF Page Layout Editor</h1>
                <p className="text-sm text-gray-500">Design professional report pages</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowScreenshotPopup(true)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Screenshots
              </button>
              <button
                onClick={handleSaveDraft}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Save Draft
              </button>
              <button
                onClick={handleExportPDF}
                className="px-6 py-2 text-sm rounded-lg text-white transition-colors shadow-sm"
                style={{ backgroundColor: '#4974a7' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3d6290'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4974a7'}
              >
                Export to PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Three Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Controls */}
        <div className="w-[420px] flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
          <LeftControls
            metadata={currentPage.metadata}
            layoutSettings={currentPage.layoutSettings}
            onMetadataChange={(metadata) => updateCurrentPage({ metadata })}
            onLayoutSettingsChange={handleLayoutSettingsChange}
          />
        </div>

        {/* Center - Preview */}
        <div className="flex-1 overflow-y-auto" onClick={handleCancelReplace}>
          <RightPreview
            page={currentPage}
            onImagesChange={handleImagesChange}
            availableImages={availableImages}
            onAddImage={handleAddImage}
            onImageSelect={handleImageSelect}
            onLocalImageAdd={handleLocalImageAdd}
            onReplaceRequest={handleReplaceRequest}
            pendingReplaceSlot={pendingReplaceSlot}
          />
        </div>

        {/* Right Side - Image Gallery */}
        <div className="w-[320px] flex-shrink-0 overflow-hidden">
          <ImageGallery
            screenshots={allAvailableImages}
            onImageSelect={handleImageSelect}
            onLocalImageAdd={handleLocalImageAdd}
            selectedImageIds={selectedImageIds}
            pendingReplaceSlot={pendingReplaceSlot}
          />
        </div>
      </div>

      {/* Footer - Page Navigation */}
      <PageNavigation
        pages={pages}
        currentPageIndex={currentPageIndex}
        onPageChange={setCurrentPageIndex}
        onAddPage={handleAddPage}
        onDeletePage={handleDeletePage}
      />

      {/* Screenshot Popup Modal */}
      {showScreenshotPopup && (
        <ScreenshotPopup
          screenshots={screenshots}
          onClose={() => setShowScreenshotPopup(false)}
          onCapture={handleScreenshotCapture}
          onEdit={handleScreenshotEdit}
          onSave={handleScreenshotSave}
          onDelete={handleScreenshotDelete}
          onExportToLayout={handleScreenshotExportToLayout}
          onClearAll={handleScreenshotClear}
          isPopupContext={false}
        />
      )}
    </div>
  );
}

export default PDFLayoutEditor;
