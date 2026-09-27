# WebSheet

A private, client-side spreadsheet editor that runs entirely in the browser. No accounts, no backend, and no tracking—your files never leave your device.

## Features

- **Offline-ready PWA**: Installable on desktop and mobile; works without an internet connection.
- **Formats**: Imports `.xlsx`, `.xls`, `.csv`, `.tsv`, and `.ods`. Exports `.xlsx` (sheets, values, formulas, merges, row/column sizes) or active sheets as `.csv`, `.json`, and `.html`. Note that cell styles (fonts, fills, borders) do not round-trip.
- **Formulas**: Built-in evaluation for arithmetic and common functions (`SUM`, `AVERAGE`, `MAX`, `MIN`, `IF`, `AND`, `OR`, `CONCAT`). Files with unsupported Excel functions preserve the formula on export while showing cached values in the grid.
- **Editing tools**: Multi-sheet tabs, drag-and-drop file opening, auto-scrolling during drag/autofill, find & replace, live selection stats, and keyboard shortcuts (`Ctrl/Cmd + S, O, F, P`).

## Development

Requires Node.js (`>=20.19.0`) and `pnpm`.

```bash
# Install dependencies
pnpm install --frozen-lockfile

# Start dev server (http://localhost:3000)
pnpm dev

# Typecheck and build
pnpm build

# Preview production build
pnpm preview
```

## Deployment

Pushes to `main` deploy automatically to GitHub Pages via `.github/workflows/pages.yml`. In repo settings under **Pages**, set Source to **GitHub Actions**.

## Privacy

All parsing, editing, and exports happen locally in your browser. The service worker precaches application assets only; spreadsheet content is never cached, tracked, or sent over the network.
