# 🚀 Quick Start Guide

## ⚠️ Important: Node.js Version

**Your current Node version (12.18.4) is too old.** You need Node.js **14.18+** or preferably **18+**.

### Update Node.js:

**Option 1: Using nvm (Recommended)**

```bash
# Install nvm if you don't have it
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal, then:
nvm install 18
nvm use 18
```

**Option 2: Direct Download**
Download from: https://nodejs.org/ (LTS version recommended)

---

## 📦 Installation & Build

Once you have Node 14.18+:

```bash
# 1. Clean install (if you had issues)
rm -rf node_modules package-lock.json
npm install

# 2. Build the extension
npm run build

# 3. Done! The 'dist' folder now contains your extension
```

---

## 🔧 Development Commands

```bash
# Build once
npm run build

# Watch mode (auto-rebuild on changes)
npm run dev

# Clean build
rm -rf dist && npm run build
```

---

## 🌐 Load in Chrome

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (top right toggle)
4. Click "Load unpacked"
5. Select the **`dist`** folder
6. Done! 🎉

---

## 📁 Project Structure

```
src/
├── popup/           → Main popup interface
├── annotation/      → Screenshot annotation tool
├── components/      → Reusable React components
└── utils/           → Helper functions

dist/                → Built extension (load this in Chrome)
background.js        → Service worker (no changes needed)
manifest.json        → Extension manifest
```

---

## ✏️ Making Changes

1. Edit files in `src/`
2. Run `npm run build` (or `npm run dev` for watch mode)
3. Go to `chrome://extensions/` and click the refresh icon on your extension
4. Test your changes

---

## 🐛 Troubleshooting

### Build fails with syntax error

**Problem:** Node version too old
**Solution:** Update to Node 18+ (see above)

### Extension doesn't load

**Problem:** Loading wrong folder
**Solution:** Load the `dist/` folder, not the root

### Changes not showing

**Problem:** Need to rebuild and reload
**Solution:**

```bash
npm run build
# Then refresh extension in chrome://extensions/
```

### "chrome is not defined" in console

**Normal!** Chrome APIs only work in the extension environment, not during build.

---

## 📖 Documentation

- `MIGRATION_GUIDE.md` - Complete migration details
- `COMPARISON.md` - Before/After code examples
- `README.md` - Original extension info

---

## ✅ Verification Checklist

After building, verify these work:

- [ ] Extension loads without errors
- [ ] Click popup icon - interface appears
- [ ] "Capture" button takes screenshot
- [ ] Can drag-and-drop to reorder
- [ ] Annotation window opens and allows drawing
- [ ] "Export PDF" creates a PDF file
- [ ] "Clear" removes all screenshots

---

## 🎯 What's Different?

### Old Way:

- Vanilla JavaScript
- Manual DOM manipulation
- HTML/CSS/JS files directly loaded

### New Way:

- React components
- Declarative UI updates
- Build process with Vite
- Modern npm package management
- Same functionality, better code!

---

## 💡 Next Steps

Once it's working:

1. **Learn React hooks** if new to you
2. **Add TypeScript** for type safety
3. **Install UI libraries** like MUI or Tailwind
4. **Write tests** with Vitest
5. **Improve styling** with CSS modules or styled-components

---

## 🆘 Need Help?

If you're stuck:

1. Check browser console (F12)
2. Check extension service worker logs in `chrome://extensions/`
3. Verify `dist/` folder has these files:
   - `manifest.json`
   - `background.js`
   - `popup/index.html`
   - `annotation/index.html`
   - `icon01.jpg`

---

## 📊 File Size Comparison

| Version    | Size                        |
| ---------- | --------------------------- |
| Vanilla JS | ~200KB (with jsPDF)         |
| React      | ~400KB (with React + jsPDF) |

The increase is minimal and worth it for the development benefits!

---

## 🎉 You're All Set!

Your extension is now a modern React application. Enjoy better developer experience, easier maintenance, and access to the entire React ecosystem!

Happy coding! 🚀
