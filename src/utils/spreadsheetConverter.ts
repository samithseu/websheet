import * as XLSX from 'xlsx';

export interface XSpreadsheetCell {
  text?: string | number | boolean;
  value?: string | number | boolean;
  formula?: string;
  style?: number;
  merge?: [number, number];
}

export interface XSpreadsheetRow {
  height?: number;
  cells: {
    [colIndex: number]: XSpreadsheetCell;
  };
}

export interface XSpreadsheetCol {
  width?: number;
  style?: number;
}

export interface XSpreadsheetSheet {
  name: string;
  freeze?: string;
  styles?: any[];
  merges?: string[];
  cols?: {
    len?: number;
    [colIndex: number]: XSpreadsheetCol;
  };
  rows: {
    len?: number;
    [rowIndex: number]: XSpreadsheetRow;
  };
}

export type XSpreadsheetData = XSpreadsheetSheet[];

/**
 * Built-in formula functions supported by x-data-spreadsheet engine.
 * Advanced formulas outside this set are safely rendered using cached values
 * to avoid canvas rendering crashes.
 */
const GRID_SUPPORTED_FORMULAS = new Set([
  'SUM',
  'AVERAGE',
  'MAX',
  'MIN',
  'IF',
  'AND',
  'OR',
  'CONCAT',
]);

/**
 * Checks whether all functions in a formula string are supported by the x-data-spreadsheet engine.
 */
export function isFormulaSupportedByGrid(formula: string): boolean {
  if (!formula) return true;
  const matches = formula.matchAll(/([A-Z0-9_.]+)\s*\(/gi);
  for (const m of matches) {
    if (!GRID_SUPPORTED_FORMULAS.has(m[1].toUpperCase())) {
      return false;
    }
  }
  return true;
}

/**
 * Ensures two-way synchronization between `sheet.merges` and `cell.merge`
 * for proper canvas box rendering in x-data-spreadsheet and reliable SheetJS exports.
 */
export function normalizeSpreadsheetData(data: XSpreadsheetData): XSpreadsheetData {
  if (!data || !Array.isArray(data)) return data;
  return data.map((sheet) => {
    const merges = new Set<string>(sheet.merges || []);
    const rows = { ...(sheet.rows || {}) };

    // 1. Scan rows for cells with cell.merge and ensure they are recorded in merges
    Object.keys(rows).forEach((rKey) => {
      const r = parseInt(rKey, 10);
      if (isNaN(r) || !rows[r]?.cells) return;
      Object.keys(rows[r].cells).forEach((cKey) => {
        const c = parseInt(cKey, 10);
        if (isNaN(c)) return;
        const cell = rows[r].cells[c];
        if (cell?.merge && Array.isArray(cell.merge)) {
          const [rn, cn] = cell.merge;
          if (rn > 0 || cn > 0) {
            merges.add(
              XLSX.utils.encode_range({
                s: { r, c },
                e: { r: r + rn, c: c + cn },
              })
            );
          }
        }
      });
    });

    // 2. For every merge range in merges, ensure top-left cell has cell.merge set
    // and prune subordinate cells inside the merge range to prevent canvas text overlap
    merges.forEach((mergeRef) => {
      try {
        const range = XLSX.utils.decode_range(mergeRef);
        const { s: { r: sri, c: sci }, e: { r: eri, c: eci } } = range;
        const rn = eri - sri;
        const cn = eci - sci;

        if (rn >= 0 && cn >= 0 && (rn > 0 || cn > 0)) {
          if (!rows[sri]) {
            rows[sri] = { cells: {} };
          } else {
            rows[sri] = { ...rows[sri], cells: { ...(rows[sri].cells || {}) } };
          }
          if (!rows[sri].cells[sci]) {
            rows[sri].cells[sci] = { text: '' };
          }
          rows[sri].cells[sci] = {
            ...rows[sri].cells[sci],
            merge: [rn, cn],
          };

          // Remove subordinate cells within the merge range
          for (let r = sri; r <= eri; r++) {
            for (let c = sci; c <= eci; c++) {
              if (r === sri && c === sci) continue;
              if (rows[r]?.cells?.[c]) {
                rows[r] = { ...rows[r], cells: { ...rows[r].cells } };
                delete rows[r].cells[c];
              }
            }
          }
        }
      } catch {
        // Skip invalid ranges
      }
    });

    return {
      ...sheet,
      merges: Array.from(merges),
      rows,
    };
  });
}

/**
 * Converts a SheetJS Workbook into x-data-spreadsheet JSON format
 */
export function workbookToXSpreadsheet(wb: XLSX.WorkBook): XSpreadsheetData {
  const out: XSpreadsheetData = [];

  if (!wb || !wb.SheetNames || wb.SheetNames.length === 0) {
    return [createEmptySheet('Sheet1')];
  }

  wb.SheetNames.forEach((name) => {
    const ws = wb.Sheets[name];
    if (!ws) return;

    const sheet: XSpreadsheetSheet = {
      name: name,
      merges: [],
      rows: {},
      cols: {},
      styles: [],
    };

    // If no ref, sheet is empty
    if (!ws['!ref']) {
      out.push(sheet);
      return;
    }

    const range = XLSX.utils.decode_range(ws['!ref']);

    // Handle column widths (prune beyond used range to avoid Excel 16,384 column bloat)
    const maxColIdx = Math.max(range.e.c + 20, 100);
    if (ws['!cols'] && Array.isArray(ws['!cols'])) {
      ws['!cols'].forEach((col, cIdx) => {
        if (!col || cIdx > maxColIdx) return;
        if (!sheet.cols) sheet.cols = {};
        const width = col.wpx || (col.wch ? Math.round(col.wch * 8.5) : undefined);
        if (width) {
          sheet.cols[cIdx] = { width };
        }
      });
    }

    // Handle row heights
    if (ws['!rows'] && Array.isArray(ws['!rows'])) {
      ws['!rows'].forEach((row, rIdx) => {
        if (!row) return;
        const height = row.hpx || (row.hpt ? Math.round(row.hpt * 1.33) : undefined);
        if (height) {
          if (!sheet.rows[rIdx]) {
            sheet.rows[rIdx] = { cells: {} };
          }
          sheet.rows[rIdx].height = height;
        }
      });
    }

    // Handle merged cells
    if (ws['!merges'] && Array.isArray(ws['!merges'])) {
      ws['!merges'].forEach((m) => {
        const mergeStr = typeof m === 'string' ? m : XLSX.utils.encode_range(m);
        if (!sheet.merges) sheet.merges = [];
        sheet.merges.push(mergeStr);
      });
    }

    // Map cells
    for (let r = range.s.r; r <= range.e.r; ++r) {
      let rowHasCells = false;
      const rowCells: { [colIndex: number]: XSpreadsheetCell } = {};

      for (let c = range.s.c; c <= range.e.c; ++c) {
        const cellCoord = XLSX.utils.encode_cell({ r, c });
        const cell = ws[cellCoord];

        if (cell !== undefined && cell !== null) {
          rowHasCells = true;
          let cellText = '';
          let cellFormula: string | undefined;

          // Check for formula
          if (cell.f) {
            if (isFormulaSupportedByGrid(cell.f)) {
              cellText = '=' + cell.f;
            } else {
              // Formula unsupported by x-data-spreadsheet engine (e.g. RANK, COUNTIFS)
              // Render cached calculated value to prevent canvas rendering crashes
              cellFormula = cell.f;
              if (cell.w !== undefined) {
                cellText = String(cell.w);
              } else if (cell.v !== undefined) {
                cellText = String(cell.v);
              } else {
                cellText = '';
              }
            }
          } else if (cell.w !== undefined) {
            cellText = String(cell.w);
          } else if (cell.v !== undefined) {
            cellText = String(cell.v);
          }

          rowCells[c] = {
            text: cellText,
            value: cell.v !== undefined ? cell.v : cellText,
            ...(cellFormula ? { formula: cellFormula } : {}),
          };
        }
      }

      if (rowHasCells || (sheet.rows[r] && sheet.rows[r].height)) {
        if (!sheet.rows[r]) {
          sheet.rows[r] = { cells: {} };
        }
        sheet.rows[r].cells = { ...sheet.rows[r].cells, ...rowCells };
      }
    }

    // Set row length to at least the max row
    sheet.rows.len = Math.max(100, range.e.r + 20);
    if (sheet.cols) {
      sheet.cols.len = Math.max(26, range.e.c + 10);
    }

    out.push(sheet);
  });

  return normalizeSpreadsheetData(out.length > 0 ? out : [createEmptySheet('Sheet1')]);
}

/**
 * Converts x-data-spreadsheet JSON format back into a SheetJS Workbook
 */
export function xSpreadsheetToWorkbook(sdata: XSpreadsheetData): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  const normalizedData = normalizeSpreadsheetData(sdata);

  if (!normalizedData || !Array.isArray(normalizedData) || normalizedData.length === 0) {
    const ws = XLSX.utils.aoa_to_sheet([[]]);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    return wb;
  }

  normalizedData.forEach((sheet, sheetIdx) => {
    const ws: XLSX.WorkSheet = {};
    let minR = 0;
    let minC = 0;
    let maxR = 0;
    let maxC = 0;
    let hasCells = false;

    const rowKeys = Object.keys(sheet.rows || {})
      .map((k) => parseInt(k, 10))
      .filter((k) => !isNaN(k));

    rowKeys.forEach((r) => {
      const row = sheet.rows[r];
      if (!row || !row.cells) return;

      const colKeys = Object.keys(row.cells)
        .map((k) => parseInt(k, 10))
        .filter((k) => !isNaN(k));

      colKeys.forEach((c) => {
        const cell = row.cells[c];
        if (!cell || cell.text === undefined || cell.text === null || cell.text === '') {
          return;
        }

        const cellRef = XLSX.utils.encode_cell({ r, c });
        const textStr = String(cell.text).trim();

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

        const hasDirectFormula = textStr.startsWith('=');
        const formulaToExport = hasDirectFormula
          ? textStr.slice(1)
          : (cell.formula && (!textStr || textStr === String(cell.value) || !isNaN(Number(textStr))) ? cell.formula : undefined);

        // Formula export
        if (formulaToExport) {
          const formula = formulaToExport;
          if (cell.value !== undefined && cell.value !== null && cell.value !== '') {
            if (typeof cell.value === 'boolean') {
              ws[cellRef] = {
                t: 'b',
                f: formula,
                v: cell.value,
              };
            } else if (typeof cell.value === 'number') {
              ws[cellRef] = {
                t: 'n',
                f: formula,
                v: cell.value,
              };
            } else if (typeof cell.value === 'string') {
              ws[cellRef] = {
                t: 's',
                f: formula,
                v: cell.value,
              };
            } else {
              const num = Number(cell.value);
              ws[cellRef] = isNaN(num)
                ? { t: 's', f: formula, v: String(cell.value) }
                : { t: 'n', f: formula, v: num };
            }
          } else {
            ws[cellRef] = {
              t: 'n',
              f: formula,
              v: 0,
            };
          }
        } else if (!isNaN(Number(textStr)) && textStr !== '') {
          ws[cellRef] = {
            t: 'n',
            v: Number(textStr),
          };
        } else if (textStr.toLowerCase() === 'true' || textStr.toLowerCase() === 'false') {
          ws[cellRef] = {
            t: 'b',
            v: textStr.toLowerCase() === 'true',
          };
        } else {
          ws[cellRef] = {
            t: 's',
            v: String(cell.text),
          };
        }
      });
    });

    // Merges
    if (sheet.merges && Array.isArray(sheet.merges) && sheet.merges.length > 0) {
      ws['!merges'] = sheet.merges.map((m) => XLSX.utils.decode_range(m));
    }

    // Column widths
    if (sheet.cols) {
      const colArr: XLSX.ColInfo[] = [];
      const colKeys = Object.keys(sheet.cols)
        .map((k) => parseInt(k, 10))
        .filter((k) => !isNaN(k))
        .sort((a, b) => a - b);

      colKeys.forEach((c) => {
        const colObj = sheet.cols![c];
        if (colObj && colObj.width) {
          colArr[c] = { wpx: colObj.width };
        }
      });

      if (colArr.length > 0) {
        ws['!cols'] = colArr;
      }
    }

    // Set Sheet bounds
    if (hasCells) {
      ws['!ref'] = XLSX.utils.encode_range({
        s: { r: minR, c: minC },
        e: { r: maxR, c: maxC },
      });
    } else {
      ws['!ref'] = 'A1:A1';
    }

    const sheetName = sheet.name || `Sheet${sheetIdx + 1}`;
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  return wb;
}

/**
 * Creates an empty default sheet data structure
 */
export function createEmptySheet(name = 'Sheet1'): XSpreadsheetSheet {
  return {
    name,
    freeze: 'A1',
    styles: [],
    merges: [],
    rows: {
      len: 100,
    },
    cols: {
      len: 26,
    },
  };
}

/**
 * Reads any spreadsheet file (File / Blob / ArrayBuffer) into a SheetJS Workbook
 */
export async function readSpreadsheetFile(file: File | Blob): Promise<XLSX.WorkBook> {
  const arrayBuffer = await file.arrayBuffer();
  return XLSX.read(arrayBuffer, {
    type: 'array',
    cellFormula: true,
    cellStyles: true,
    cellNF: true,
    cellDates: true,
  });
}

/**
 * Exports workbook as binary XLSX blob
 */
export function workbookToXlsxBlob(wb: XLSX.WorkBook): Blob {
  const wbout = XLSX.write(wb, {
    bookType: 'xlsx',
    type: 'array',
  });
  return new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

/**
 * Exports active sheet or first sheet as CSV blob
 */
export function workbookToCsvBlob(wb: XLSX.WorkBook, sheetName?: string): Blob {
  const targetSheetName = sheetName && wb.Sheets[sheetName] ? sheetName : wb.SheetNames[0];
  const ws = wb.Sheets[targetSheetName];
  if (!ws) {
    return new Blob([''], { type: 'text/csv;charset=utf-8;' });
  }
  const csv = XLSX.utils.sheet_to_csv(ws);
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Exports workbook or active sheet as JSON blob
 */
export function workbookToJsonBlob(wb: XLSX.WorkBook, sheetName?: string): Blob {
  if (sheetName && wb.Sheets[sheetName]) {
    const json = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);
    return new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
  }

  const allData: Record<string, any[]> = {};
  wb.SheetNames.forEach((name) => {
    allData[name] = XLSX.utils.sheet_to_json(wb.Sheets[name]);
  });
  return new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
}

/**
 * Exports active sheet as HTML Table string
 */
export function workbookToHtmlBlob(wb: XLSX.WorkBook, sheetName?: string): Blob {
  const targetSheetName = sheetName && wb.Sheets[sheetName] ? sheetName : wb.SheetNames[0];
  const ws = wb.Sheets[targetSheetName];
  if (!ws) {
    return new Blob(['<table></table>'], { type: 'text/html;charset=utf-8;' });
  }
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${targetSheetName}</title>
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 2rem; background: #f8fafc; color: #0f172a; }
    table { border-collapse: collapse; width: 100%; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; }
    td, th { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; font-size: 13px; }
    th { background: #f1f5f9; font-weight: 600; }
    tr:nth-child(even) { background: #f8fafc; }
  </style>
</head>
<body>
  <h2>${targetSheetName}</h2>
  ${XLSX.utils.sheet_to_html(ws)}
</body>
</html>`;
  return new Blob([html], { type: 'text/html;charset=utf-8;' });
}

/**
 * Triggers a download in the browser without any network request
 */
export function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
