import * as XLSX from 'xlsx';
import type { XSpreadsheetCell, XSpreadsheetData, XSpreadsheetSheet } from './spreadsheetConverter';

export interface PrintPaperSize {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  widthPx: number; // at 96 DPI
  heightPx: number; // at 96 DPI
}

export const PRINT_PAPER_SIZES: PrintPaperSize[] = [
  { id: 'letter', name: 'Letter (8.5" × 11")', widthMm: 215.9, heightMm: 279.4, widthPx: 816, heightPx: 1056 },
  { id: 'a4', name: 'A4 (210 × 297 mm)', widthMm: 210, heightMm: 297, widthPx: 794, heightPx: 1123 },
  { id: 'legal', name: 'Legal (8.5" × 14")', widthMm: 215.9, heightMm: 355.6, widthPx: 816, heightPx: 1344 },
  { id: 'a3', name: 'A3 (297 × 420 mm)', widthMm: 297, heightMm: 420, widthPx: 1123, heightPx: 1588 },
  { id: 'tabloid', name: 'Tabloid (11" × 17")', widthMm: 279.4, heightMm: 431.8, widthPx: 1056, heightPx: 1632 },
  { id: 'b4', name: 'B4 (250 × 353 mm)', widthMm: 250, heightMm: 353, widthPx: 945, heightPx: 1334 },
  { id: 'b5', name: 'B5 (176 × 250 mm)', widthMm: 176, heightMm: 250, widthPx: 665, heightPx: 945 },
];

export type PrintOrientation = 'portrait' | 'landscape';

export interface PrintMarginOption {
  id: string;
  name: string;
  valueMm: number;
  valuePx: number;
}

export const PRINT_MARGIN_OPTIONS: PrintMarginOption[] = [
  { id: 'normal', name: 'Normal (0.75" / 1.9 cm)', valueMm: 19.05, valuePx: 72 },
  { id: 'narrow', name: 'Narrow (0.25" / 0.6 cm)', valueMm: 6.35, valuePx: 24 },
  { id: 'wide', name: 'Wide (1.0" / 2.5 cm)', valueMm: 25.4, valuePx: 96 },
  { id: 'custom', name: 'Custom', valueMm: 12.7, valuePx: 48 },
];

export type PrintScope = 'active-sheet' | 'selection' | 'workbook';
export type PrintScaleMode = 'fit-width' | 'normal' | 'fit-page';

export interface PrintConfig {
  paperSizeId: string;
  orientation: PrintOrientation;
  marginId: string;
  customMarginInches?: number;
  scope: PrintScope;
  scaleMode: PrintScaleMode;
  showGridlines: boolean;
}

export interface CellRange {
  sri: number;
  sci: number;
  eri: number;
  eci: number;
}

export interface RenderedPrintPage {
  sheetName: string;
  pageIndex: number;
  totalPages: number;
  html: string;
  widthPx: number;
  heightPx: number;
  paddingPx: number;
}

const DEFAULT_ROW_HEIGHT = 26;
const DEFAULT_COL_WIDTH = 100;

/**
 * Calculates the bounding range of non-empty content in a sheet.
 */
export function getSheetContentRange(sheet: XSpreadsheetSheet): CellRange {
  let minR = 0;
  let minC = 0;
  let maxR = 0;
  let maxC = 0;
  let hasCells = false;

  const rows = sheet.rows || {};
  Object.keys(rows).forEach((rKey) => {
    const r = parseInt(rKey, 10);
    if (isNaN(r) || r === undefined) return;
    const row = rows[r];
    if (!row || !row.cells) return;

    Object.keys(row.cells).forEach((cKey) => {
      const c = parseInt(cKey, 10);
      if (isNaN(c) || c === undefined) return;
      const cell = row.cells[c];
      if (cell && (cell.text !== undefined && cell.text !== null && cell.text !== '' || cell.value !== undefined)) {
        if (!hasCells) {
          minR = r;
          maxR = r;
          minC = c;
          maxC = c;
          hasCells = true;
        } else {
          if (r < minR) minR = r;
          if (r > maxR) maxR = r;
          if (c < minC) minC = c;
          if (c > maxC) maxC = c;
        }
      }
    });
  });

  // Account for merges that might extend beyond maxR/maxC
  if (sheet.merges && Array.isArray(sheet.merges)) {
    sheet.merges.forEach((mStr) => {
      try {
        const decoded = XLSX.utils.decode_range(mStr);
        if (decoded.e.r > maxR) maxR = decoded.e.r;
        if (decoded.e.c > maxC) maxC = decoded.e.c;
      } catch {
        // ignore invalid merge syntax
      }
    });
  }

  if (!hasCells) {
    return { sri: 0, sci: 0, eri: 9, eci: 4 };
  }

  return { sri: 0, sci: 0, eri: Math.max(0, maxR), eci: Math.max(0, maxC) };
}

/**
 * Evaluates formula string or extracts cell value for printing.
 */
export function getEvaluatedCellText(
  cell: XSpreadsheetCell | undefined,
  sheet: XSpreadsheetSheet,
  evalCache: Map<string, string> = new Map()
): string {
  if (!cell) return '';

  // If value is already resolved and not empty
  if (cell.value !== undefined && cell.value !== null && cell.value !== '') {
    return String(cell.value);
  }

  if (cell.text === undefined || cell.text === null) return '';
  const textStr = String(cell.text).trim();

  // If not a formula, return direct text
  if (!textStr.startsWith('=')) {
    return textStr;
  }

  // Formula evaluation fallback
  const formula = textStr.slice(1).toUpperCase();
  const cacheKey = `${sheet.name}:${textStr}`;
  if (evalCache.has(cacheKey)) {
    return evalCache.get(cacheKey)!;
  }

  const getCellVal = (r: number, c: number): number => {
    const targetCell = sheet.rows?.[r]?.cells?.[c];
    if (!targetCell) return 0;
    const txt = getEvaluatedCellText(targetCell, sheet, evalCache);
    const num = parseFloat(txt.replace(/[$,]/g, ''));
    return isNaN(num) ? 0 : num;
  };

  try {
    // 1. Basic SUM(A1:B5) or AVERAGE, MIN, MAX
    const funcMatch = formula.match(/^(SUM|AVERAGE|MIN|MAX|COUNT)\(([^)]+)\)$/);
    if (funcMatch) {
      const fnName = funcMatch[1];
      const arg = funcMatch[2];
      const values: number[] = [];

      arg.split(',').forEach((part) => {
        const trimmed = part.trim();
        if (trimmed.includes(':')) {
          try {
            const range = XLSX.utils.decode_range(trimmed);
            for (let r = range.s.r; r <= range.e.r; r++) {
              for (let c = range.s.c; c <= range.e.c; c++) {
                values.push(getCellVal(r, c));
              }
            }
          } catch {
            // ignore
          }
        } else {
          try {
            const { r, c } = XLSX.utils.decode_cell(trimmed);
            values.push(getCellVal(r, c));
          } catch {
            const n = parseFloat(trimmed);
            if (!isNaN(n)) values.push(n);
          }
        }
      });

      let res = 0;
      if (fnName === 'SUM') {
        res = values.reduce((a, b) => a + b, 0);
      } else if (fnName === 'AVERAGE') {
        res = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      } else if (fnName === 'MIN') {
        res = values.length ? Math.min(...values) : 0;
      } else if (fnName === 'MAX') {
        res = values.length ? Math.max(...values) : 0;
      } else if (fnName === 'COUNT') {
        res = values.length;
      }

      const formatted = Number.isInteger(res) ? String(res) : res.toFixed(2);
      evalCache.set(cacheKey, formatted);
      return formatted;
    }

    // 2. Simple binary operations: e.g. C5-B5, A1+B1, A1*1.05
    const binaryMatch = formula.match(/^([A-Z]+[0-9]+)\s*([+\-*/])\s*([A-Z]+[0-9]+)$/);
    if (binaryMatch) {
      const c1 = XLSX.utils.decode_cell(binaryMatch[1]);
      const op = binaryMatch[2];
      const c2 = XLSX.utils.decode_cell(binaryMatch[3]);
      const v1 = getCellVal(c1.r, c1.c);
      const v2 = getCellVal(c2.r, c2.c);

      let res = 0;
      if (op === '+') res = v1 + v2;
      else if (op === '-') res = v1 - v2;
      else if (op === '*') res = v1 * v2;
      else if (op === '/' && v2 !== 0) res = v1 / v2;

      const formatted = Number.isInteger(res) ? String(res) : res.toFixed(2);
      evalCache.set(cacheKey, formatted);
      return formatted;
    }
  } catch {
    // If formula parsing fails, return the formula text
  }

  evalCache.set(cacheKey, textStr);
  return textStr;
}

/**
 * Builds HTML table style string for a given cell.
 */
function buildCellStyleString(
  style: any,
  showGridlines: boolean,
  isHeaderRow: boolean
): string {
  const styles: string[] = [
    'box-sizing: border-box',
    'overflow: hidden',
    'white-space: pre-wrap',
    'word-break: break-word',
    'padding: 4px 6px',
    'font-size: 11px',
    'line-height: 1.25',
  ];

  // Gridlines / Borders
  if (style?.border) {
    const b = style.border;
    if (b.top) styles.push(`border-top: ${b.top[0] || '1px'} solid ${b.top[1] || '#cbd5e1'}`);
    if (b.bottom) styles.push(`border-bottom: ${b.bottom[0] || '1px'} solid ${b.bottom[1] || '#cbd5e1'}`);
    if (b.left) styles.push(`border-left: ${b.left[0] || '1px'} solid ${b.left[1] || '#cbd5e1'}`);
    if (b.right) styles.push(`border-right: ${b.right[0] || '1px'} solid ${b.right[1] || '#cbd5e1'}`);
  } else if (showGridlines) {
    styles.push('border: 1px solid #e2e8f0');
  } else {
    styles.push('border: 1px solid transparent');
  }

  // Background color
  if (style?.bgcolor) {
    styles.push(`background-color: ${style.bgcolor}`);
  } else if (isHeaderRow) {
    styles.push('background-color: #f8fafc');
  }

  // Text color
  if (style?.color) {
    styles.push(`color: ${style.color}`);
  }

  // Text alignment
  if (style?.align) {
    styles.push(`text-align: ${style.align}`);
  } else {
    styles.push('text-align: left');
  }

  // Vertical alignment
  if (style?.valign) {
    styles.push(`vertical-align: ${style.valign}`);
  } else {
    styles.push('vertical-align: middle');
  }

  // Font properties
  if (style?.font) {
    const f = style.font;
    if (f.name) styles.push(`font-family: ${f.name}, system-ui, sans-serif`);
    if (f.size) styles.push(`font-size: ${f.size}pt`);
    if (f.bold) styles.push('font-weight: 700');
    if (f.italic) styles.push('font-style: italic');
  }

  if (style?.underline) styles.push('text-decoration: underline');
  if (style?.strike) styles.push('text-decoration: line-through');

  return styles.join('; ');
}

/**
 * Generates an array of RenderedPrintPage objects given workbook data and user print configuration.
 */
export function generatePrintPages(
  data: XSpreadsheetData,
  activeSheetIndex: number,
  selectedRange: CellRange | null,
  config: PrintConfig
): RenderedPrintPage[] {
  const paper = PRINT_PAPER_SIZES.find((p) => p.id === config.paperSizeId) || PRINT_PAPER_SIZES[0];

  let marginPx: number;
  if (config.marginId === 'custom') {
    const customInches = Math.max(0, Math.min(3, config.customMarginInches ?? 0.5));
    marginPx = Math.round(customInches * 96);
  } else {
    const marginOpt = PRINT_MARGIN_OPTIONS.find((m) => m.id === config.marginId) || PRINT_MARGIN_OPTIONS[0];
    marginPx = marginOpt.valuePx;
  }

  const isLandscape = config.orientation === 'landscape';
  const paperWidthPx = isLandscape ? Math.max(paper.widthPx, paper.heightPx) : Math.min(paper.widthPx, paper.heightPx);
  const paperHeightPx = isLandscape ? Math.min(paper.widthPx, paper.heightPx) : Math.max(paper.widthPx, paper.heightPx);

  const printableWidthPx = Math.max(100, paperWidthPx - 2 * marginPx);
  const printableHeightPx = Math.max(100, paperHeightPx - 2 * marginPx);

  // Target sheets based on scope
  const targetSheets: Array<{ sheet: XSpreadsheetSheet; range: CellRange }> = [];

  if (config.scope === 'selection' && selectedRange) {
    const currentSheet = data[activeSheetIndex] || data[0];
    if (currentSheet) {
      targetSheets.push({
        sheet: currentSheet,
        range: selectedRange,
      });
    }
  } else if (config.scope === 'workbook') {
    data.forEach((sh) => {
      targetSheets.push({
        sheet: sh,
        range: getSheetContentRange(sh),
      });
    });
  } else {
    // 'active-sheet'
    const currentSheet = data[activeSheetIndex] || data[0];
    if (currentSheet) {
      targetSheets.push({
        sheet: currentSheet,
        range: getSheetContentRange(currentSheet),
      });
    }
  }

  const allPages: RenderedPrintPage[] = [];

  targetSheets.forEach(({ sheet, range }) => {
    const { sri, sci, eri, eci } = range;
    const styles = sheet.styles || [];

    // Calculate column widths
    const colWidths: number[] = [];
    let totalContentWidthPx = 0;
    for (let c = sci; c <= eci; c++) {
      const w = sheet.cols?.[c]?.width || DEFAULT_COL_WIDTH;
      colWidths.push(w);
      totalContentWidthPx += w;
    }

    // Determine scale factor
    let scale = 1.0;
    if (config.scaleMode === 'fit-width') {
      if (totalContentWidthPx > 0) {
        scale = printableWidthPx / totalContentWidthPx;
      }
    } else if (config.scaleMode === 'fit-page') {
      let totalContentHeightPx = 0;
      for (let r = sri; r <= eri; r++) {
        totalContentHeightPx += sheet.rows?.[r]?.height || DEFAULT_ROW_HEIGHT;
      }
      if (totalContentWidthPx > 0 && totalContentHeightPx > 0) {
        scale = Math.min(printableWidthPx / totalContentWidthPx, printableHeightPx / totalContentHeightPx);
      }
    }

    // Pre-calculate merged cells lookup
    // Set of "r,c" coordinates that are absorbed by a merge from a previous cell
    const absorbedCells = new Set<string>();
    const mergeSpans = new Map<string, [number, number]>();

    for (let r = sri; r <= eri; r++) {
      for (let c = sci; c <= eci; c++) {
        const cell = sheet.rows?.[r]?.cells?.[c];
        if (cell?.merge && Array.isArray(cell.merge)) {
          const [rn, cn] = cell.merge;
          if (rn > 0 || cn > 0) {
            mergeSpans.set(`${r},${c}`, [rn, cn]);
            for (let mr = r; mr <= r + rn; mr++) {
              for (let mc = c; mc <= c + cn; mc++) {
                if (mr === r && mc === c) continue;
                absorbedCells.add(`${mr},${mc}`);
              }
            }
          }
        }
      }
    }

    // Paginator: group rows into pages
    const pageRowChunks: number[][] = [];
    let currentChunk: number[] = [];
    let currentChunkHeight = 0;

    for (let r = sri; r <= eri; r++) {
      const rowHeight = (sheet.rows?.[r]?.height || DEFAULT_ROW_HEIGHT) * scale;

      // If adding this row exceeds printable height (and chunk is not empty)
      if (config.scaleMode !== 'fit-page' && currentChunkHeight + rowHeight > printableHeightPx && currentChunk.length > 0) {
        pageRowChunks.push(currentChunk);
        currentChunk = [r];
        currentChunkHeight = rowHeight;
      } else {
        currentChunk.push(r);
        currentChunkHeight += rowHeight;
      }
    }

    if (currentChunk.length > 0) {
      pageRowChunks.push(currentChunk);
    }

    // Build HTML for each page chunk
    pageRowChunks.forEach((chunkRows, chunkIdx) => {
      let tableRowsHtml = '';

      chunkRows.forEach((r) => {
        const rowHeight = (sheet.rows?.[r]?.height || DEFAULT_ROW_HEIGHT) * scale;
        let cellsHtml = '';

        for (let c = sci; c <= eci; c++) {
          const coordKey = `${r},${c}`;
          if (absorbedCells.has(coordKey)) {
            // Covered by a merge
            continue;
          }

          const cell = sheet.rows?.[r]?.cells?.[c];
          const style = cell && cell.style !== undefined ? styles[cell.style] : null;
          const text = getEvaluatedCellText(cell, sheet);
          const cellStyleStr = buildCellStyleString(style, config.showGridlines, r === 0);

          let spanAttrs = '';
          if (mergeSpans.has(coordKey)) {
            const [rn, cn] = mergeSpans.get(coordKey)!;
            // Only span within this page chunk vertically
            const effectiveRn = Math.min(rn, chunkRows[chunkRows.length - 1] - r);
            spanAttrs = ` rowspan="${effectiveRn + 1}" colspan="${cn + 1}"`;
          }

          cellsHtml += `<td style="${cellStyleStr}"${spanAttrs}>${escapeHtml(text)}</td>`;
        }

        tableRowsHtml += `<tr style="height: ${rowHeight}px;">${cellsHtml}</tr>`;
      });

      // Build colgroup
      let colgroupHtml = '';
      colWidths.forEach((w) => {
        colgroupHtml += `<col style="width: ${w * scale}px;" />`;
      });

      const tableWidth = totalContentWidthPx * scale;
      const pageHtml = `
        <div class="print-page-content" style="width: 100%; height: 100%; display: flex; flex-direction: column;">
          <div style="font-size: 10px; color: #64748b; font-weight: 600; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
            <span>${escapeHtml(sheet.name)}</span>
            <span>Page ${chunkIdx + 1} of ${pageRowChunks.length}</span>
          </div>
          <div style="flex: 1; min-height: 0; overflow: hidden;">
            <table style="border-collapse: collapse; table-layout: fixed; width: ${tableWidth}px; background: white; font-family: system-ui, -apple-system, sans-serif;">
              <colgroup>${colgroupHtml}</colgroup>
              <tbody>${tableRowsHtml}</tbody>
            </table>
          </div>
        </div>
      `;

      allPages.push({
        sheetName: sheet.name,
        pageIndex: allPages.length + 1,
        totalPages: 0, // will be patched below
        html: pageHtml,
        widthPx: paperWidthPx,
        heightPx: paperHeightPx,
        paddingPx: marginPx,
      });
    });
  });

  // Patch totalPages
  const total = allPages.length;
  allPages.forEach((p) => {
    p.totalPages = total;
  });

  return allPages;
}

/**
 * Triggers native browser printing using a temporary invisible iframe with @page styling.
 */
export function triggerIframePrint(
  pages: RenderedPrintPage[],
  config: PrintConfig
): void {
  const paper = PRINT_PAPER_SIZES.find((p) => p.id === config.paperSizeId) || PRINT_PAPER_SIZES[0];
  const isLandscape = config.orientation === 'landscape';

  const widthMm = isLandscape ? Math.max(paper.widthMm, paper.heightMm) : Math.min(paper.widthMm, paper.heightMm);
  const heightMm = isLandscape ? Math.min(paper.widthMm, paper.heightMm) : Math.max(paper.widthMm, paper.heightMm);

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.top = '-9999px';
  iframe.style.left = '-9999px';
  iframe.style.width = '0px';
  iframe.style.height = '0px';
  iframe.style.border = 'none';

  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  const pagesHtml = pages
    .map(
      (p) => `
    <div class="print-page" style="width: ${widthMm}mm; height: ${heightMm}mm; padding: ${p.paddingPx}px; box-sizing: border-box; page-break-after: always; page-break-inside: avoid; overflow: hidden; background: white;">
      ${p.html}
    </div>
  `
    )
    .join('');

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Print Document</title>
        <style>
          @page {
            size: ${widthMm}mm ${heightMm}mm;
            margin: 0;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0;
            padding: 0;
            background: white;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
          .print-page {
            box-sizing: border-box;
            page-break-after: always;
            page-break-inside: avoid;
            background: white;
          }
          .print-page:last-child {
            page-break-after: auto;
          }
        </style>
      </head>
      <body>
        ${pagesHtml}
      </body>
    </html>
  `);
  doc.close();

  // Allow styles and DOM to settle before calling print
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.error('Print iframe error:', err);
    } finally {
      setTimeout(() => {
        if (iframe.parentNode) {
          document.body.removeChild(iframe);
        }
      }, 3000);
    }
  }, 250);
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
