# WebSheet 📊

A modern, fast, and 100% private in-browser spreadsheet editor. Read, edit, and write Excel and CSV spreadsheets directly inside your browser—without sending your data to any external server.

---

## ✨ Features

- **🔒 100% Local & Private**: All file parsing, cell calculations, and file generation happen strictly in your browser's local memory. Zero telemetry, zero external server endpoints.
- **📂 File Compatibility**:
  - **Import**: Supports `.xlsx`, `.xls`, `.csv`, `.tsv`, `.ods`.
  - **Export**: Save directly to `.xlsx` (preserving multiple sheets, formulas, formatting), or export active sheets as `.csv`, `.json`, or standalone `.html` tables.
- **🖱️ Drag & Drop**: Drag and drop any spreadsheet file anywhere into the window to open it instantly.
- **🧮 Built-in Formula Engine**: Supports `=SUM()`, `=AVERAGE()`, `=MAX()`, `=MIN()`, `=IF()`, `=AND()`, `=OR()`, `=CONCAT()`, and standard arithmetic (`+`, `-`, `*`, `/`, `^`).
- **🎨 Full Cell Formatting**: Bold, italic, underline, strikethrough, text color, fill color, text alignment, borders, text wrap, and number formatting.
- **📑 Multiple Worksheets**: Create, switch, rename, and delete sheets in the bottom tab bar.
- **🔍 Find & Replace**: Powerful search across active sheet or workbook with match count and replace-all capabilities.
- **📊 Real-time Selection Statistics**: Live sum, average, min, max, and count displayed for selected ranges.
- **⌨️ Keyboard Shortcuts**: Familiar shortcuts (`Ctrl+S`, `Ctrl+O`, `Ctrl+F`, `Ctrl+Z`, `Ctrl+Y`, etc.).
- **📋 Ready-made Templates**: Built-in templates for personal budgets, sales reports, and gradebooks.

---

## 🚀 Getting Started

WebSheet is built with **pnpm**, **Vite**, **React**, and **Tailwind CSS**.

### Prerequisites
- Node.js (v18+)
- pnpm (v8+)

### Development Server
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build (Single-File Bundle)
```bash
# Compile and bundle everything into a single standalone file
pnpm build

# Preview production build locally
pnpm preview
```

### 📦 Single-File HTML Distribution
The production build produces a single self-contained file:
```
dist/index.html (~926 KB)
```
- **Zero external asset dependencies**: All HTML, JavaScript, CSS stylesheets, formulas engine, Lucide icons, and favicon are inlined directly into `dist/index.html`.
- **Double-click to run**: You can double-click `dist/index.html` directly in your file manager to open it in Chrome, Firefox, Safari, or Edge via `file://` protocol.
- **Static Hosting**: Upload `dist/index.html` to GitHub Pages, Cloudflare Pages, Netlify, Vercel, or any S3/web server without needing any server-side logic.

---

## 🛡️ Privacy Guarantee

WebSheet guarantees zero data egress:
1. **No Backend Required**: The application runs entirely as a client-side Single Page Application (SPA).
2. **Offline Ready**: You can disconnect from Wi-Fi or run WebSheet in an isolated network environment.
3. **Inspectable**: Open your browser DevTools (F12) Network tab—no spreadsheet data or cell values are ever transmitted.
