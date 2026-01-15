import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { copyFileSync, mkdirSync, existsSync } from "fs";

// Plugin to copy static files to dist
function copyStaticFiles() {
  return {
    name: "copy-static-files",
    closeBundle() {
      // Copy manifest.json
      copyFileSync("manifest.json", "dist/manifest.json");

      // Copy background.js
      copyFileSync("background.js", "dist/background.js");

      // Copy icons
      copyFileSync("snap-doc.png", "dist/snap-doc.png");
      // Keep old icon for backward compatibility if needed
      if (existsSync("icon01.jpg")) {
        copyFileSync("icon01.jpg", "dist/icon01.jpg");
      }
    },
  };
}

export default defineConfig({
  base: './', // Use relative paths for Chrome extension
  plugins: [react(), copyStaticFiles()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "src/popup/index.html"),
        annotation: resolve(__dirname, "src/annotation/index.html"),
        'pdf-editor': resolve(__dirname, "src/pdf-editor/index.html"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Place entry files in their respective directories
          return `${chunkInfo.name}/[name].js`;
        },
        chunkFileNames: "chunks/[name].[hash].js",
        assetFileNames: (assetInfo) => {
          // Keep CSS files with their pages
          if (assetInfo.name.endsWith(".css")) {
            return "[name]/[name].[ext]";
          }
          return "assets/[name].[ext]";
        },
      },
    },
  },
});
