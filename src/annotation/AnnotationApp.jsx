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
          loadImage: {
            path: '',
            name: 'Screenshot',
          },
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
            'loadButton.backgroundColor': '#fff',
            'loadButton.border': '1px solid #ddd',
            'loadButton.color': '#222',
            'loadButton.fontFamily': 'NotoSans, sans-serif',
            'loadButton.fontSize': '12px',
            'downloadButton.backgroundColor': '#4a90e2',
            'downloadButton.border': '1px solid #4a90e2',
            'downloadButton.color': '#fff',
            'downloadButton.fontFamily': 'NotoSans, sans-serif',
            'downloadButton.fontSize': '12px',
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
        console.log('Image loaded successfully');
        
        // Activate menus - this is required when loading image programmatically
        // Try multiple methods to ensure menus are activated
        setTimeout(() => {
          try {
            // Method 1: activeMenuEvent (recommended in GitHub issues)
            if (imageEditor.ui && typeof imageEditor.ui.activeMenuEvent === 'function') {
              imageEditor.ui.activeMenuEvent();
              console.log('activeMenuEvent called');
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

  const addSaveButton = (imageEditor, itemId) => {
    // Wait for the UI to be fully initialized
    setTimeout(() => {
      // Try to find header area where buttons are placed
      const header = document.querySelector('.tui-image-editor-header') ||
                     document.querySelector('.tui-image-editor-controls') ||
                     document.querySelector('.tui-image-editor-top');
      
      // Try to find download button as reference point
      const downloadBtn = document.querySelector('.tui-image-editor-download-btn') ||
                          document.querySelector('[class*="download"]') ||
                          header?.querySelector('button');
      
      // Check if button already exists
      let saveBtn = document.querySelector('.tui-image-editor-save-btn');
      if (saveBtn) {
        saveBtn.remove();
      }
      
      // Try to add to header if found, otherwise rely on fixed button in JSX
      if (header) {
        saveBtn = document.createElement('button');
        saveBtn.className = 'tui-image-editor-save-btn';
        saveBtn.innerHTML = '💾 Save to Queue';
        saveBtn.style.cssText = `
          margin-left: 10px;
          padding: 8px 16px;
          background-color: #4a90e2;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          z-index: 1000;
          position: relative;
        `;
        saveBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSave(imageEditor, itemId);
        };
        
        // Insert after download button if found, otherwise append to header
        if (downloadBtn && downloadBtn.parentNode) {
          downloadBtn.parentNode.insertBefore(saveBtn, downloadBtn.nextSibling);
        } else {
          header.appendChild(saveBtn);
        }
        
        // Hide the fixed button since we successfully added one to header
        const fixedBtn = document.querySelector('.fixed-save-button');
        if (fixedBtn) {
          // fixedBtn.style.display = 'none';
        }
      } else {
        // Keep the fixed button visible if header not found
        const fixedBtn = document.querySelector('.fixed-save-button');
        if (fixedBtn) {
          fixedBtn.style.display = 'block';
        }
      }
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
                console.log('Tab closed or cannot be closed');
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

