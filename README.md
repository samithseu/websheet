# WebSheet 📊

A modern, fast, and 100% private in-browser spreadsheet editor and workbench. Read, edit, calculate, and export spreadsheets directly inside your browser—without sending your data to any external server.

---

## ✨ Features

- **🔒 100% Local & Private**: All file parsing, cell calculations, and file generation happen strictly in your browser's local memory. Zero telemetry, zero external server endpoints.
- **📱 Offline Progressive Web App (PWA)**: Install WebSheet directly to your desktop or mobile device. Precached app shell operates completely offline with zero network access required.
- **📂 File Compatibility**:
  - **Import**: Supports `.xlsx`, `.xls`, `.csv`, `.tsv`, `.ods`.
  - **Export**: Save directly to `.xlsx` (preserving multiple sheets, cell values, formulas, merged cells, row heights, and column widths), or export active sheets as `.csv`, `.json`, or standalone `.html` tables.
  - *Note on styling*: Cell text, formulas, merged cells, and dimensions round-trip cleanly; custom fonts, fills, borders, and number formats are not mapped across the library boundary.
- **🖱️ Drag & Drop**: Drag and drop any spreadsheet file anywhere into the window to open it instantly.
- **🧮 Built-in Formula Engine**: Supports `=SUM()`, `=AVERAGE()`, `=MAX()`, `=MIN()`, `=IF()`, `=AND()`, `=OR()`, `=CONCAT()`, and standard arithmetic (`+`, `-`, `*`, `/`, `^`).
- **🎨 Light Instrument Design**: High-contrast, distraction-free instrument aesthetic with cool gray chrome, square canvas grid, unified cobalt accent (`#2563eb`), system UI fonts, and full `prefers-reduced-motion` compliance.
- **📑 Multiple Worksheets**: Create, switch, rename, and delete sheets in the bottom tab bar. CSV and HTML exports automatically target your active worksheet.
- **🔍 Find & Replace**: Powerful search across active sheet or workbook with match counts, column navigation beyond Z, and safe multi-sheet replace without regex match-skipping bugs.
- **📊 Real-time Selection Statistics**: Live sum, average, min, max, and count displayed for selected cell ranges.
- **⌨️ Keyboard Shortcuts**: Familiar universal shortcuts (`Ctrl+S`/`⌘+S`, `Ctrl+O`/`⌘+O`, `Ctrl+F`/`⌘+F`, `Ctrl+P`/`⌘+P`).
- **📋 Ready-made Templates**: Built-in templates for personal budgets, sales reports, and gradebooks with confirmation prompts before loading.

---

## 🚀 Getting Started

WebSheet is built with **pnpm**, **Vite**, **React**, and **Tailwind CSS**.

### Prerequisites
- Node.js (`^20.19.0 || >=22.12.0`)
- pnpm (`v9+` or `v10+`)

### Development Server
```bash
# Install dependencies using committed lockfile
pnpm install --frozen-lockfile

# Start development server on port 3000
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build & PWA Preview
```bash
# Typecheck and compile production bundle
pnpm build

# Preview production build locally
pnpm preview
```

Open [http://localhost:3000](http://localhost:3000) to inspect the PWA, Service Worker, and production assets.

### 🌐 GitHub Pages Deployment

A GitHub Actions workflow is provided in `.github/workflows/pages.yml`. It automatically builds and deploys WebSheet to GitHub Pages on every push to `main`:
1. In your GitHub repository settings, navigate to **Pages**.
2. Under **Build and deployment > Source**, select **GitHub Actions**.
3. Push to `main` or trigger manually from the **Actions** tab.

---

## 🛡️ Privacy Guarantee

WebSheet guarantees zero data egress:
1. **Client-Side Only**: Runs strictly as an offline-first Single Page Application.
2. **App-Shell Precaching**: The Service Worker precaches code, stylesheets, and icons only. Spreadsheet data never enters the cache, background sync, or remote storage.
3. **Inspectable**: Open your browser DevTools (F12) Network tab—no spreadsheet data or cell values are ever transmitted.
