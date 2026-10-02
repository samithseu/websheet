import * as XLSX from 'xlsx';
import type { XSpreadsheetData } from './spreadsheetConverter';

export interface FindMatch {
  sheetIndex: number;
  sheetName: string;
  rowIndex: number;
  colIndex: number;
  cellRef: string;
  originalText: string;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Searches the entire workbook for cells matching the query.
 * Uses XLSX.utils.encode_cell to ensure cell references beyond column Z are accurate (e.g. AA1).
 */
export function searchWorkbook(
  data: XSpreadsheetData,
  query: string,
  matchCase: boolean
): FindMatch[] {
  if (!query.trim() || !data) return [];

  const results: FindMatch[] = [];
  const normalizedQuery = matchCase ? query : query.toLowerCase();

  data.forEach((sheet, sheetIdx) => {
    const sheetName = sheet.name || `Sheet${sheetIdx + 1}`;
    const rows = sheet.rows || {};

    Object.keys(rows).forEach((rStr) => {
      const r = parseInt(rStr, 10);
      if (isNaN(r)) return;
      const row = rows[r];
      if (!row || !row.cells) return;

      Object.keys(row.cells).forEach((cStr) => {
        const c = parseInt(cStr, 10);
        if (isNaN(c)) return;
        const cell = row.cells[c];
        if (!cell || cell.text === undefined || cell.text === null) return;

        const cellStr = String(cell.text);
        const targetStr = matchCase ? cellStr : cellStr.toLowerCase();

        if (targetStr.includes(normalizedQuery)) {
          const cellRef = XLSX.utils.encode_cell({ r, c });
          results.push({
            sheetIndex: sheetIdx,
            sheetName,
            rowIndex: r,
            colIndex: c,
            cellRef,
            originalText: cellStr,
          });
        }
      });
    });
  });

  return results;
}

/**
 * Replaces a single cell occurrence across the workbook data structure.
 * Returns a cloned, updated XSpreadsheetData so replacements on non-active sheets
 * are safe and not restricted to sheet 0.
 */
export function replaceSingleOccurrence(
  data: XSpreadsheetData,
  match: FindMatch,
  query: string,
  replaceText: string,
  matchCase: boolean
): XSpreadsheetData {
  const cloned: XSpreadsheetData = JSON.parse(JSON.stringify(data));
  const sheet = cloned[match.sheetIndex];
  if (!sheet || !sheet.rows) return cloned;

  const row = sheet.rows[match.rowIndex];
  if (!row || !row.cells) return cloned;

  const cell = row.cells[match.colIndex];
  if (!cell || cell.text === undefined || cell.text === null) return cloned;

  const cellStr = String(cell.text);
  const regex = new RegExp(escapeRegExp(query), matchCase ? '' : 'i');
  const newText = cellStr.replace(regex, replaceText);
  cell.text = newText;
  if (!newText.startsWith('=')) {
    delete cell.formula;
  }

  return cloned;
}

/**
 * Replaces all occurrences across all sheets without regex lastIndex skipping bugs.
 */
export function replaceAllOccurrences(
  data: XSpreadsheetData,
  query: string,
  replaceText: string,
  matchCase: boolean
): { data: XSpreadsheetData; count: number } {
  if (!query.trim() || !data) return { data, count: 0 };

  const cloned: XSpreadsheetData = JSON.parse(JSON.stringify(data));
  let count = 0;
  const pattern = escapeRegExp(query);

  cloned.forEach((sheet) => {
    const rows = sheet.rows || {};
    Object.keys(rows).forEach((rStr) => {
      const r = parseInt(rStr, 10);
      if (isNaN(r)) return;
      const row = rows[r];
      if (!row || !row.cells) return;

      Object.keys(row.cells).forEach((cStr) => {
        const c = parseInt(cStr, 10);
        if (isNaN(c)) return;
        const cell = row.cells[c];
        if (!cell || cell.text === undefined || cell.text === null) return;

        const cellStr = String(cell.text);
        const matchRegex = new RegExp(pattern, matchCase ? 'g' : 'gi');
        const matches = cellStr.match(matchRegex);

        if (matches && matches.length > 0) {
          const replaceRegex = new RegExp(pattern, matchCase ? 'g' : 'gi');
          const newText = cellStr.replace(replaceRegex, replaceText);
          cell.text = newText;
          if (!newText.startsWith('=')) {
            delete cell.formula;
          }
          count += matches.length;
        }
      });
    });
  });

  return { data: cloned, count };
}
