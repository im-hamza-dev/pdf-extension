import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

// Plugin to copy static files to dist
function copyStaticFiles() {
  const copyFiles = () => {
    try {
      // Copy manifest.json
      if (existsSync('manifest.json')) {
        copyFileSync('manifest.json', 'dist/manifest.json');
        console.log('✓ Copied manifest.json');
      }

      // Copy background.js
      if (existsSync('background.js')) {
        copyFileSync('background.js', 'dist/background.js');
        console.log('✓ Copied background.js');
      }

      // Copy icons
      if (existsSync('snap-doc.png')) {
        copyFileSync('snap-doc.png', 'dist/snap-doc.png');
        console.log('✓ Copied snap-doc.png');
      } else {
        console.warn('⚠ snap-doc.png not found in project root');
      }

      // Keep old icon for backward compatibility if needed
      if (existsSync('icon01.jpg')) {
        copyFileSync('icon01.jpg', 'dist/icon01.jpg');
        console.log('✓ Copied icon01.jpg');
      }
    } catch (error) {
      console.error('Error copying static files:', error);
    }
  };

  return {
    name: 'copy-static-files',
    buildEnd() {
      copyFiles();
    },
    writeBundle() {
      // Also run after bundle is written as a fallback
      copyFiles();
    },
    closeBundle() {
      // Final fallback - ensure files are copied
      copyFiles();
    },
  };
}

export default defineConfig({
  base: './', // Use relative paths for Chrome extension
  plugins: [react(), copyStaticFiles()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        annotation: resolve(__dirname, 'src/annotation/index.html'),
        'pdf-editor': resolve(__dirname, 'src/pdf-editor/index.html'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Place entry files in their respective directories
          return `${chunkInfo.name}/[name].js`;
        },
        chunkFileNames: 'chunks/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          // Keep CSS files with their pages
          if (assetInfo.name.endsWith('.css')) {
            return '[name]/[name].[ext]';
          }
          return 'assets/[name].[ext]';
        },
      },
    },
  },
});
