import * as XLSX from 'xlsx';

const FONT_SIZES: Record<number, number> = {
  7.5: 10,
  8: 11,
  9: 12,
  10: 13,
  10.5: 14,
  11: 15,
  12: 16,
  14: 18.7,
  15: 20,
  16: 21.3,
  18: 24,
  22: 29.3,
  24: 32,
  26: 34.7,
  36: 48,
  42: 56,
};

let measureCtx: CanvasRenderingContext2D | null = null;

function getMeasureContext(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null;
  if (!measureCtx) {
    const canvas = document.createElement('canvas');
    measureCtx = canvas.getContext('2d');
  }
  return measureCtx;
}

export function measureTextWidth(text: string, font: string): number {
  const ctx = getMeasureContext();
  if (ctx) {
    ctx.font = font;
    return ctx.measureText(text).width;
  }
  // Fallback for headless environments without DOM canvas (e.g. testing)
  return text.length * 8.5;
}

export function getFontSizePx(pt: number): number {
  if (FONT_SIZES[pt]) {
    return FONT_SIZES[pt];
  }
  return Math.round(pt * 1.333);
}

/**
 * Checks whether a cell is part of a horizontal merge spanning multiple columns.
 * In spreadsheets, multi-column merged cells are ignored when computing auto-fit
 * to prevent wide headers from distorting single-column widths.
 */
function isCellMergedAcrossColumns(data: any, ri: number, ci: number, cell: any): boolean {
  if (cell?.merge && cell.merge[1] > 0) {
    return true;
  }
  if (data.merges && typeof data.merges.getFirstIncludes === 'function') {
    const range = data.merges.getFirstIncludes(ri, ci);
    if (range && range.sci !== range.eci) {
      return true;
    }
  }
  if (Array.isArray(data.merges)) {
    for (const m of data.merges) {
      try {
        const range = XLSX.utils.decode_range(m);
        if (ri >= range.s.r && ri <= range.e.r && ci >= range.s.c && ci <= range.e.c) {
          if (range.s.c !== range.e.c) {
            return true;
          }
        }
      } catch {
        // Ignore decode error
      }
    }
  }
  return false;
}

/**
 * Evaluates basic formulas safely to get their displayed string representation
 * so formula results (e.g. numbers from SUM, strings from CONCAT) are measured.
 */
function evaluateFormula(data: any, expr: string, visited: Set<string>): string {
  const trimmed = expr.trim();

  // Guard against circular recursion
  if (visited.has(trimmed)) return '0';
  visited.add(trimmed);

  // Check for function calls like SUM(A1:B5), AVERAGE(...), etc.
  const fnMatch = trimmed.match(/^([A-Z0-9_]+)\s*\((.*)\)$/i);
  if (fnMatch) {
    const fnName = fnMatch[1].toUpperCase();
    const argsRaw = fnMatch[2];

    const values = extractFormulaArgs(data, argsRaw, visited);

    switch (fnName) {
      case 'SUM': {
        const sum = values.reduce((acc, v) => acc + (Number(v) || 0), 0);
        return String(sum);
      }
      case 'AVERAGE': {
        const nums = values.map(Number).filter((n) => !isNaN(n));
        if (nums.length === 0) return '0';
        const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
        return String(Math.round(avg * 100) / 100);
      }
      case 'MAX': {
        const nums = values.map(Number).filter((n) => !isNaN(n));
        return nums.length ? String(Math.max(...nums)) : '0';
      }
      case 'MIN': {
        const nums = values.map(Number).filter((n) => !isNaN(n));
        return nums.length ? String(Math.min(...nums)) : '0';
      }
      case 'CONCAT': {
        return values.join('');
      }
      case 'IF': {
        const parts = splitTopLevelCommas(argsRaw);
        if (parts.length >= 2) {
          const condition = evaluateFormula(data, parts[0], visited);
          const isTrue = condition !== '0' && condition !== 'false' && condition !== '';
          return isTrue
            ? evaluateFormula(data, parts[1], visited)
            : parts[2] !== undefined
              ? evaluateFormula(data, parts[2], visited)
              : '';
        }
        break;
      }
    }
  }

  // Check for simple single cell reference: e.g. A1, B2
  if (/^[A-Za-z]+[0-9]+$/.test(trimmed)) {
    try {
      const { r, c } = XLSX.utils.decode_cell(trimmed.toUpperCase());
      const cell = data.rows?.getCell ? data.rows.getCell(r, c) : data.rows?.[r]?.cells?.[c];
      if (cell) {
        if (cell.value !== undefined && cell.value !== null && cell.value !== '') {
          return String(cell.value);
        }
        if (cell.text !== undefined && cell.text !== null) {
          const str = String(cell.text);
          if (str.startsWith('=')) {
            return evaluateFormula(data, str.slice(1), visited);
          }
          return str;
        }
      }
      return '0';
    } catch {
      return '0';
    }
  }

  // Basic arithmetic: e.g. C5 - B5, 10 + 20
  const arithMatch = trimmed.match(/^([A-Za-z0-9_.]+)\s*([+\-*/])\s*([A-Za-z0-9_.]+)$/);
  if (arithMatch) {
    const leftVal = Number(evaluateFormula(data, arithMatch[1], visited)) || 0;
    const op = arithMatch[2];
    const rightVal = Number(evaluateFormula(data, arithMatch[3], visited)) || 0;
    switch (op) {
      case '+': return String(leftVal + rightVal);
      case '-': return String(leftVal - rightVal);
      case '*': return String(leftVal * rightVal);
      case '/': return rightVal !== 0 ? String(leftVal / rightVal) : '#DIV/0!';
    }
  }

  return trimmed;
}

function extractFormulaArgs(data: any, argsRaw: string, visited: Set<string>): string[] {
  const parts = splitTopLevelCommas(argsRaw);
  const values: string[] = [];

  for (const part of parts) {
    const rangeMatch = part.trim().match(/^([A-Za-z]+[0-9]+):([A-Za-z]+[0-9]+)$/);
    if (rangeMatch) {
      try {
        const start = XLSX.utils.decode_cell(rangeMatch[1].toUpperCase());
        const end = XLSX.utils.decode_cell(rangeMatch[2].toUpperCase());
        const rMin = Math.min(start.r, end.r);
        const rMax = Math.max(start.r, end.r);
        const cMin = Math.min(start.c, end.c);
        const cMax = Math.max(start.c, end.c);

        for (let r = rMin; r <= rMax; r++) {
          for (let c = cMin; c <= cMax; c++) {
            const cell = data.rows?.getCell ? data.rows.getCell(r, c) : data.rows?.[r]?.cells?.[c];
            if (cell) {
              if (cell.value !== undefined && cell.value !== null && cell.value !== '') {
                values.push(String(cell.value));
              } else if (cell.text !== undefined && cell.text !== null && cell.text !== '') {
                const str = String(cell.text);
                if (str.startsWith('=')) {
                  values.push(evaluateFormula(data, str.slice(1), visited));
                } else {
                  values.push(str);
                }
              }
            }
          }
        }
      } catch {
        // Continue on decode error
      }
    } else {
      values.push(evaluateFormula(data, part, visited));
    }
  }

  return values;
}

function splitTopLevelCommas(str: string): string[] {
  const results: string[] = [];
  let depth = 0;
  let current = '';

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '(') depth++;
    else if (char === ')') depth--;

    if (char === ',' && depth === 0) {
      results.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    results.push(current.trim());
  }

  return results;
}

/**
 * Gets the rendered display text for a cell, evaluating formulas if necessary.
 */
export function getCellDisplayText(data: any, ri: number, ci: number): string {
  const cell = data.rows?.getCell ? data.rows.getCell(ri, ci) : data.rows?.[ri]?.cells?.[ci];
  if (!cell) return '';

  if (cell.value !== undefined && cell.value !== null && cell.value !== '') {
    return String(cell.value);
  }

  const rawText = cell.text !== undefined && cell.text !== null ? String(cell.text) : '';
  if (!rawText.startsWith('=')) {
    return rawText;
  }

  try {
    return evaluateFormula(data, rawText.slice(1), new Set<string>());
  } catch {
    return rawText;
  }
}

export interface AutofitOptions {
  minWidth?: number;
  maxWidth?: number;
  padding?: number;
}

/**
 * Calculates the auto-fit width for a specific column index in the sheet.
 */
export function calculateAutofitColumnWidth(
  data: any,
  colIndex: number,
  options: AutofitOptions = {}
): number {
  const minWidth = options.minWidth ?? (data?.cols?.minWidth || 60);
  const maxWidth = options.maxWidth ?? 800;
  const padding = options.padding ?? 20;

  if (!data) return minWidth;

  let maxTextWidth = 0;
  let hasContent = false;

  // 1. Measure column header text (A, B, C...)
  const colTitle = XLSX.utils.encode_col(colIndex);
  const headerFont = '500 12px "Source Sans Pro", Arial, sans-serif';
  const headerTextWidth = measureTextWidth(colTitle, headerFont) + 30;

  // 2. Iterate through all rows that contain cells for this column
  const rowsObj = data.rows?._ || data.rows;
  if (rowsObj && typeof rowsObj === 'object') {
    for (const [riStr, row] of Object.entries(rowsObj as Record<string, any>)) {
      const ri = parseInt(riStr, 10);
      if (isNaN(ri)) continue;

      const cell = typeof data.rows?.getCell === 'function'
        ? data.rows.getCell(ri, colIndex)
        : row?.cells?.[colIndex];
      if (!cell || cell.text === undefined || cell.text === null || cell.text === '') {
        continue;
      }

      // Skip cells merged horizontally across multiple columns
      if (isCellMergedAcrossColumns(data, ri, colIndex, cell)) {
        continue;
      }

      const displayText = getCellDisplayText(data, ri, colIndex);
      if (!displayText) continue;

      hasContent = true;

      // Font styling
      const style = typeof data.getCellStyleOrDefault === 'function'
        ? data.getCellStyleOrDefault(ri, colIndex)
        : (data.styles && cell.style !== undefined ? data.styles[cell.style] : null);

      const fontObj = style?.font || {};
      const fontName = fontObj.name || 'Arial';
      const fontSizePt = fontObj.size || 10;
      const fontSizePx = getFontSizePx(fontSizePt);
      const isBold = Boolean(fontObj.bold);
      const isItalic = Boolean(fontObj.italic);

      const fontStyle = `${isItalic ? 'italic ' : ''}${isBold ? 'bold ' : ''}${fontSizePx}px ${fontName}, sans-serif`;

      // Multiline support: measure each line individually
      const lines = displayText.split('\n');
      for (const line of lines) {
        const lineWidth = measureTextWidth(line, fontStyle);
        if (lineWidth > maxTextWidth) {
          maxTextWidth = lineWidth;
        }
      }
    }
  }

  // If column has no content, shrink to minWidth (60px) per user specification
  if (!hasContent) {
    return Math.max(minWidth, Math.ceil(headerTextWidth));
  }

  // Extra space if auto-filter dropdown icon is active on this column
  let extraIconSpace = 0;
  if (data.autoFilter && typeof data.autoFilter.active === 'function' && data.autoFilter.active()) {
    try {
      const hrange = data.autoFilter.hrange();
      if (hrange && colIndex >= hrange.sci && colIndex <= hrange.eci) {
        extraIconSpace = 24;
      }
    } catch {
      // Ignore filter check error
    }
  }

  const calculatedWidth = Math.ceil(maxTextWidth + padding + extraIconSpace);
  return Math.min(maxWidth, Math.max(minWidth, Math.ceil(headerTextWidth), calculatedWidth));
}

/**
 * Calculates auto-fit widths for all columns in the sheet.
 */
export function calculateAutofitAllColumns(
  data: any,
  options: AutofitOptions = {}
): Map<number, number> {
  const result = new Map<number, number>();
  if (!data) return result;

  const totalCols = data.cols?.len || 26;
  for (let c = 0; c < totalCols; c++) {
    const width = calculateAutofitColumnWidth(data, c, options);
    result.set(c, width);
  }

  return result;
}
