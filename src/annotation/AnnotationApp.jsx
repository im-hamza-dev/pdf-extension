import React, { useRef, useEffect, useState } from 'react';
import ImageEditor from 'tui-image-editor';
import 'tui-image-editor/dist/tui-image-editor.css';

function AnnotationApp() {
  const editorRef = useRef(null);
  const imageEditorRef = useRef(null);
  const [editorReady, setEditorReady] = useState(false);

  useEffect(() => {
    // Load screenshot from query param
    const params = new URLSearchParams(window.location.search);
    const screenshot = params.get('img');
    const itemId = params.get('id'); // Optional: ID of existing item being edited

    if (!screenshot) {
      alert('No image provided');
      return;
    }

    // Wait for ref to be ready
    if (!editorRef.current) {
      console.error('Editor container not ready');
      return;
    }

    // Initialize tui-image-editor only once
    if (imageEditorRef.current) {
      return;
    }

    const imageEditor = new ImageEditor(editorRef.current, {
        includeUI: {
          loadImage: false, // Disable load button
          theme: {
            'common.bi.image': '',
            'common.bisize.width': '0px',
            'common.bisize.height': '0px',
            'common.backgroundImage': 'none',
            'common.backgroundColor': '#1e1e1e',
            'common.border': '1px solid #444',
            'header.backgroundImage': 'none',
            'header.backgroundColor': '#2d2d2d',
            'header.border': '0px',
            'menu.normalIcon.color': '#8a8a8a',
            'menu.activeIcon.color': '#555555',
            'menu.disabledIcon.color': '#434343',
            'menu.hoverIcon.color': '#e9e9e9',
            'submenu.normalIcon.color': '#8a8a8a',
            'submenu.activeIcon.color': '#555555',
            'submenu.backgroundColor': '#1e1e1e',
            'submenu.partition.color': '#3c3c3c',
            'submenu.normalLabel.color': '#8a8a8a',
            'submenu.normalLabel.fontWeight': 'lighter',
            'submenu.activeLabel.color': '#fff',
            'submenu.activeLabel.fontWeight': 'normal',
            'checkbox.border': '1px solid #ccc',
            'checkbox.backgroundColor': '#fff',
            'range.pointer.color': '#fff',
            'range.bar.color': '#666',
            'range.subbar.color': '#d1d1d1',
            'colorpicker.button.border': '1px solid #1e1e1e',
            'colorpicker.title.color': '#fff',
          },
          menu: [
            'crop',
            'flip',
            'rotate',
            'draw',
            'shape',
            'icon',
            'text',
            'mask',
            'filter',
          ],
          initMenu: 'filter',
          uiSize: {
            width: '100%',
            height: '100%',
          },
          menuBarPosition: 'bottom',
        },
        cssMaxWidth: window.innerWidth,
        cssMaxHeight: window.innerHeight,
        selectionStyle: {
          cornerSize: 20,
          rotatingPointOffset: 70,
        },
      });

      imageEditorRef.current = imageEditor;
      setEditorReady(true);

      // Load the image after initialization
      imageEditor.loadImageFromURL(screenshot, 'Screenshot').then(() => {
        // Activate menus - this is required when loading image programmatically
        // Try multiple methods to ensure menus are activated
        setTimeout(() => {
          try {
            // Method 1: activeMenuEvent (recommended in GitHub issues)
            if (imageEditor.ui && typeof imageEditor.ui.activeMenuEvent === 'function') {
              imageEditor.ui.activeMenuEvent();
            }
            
            // Method 2: Try to activate menu manually if above doesn't work
            if (imageEditor.ui && imageEditor.ui.menuBar) {
              const menuBar = imageEditor.ui.menuBar;
              if (menuBar && typeof menuBar.changeMenu === 'function') {
                // Try to activate a menu to ensure UI is interactive
                try {
                  menuBar.changeMenu('filter');
                } catch (e) {
                  console.log('Could not change menu programmatically:', e);
                }
              }
            }
            
            // Method 3: Force UI refresh by calling startDrawingMode (if available)
            if (typeof imageEditor.startDrawingMode === 'function') {
              try {
                imageEditor.stopDrawingMode(); // Ensure clean state
              } catch (e) {
                // Ignore errors
              }
            }
          } catch (error) {
            console.error('Error activating menus:', error);
          }
        }, 100);
        
        // Add custom save button after image is loaded and menus are active
        addSaveButton(imageEditor, itemId);
      }).catch((error) => {
        console.error('Failed to load image:', error);
        alert('Failed to load image. Please try again.');
      });

      // Store itemId for saving
      if (editorRef.current) {
        editorRef.current.dataset.itemId = itemId || '';
      }

    // Cleanup
    return () => {
      if (imageEditorRef.current) {
        try {
          imageEditorRef.current.destroy();
        } catch (e) {
          console.error('Error destroying editor:', e);
        }
        imageEditorRef.current = null;
      }
    };
  }, []);

  const hideLoadDownloadButtons = () => {
    // Hide load and download buttons - try multiple selectors
    const selectors = [
      '.tui-image-editor-load-btn',
      '.tui-image-editor-download-btn',
      '[class*="load-btn"]',
      '[class*="Load-btn"]',
      '[class*="download-btn"]',
      '[class*="Download-btn"]',
      'button[aria-label*="load"]',
      'button[aria-label*="Load"]',
      'button[aria-label*="download"]',
      'button[aria-label*="Download"]',
    ];
    
    selectors.forEach(selector => {
      const buttons = document.querySelectorAll(selector);
      buttons.forEach(btn => {
        if (btn && !btn.classList.contains('tui-image-editor-save-btn')) {
          btn.style.display = 'none';
          btn.style.visibility = 'hidden';
          btn.style.opacity = '0';
          btn.style.width = '0';
          btn.style.height = '0';
          btn.style.padding = '0';
          btn.style.margin = '0';
          btn.style.pointerEvents = 'none';
          // Try to remove from DOM if possible
          if (btn.parentNode) {
            try {
              btn.remove();
            } catch (e) {
              // If removal fails, keep it hidden
            }
          }
        }
      });
    });
    
    // Also check all buttons in header and hide any that look like load/download
    const headerButtons = document.querySelectorAll('.tui-image-editor-header button, .tui-image-editor-controls button');
    headerButtons.forEach(btn => {
      const text = btn.textContent || btn.innerText || '';
      const className = btn.className || '';
      if ((text.toLowerCase().includes('load') || className.toLowerCase().includes('load') || 
           text.toLowerCase().includes('download') || className.toLowerCase().includes('download')) &&
          !btn.classList.contains('tui-image-editor-save-btn')) {
        btn.style.display = 'none';
        btn.style.visibility = 'hidden';
        try {
          btn.remove();
        } catch (e) {
          // Keep hidden if removal fails
        }
      }
    });
  };

  const addSaveButton = (imageEditor, itemId) => {
    // Wait for the UI to be fully initialized
    setTimeout(() => {
      // Hide load/download buttons immediately
      hideLoadDownloadButtons();
      
      // Remove any dynamically added save buttons (we only use the fixed one)
      const existingSaveBtns = document.querySelectorAll('.tui-image-editor-save-btn');
      existingSaveBtns.forEach(btn => {
        if (btn && btn.parentNode) {
          btn.remove();
        }
      });
      
      // Hide buttons again after a delay to catch any late-rendering buttons
      setTimeout(() => {
        hideLoadDownloadButtons();
      }, 500);
      
      // Set up mutation observer to catch buttons added dynamically
      const observer = new MutationObserver(() => {
        hideLoadDownloadButtons();
        // Also remove any dynamically added save buttons (keep only fixed one)
        const dynamicSaveBtns = document.querySelectorAll('.tui-image-editor-save-btn');
        dynamicSaveBtns.forEach(btn => {
          if (btn && btn.parentNode && !btn.classList.contains('fixed-save-button')) {
            btn.remove();
          }
        });
      });
      
      // Observe the header/controls area for changes
      const headerElement = document.querySelector('.tui-image-editor-header') ||
                            document.querySelector('.tui-image-editor-controls');
      if (headerElement) {
        observer.observe(headerElement, {
          childList: true,
          subtree: true,
          attributes: false,
        });
      }
      
      // Also check again after a delay to remove any buttons that appeared late
      setTimeout(() => {
        hideLoadDownloadButtons();
        const dynamicSaveBtns = document.querySelectorAll('.tui-image-editor-save-btn');
        dynamicSaveBtns.forEach(btn => {
          if (btn && btn.parentNode && !btn.classList.contains('fixed-save-button')) {
            btn.remove();
          }
        });
      }, 1500);
    }, 1000); // Increased timeout to ensure UI is fully rendered
  };

  const handleSave = (imageEditor, itemId) => {
    if (!imageEditor) return;

    // Get the edited image as data URL
    const dataURL = imageEditor.toDataURL();
    
    // Get current tab ID to close it after saving
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTabId = tabs && tabs[0] ? tabs[0].id : null;
      
      // Send back to background for storage
      chrome.runtime.sendMessage(
        {
          type: 'saveAnnotatedImage',
          dataUrl: dataURL,
          itemId: itemId || null,
          tabId: currentTabId,
        },
        (response) => {
          if (response?.ok) {
            // Tab will be closed by background script
            // If it wasn't closed, try window.close() as fallback
            setTimeout(() => {
              try {
                window.close();
              } catch (e) {
                // Tab might already be closed
              }
            }, 100);
          } else {
            console.error('Failed to save annotation:', response?.error);
            alert('Failed to save image. Please try again.');
          }
        }
      );
    });
  };

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <div ref={editorRef} style={{ width: '100%', height: '100%' }} />
      {/* Fixed save button - always visible */}
      {editorReady && (
        <button
          className="fixed-save-button"
          onClick={() => {
            const itemId = editorRef.current?.dataset?.itemId || null;
            if (imageEditorRef.current) {
              handleSave(imageEditorRef.current, itemId);
            }
          }}
          style={{
            position: 'fixed',
            top: '10px',
            left: '10px',
            padding: '10px 20px',
            backgroundColor: '#4a90e2',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            zIndex: '10000',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            transition: 'background-color 0.2s',
            display: 'block !important',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#357abd';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#4a90e2';
          }}
        >
          💾 Save to Queue
        </button>
      )}
    </div>
  );
}

export default AnnotationApp;

