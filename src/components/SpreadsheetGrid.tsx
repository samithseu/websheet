import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import 'x-data-spreadsheet';
import * as XLSX from 'xlsx';
import {
  normalizeSpreadsheetData,
  isFormulaSupportedByGrid,
  autoCloseParentheses,
  isFormulaAwaitingOperand,
  type XSpreadsheetData,
} from '../utils/spreadsheetConverter';
import type { SelectionStats } from './FormulaBar';
import { getSpreadsheetFactory, type XSpreadsheetInstance } from '../types/spreadsheet';
import { calculateAutofitColumnWidth, calculateAutofitAllColumns } from '../utils/columnAutofit';
import type { CellRange } from '../utils/printRenderer';

export interface SpreadsheetGridRef {
  loadData: (data: XSpreadsheetData) => void;
  getData: () => XSpreadsheetData;
  setCellText: (rowIndex: number, colIndex: number, text: string) => void;
  undo: () => void;
  redo: () => void;
  clearCurrentSheet: () => void;
  deleteCurrentSheet: () => void;
  reRender: () => void;
  selectCell: (sheetIndex: number, rowIndex: number, colIndex: number) => void;
  getActiveSheetName: () => string;
  getActiveSheetIndex: () => number;
  selectAll: () => void;
  autofitColumn: (colIndex: number) => void;
  autofitAllColumns: () => void;
  getSelectedRange: () => CellRange | null;
  syncFormulaText: (text: string) => void;
}

interface SpreadsheetGridProps {
  initialData: XSpreadsheetData;
  onDataChange: (data: XSpreadsheetData) => void;
  onActiveCellChange: (coord: string, text: string, rowIndex: number, colIndex: number) => void;
  onSelectionStatsChange: (stats: SelectionStats | null) => void;
  onPrintRequest?: () => void;
  onAllSheetsDeleted?: () => void;
}

export const SpreadsheetGrid = forwardRef<SpreadsheetGridRef, SpreadsheetGridProps>(
  (
    {
      initialData,
      onDataChange,
      onActiveCellChange,
      onSelectionStatsChange,
      onPrintRequest,
      onAllSheetsDeleted,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const spreadsheetInstanceRef = useRef<XSpreadsheetInstance | null>(null);
    const activeCellPosRef = useRef<{ r: number; c: number }>({ r: 0, c: 0 });
    const isAllSelectedRef = useRef(false);
    const selectedRangeRef = useRef<CellRange | null>(null);

    // Initial data captured for mount only (per AGENTS.md)
    const initialDataRef = useRef(initialData);

    // Stable references to callbacks updated outside render
    const onDataChangeRef = useRef(onDataChange);
    const onActiveCellChangeRef = useRef(onActiveCellChange);
    const onSelectionStatsChangeRef = useRef(onSelectionStatsChange);
    const onPrintRequestRef = useRef(onPrintRequest);
    const onAllSheetsDeletedRef = useRef(onAllSheetsDeleted);

    const handleSelectAllRef = useRef<() => void>(() => {});
    const autofitColumnRef = useRef<(colIndex: number) => void>(() => {});
    const autofitAllColumnsRef = useRef<() => void>(() => {});
    const syncFormulaTextRef = useRef<(text: string) => void>(() => {});

    interface FormulaRefSession {
      isActive: boolean;
      targetR: number;
      targetC: number;
      baseText: string;
      hasActiveToken: boolean;
      refRange: CellRange | null;
      dragAnchor: { ri: number; ci: number } | null;
      isDraggingRange: boolean;
      originalText: string;
    }

    const formulaRefSessionRef = useRef<FormulaRefSession>({
      isActive: false,
      targetR: 0,
      targetC: 0,
      baseText: '',
      hasActiveToken: false,
      refRange: null,
      dragAnchor: null,
      isDraggingRange: false,
      originalText: '',
    });

    useEffect(() => {
      onDataChangeRef.current = onDataChange;
      onActiveCellChangeRef.current = onActiveCellChange;
      onSelectionStatsChangeRef.current = onSelectionStatsChange;
      onPrintRequestRef.current = onPrintRequest;
      onAllSheetsDeletedRef.current = onAllSheetsDeleted;
    });

    // Expose handles to parent
    useImperativeHandle(ref, () => ({
      loadData: (data: XSpreadsheetData) => {
        if (spreadsheetInstanceRef.current) {
          try {
            const normalized = normalizeSpreadsheetData(data);
            spreadsheetInstanceRef.current.loadData(normalized);
            selectedRangeRef.current = null;
            const sheetInstance = (spreadsheetInstanceRef.current as any).sheet;
            if (sheetInstance?.print) {
              sheetInstance.print.preview = () => {
                onPrintRequestRef.current?.();
              };
            }
            onDataChangeRef.current(spreadsheetInstanceRef.current.getData());
          } catch (err) {
            console.error('Failed to load data into spreadsheet grid:', err);
          }
        }
      },
      getData: () => {
        if (spreadsheetInstanceRef.current) {
          return spreadsheetInstanceRef.current.getData();
        }
        return initialDataRef.current;
      },
      setCellText: (rowIndex: number, colIndex: number, text: string) => {
        if (spreadsheetInstanceRef.current) {
          const s = spreadsheetInstanceRef.current;
          const cell = s.cell(rowIndex, colIndex);
          if (cell) {
            if (!text.startsWith('=')) {
              delete (cell as any).formula;
            } else if (!isFormulaSupportedByGrid(text)) {
              (cell as any).formula = text.slice(1);
            } else {
              delete (cell as any).formula;
            }
          }
          s.cellText(rowIndex, colIndex, text);
          try {
            s.reRender();
          } catch (err) {
            console.warn('Error during reRender after setCellText:', err);
          }
          onDataChangeRef.current(s.getData());
        }
      },
      undo: () => {
        spreadsheetInstanceRef.current?.sheet?.undo?.();
      },
      redo: () => {
        spreadsheetInstanceRef.current?.sheet?.redo?.();
      },
      clearCurrentSheet: () => {
        if (spreadsheetInstanceRef.current?.sheet?.data?.rows) {
          spreadsheetInstanceRef.current.sheet.data.rows.clear();
          spreadsheetInstanceRef.current.reRender();
          onDataChangeRef.current(spreadsheetInstanceRef.current.getData());
        }
      },
      deleteCurrentSheet: () => {
        const s = spreadsheetInstanceRef.current;
        if (!s) return;
        if (!s.datas || s.datas.length <= 1) {
          onAllSheetsDeletedRef.current?.();
          return;
        }
        if (s.bottombar) {
          s.bottombar.deleteEl = s.bottombar.activeEl;
        }
        s.deleteSheet?.();
      },
      reRender: () => {
        spreadsheetInstanceRef.current?.sheet?.reload?.();
      },
      selectCell: (sheetIndex: number, rowIndex: number, colIndex: number) => {
        const s = spreadsheetInstanceRef.current;
        if (s) {
          // Switch sheet tab if requested
          const bottombar = s.bottombar;
          if (bottombar?.menu?.items) {
            const item = bottombar.menu.items[sheetIndex];
            if (item?.el) {
              item.el.click();
            }
          }

          // Focus cell coordinate
          const cellCoord = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
          const cell = s.cell(rowIndex, colIndex, sheetIndex);
          const text = cell?.text !== undefined ? String(cell.text) : '';
          activeCellPosRef.current = { r: rowIndex, c: colIndex };
          onActiveCellChangeRef.current(cellCoord, text, rowIndex, colIndex);
        }
      },
      getActiveSheetName: () => {
        return spreadsheetInstanceRef.current?.sheet?.data?.name || 'Sheet1';
      },
      getActiveSheetIndex: () => {
        const s = spreadsheetInstanceRef.current;
        if (!s || !s.datas) return 0;
        const currentData = s.sheet?.data;
        const idx = s.datas.findIndex((d) => d === currentData);
        return idx >= 0 ? idx : 0;
      },
      selectAll: () => {
        handleSelectAllRef.current();
      },
      autofitColumn: (colIndex: number) => {
        autofitColumnRef.current(colIndex);
      },
      autofitAllColumns: () => {
        autofitAllColumnsRef.current();
      },
      getSelectedRange: () => {
        return selectedRangeRef.current;
      },
      syncFormulaText: (text: string) => {
        syncFormulaTextRef.current(text);
      },
    }));

    useEffect(() => {
      let cancelled = false;
      const container = containerRef.current;
      if (!container) return;

      container.innerHTML = '';

      const factory = getSpreadsheetFactory();
      if (!factory) {
        console.error('window.x_spreadsheet is not available');
        return;
      }

      const s = factory(container, {
        mode: 'edit',
        showToolbar: true,
        showGrid: true,
        showContextmenu: true,
        showBottomBar: true,
        view: {
          height: () => containerRef.current?.clientHeight || 600,
          width: () => containerRef.current?.clientWidth || 1000,
        },
        row: {
          len: 100,
          height: 26,
        },
        col: {
          len: 26,
          width: 110,
          indexWidth: 60,
          minWidth: 60,
        },
      });

      if (cancelled) {
        container.innerHTML = '';
        return;
      }

      spreadsheetInstanceRef.current = s;

      // Intercept deleteSheet to handle deleting the last sheet or multi-sheet deletion
      if (typeof (s as any).deleteSheet === 'function') {
        const origDeleteSheet = (s as any).deleteSheet.bind(s);
        (s as any).deleteSheet = function () {
          if (!s.datas || s.datas.length <= 1) {
            onAllSheetsDeletedRef.current?.();
            return;
          }
          origDeleteSheet();
          if (s.datas.length === 0) {
            onAllSheetsDeletedRef.current?.();
            return;
          }
          onDataChangeRef.current(s.getData());
        };
      }

      // Reference Highlight Overlay element for interactive formula reference selection
      const overlayerCEl = (container.querySelector('.x-spreadsheet-overlayer-content') ||
        container.querySelector('.x-spreadsheet-overlayer')) as HTMLElement | null;
      const refHighlightEl = document.createElement('div');
      refHighlightEl.className = 'x-spreadsheet-formula-ref-highlight';
      Object.assign(refHighlightEl.style, {
        position: 'absolute',
        border: '2px dashed #2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.09)',
        borderRadius: '3px',
        pointerEvents: 'none',
        zIndex: '11',
        display: 'none',
        boxSizing: 'border-box',
        transition: 'left 0.03s ease-out, top 0.03s ease-out, width 0.03s ease-out, height 0.03s ease-out',
      });
      overlayerCEl?.appendChild(refHighlightEl);

      const updateRefHighlight = (range: CellRange | null) => {
        if (!range) {
          refHighlightEl.style.display = 'none';
          return;
        }
        const currentSheet = (s as any).sheet;
        if (!currentSheet?.data) return;
        const rect = currentSheet.data.getRect(range);
        if (!rect || rect.width <= 0 || rect.height <= 0) {
          refHighlightEl.style.display = 'none';
          return;
        }
        refHighlightEl.style.left = `${rect.left - 0.8}px`;
        refHighlightEl.style.top = `${rect.top - 0.8}px`;
        refHighlightEl.style.width = `${rect.width + 0.8}px`;
        refHighlightEl.style.height = `${rect.height + 0.8}px`;
        refHighlightEl.style.display = 'block';
      };

      const hideRefHighlight = () => {
        refHighlightEl.style.display = 'none';
      };

      // Defensive try-catch around canvas table render & sync reference highlight overlay
      const sheetInstance = (s as any).sheet;
      if (sheetInstance?.table && typeof sheetInstance.table.render === 'function') {
        const origTableRender = sheetInstance.table.render.bind(sheetInstance.table);
        sheetInstance.table.render = function () {
          try {
            origTableRender();
            if (formulaRefSessionRef.current.refRange) {
              updateRefHighlight(formulaRefSessionRef.current.refRange);
            }
          } catch (err) {
            console.warn('Spreadsheet canvas table render error caught safely:', err);
          }
        };
      }

      // Load initial data on mount only (normalized for merges)
      try {
        const normalizedInitial = normalizeSpreadsheetData(initialDataRef.current);
        s.loadData(normalizedInitial);
      } catch (err) {
        console.error('Failed to load initial data in spreadsheet grid:', err);
      }

      // Intercept toolbar printer action to trigger unified PrintDialog
      if (sheetInstance?.print) {
        sheetInstance.print.preview = () => {
          onPrintRequestRef.current?.();
        };
      }

      const printBtn = container.querySelector(
        '.x-spreadsheet-icon .print, .x-spreadsheet-icon-img.print'
      )?.closest('.x-spreadsheet-toolbar-btn') as HTMLElement | null;
      if (printBtn) {
        printBtn.addEventListener(
          'click',
          (e) => {
            e.preventDefault();
            e.stopPropagation();
            onPrintRequestRef.current?.();
          },
          true
        );
      }

      // Wrap editor.setCell to guarantee opaque background and initialize formula session
      const editor = (s as any).sheet?.editor;
      if (editor && typeof editor.setCell === 'function') {
        const origSetCell = editor.setCell.bind(editor);
        editor.setCell = function (cell: any, validator: any) {
          origSetCell(cell, validator);
          const sheet = (s as any).sheet;
          if (sheet?.data?.selector) {
            const { ri, ci } = sheet.data.selector;
            const style = sheet.data.getCellStyleOrDefault(ri, ci);
            const bg = style?.bgcolor || '#ffffff';
            if (editor.textEl?.el) {
              editor.textEl.el.style.backgroundColor = bg;
            }
            if (editor.areaEl?.el) {
              editor.areaEl.el.style.backgroundColor = bg;
            }

            const currentCell = sheet.data.getCell(ri, ci);
            const currentCellText = currentCell?.text !== undefined ? String(currentCell.text) : '';
            const cellFormula = (currentCell as any)?.formula;
            const currentFullText = cellFormula && !currentCellText.startsWith('=')
              ? `=${cellFormula}`
              : (editor.inputText || currentCellText);

            formulaRefSessionRef.current = {
              isActive: currentFullText.startsWith('='),
              targetR: ri,
              targetC: ci,
              baseText: currentFullText,
              hasActiveToken: false,
              refRange: null,
              dragAnchor: null,
              isDraggingRange: false,
              originalText: currentCellText,
            };
            hideRefHighlight();
          }
        };
      }

      // Wrap editor.clear to ensure clean state and hide reference highlight
      if (editor && typeof editor.clear === 'function') {
        const origClear = editor.clear.bind(editor);
        editor.clear = function () {
          hideRefHighlight();
          formulaRefSessionRef.current.isActive = false;
          formulaRefSessionRef.current.hasActiveToken = false;
          formulaRefSessionRef.current.refRange = null;
          formulaRefSessionRef.current.isDraggingRange = false;
          origClear();
        };
      }

      // External sync from FormulaBar input
      syncFormulaTextRef.current = (text: string) => {
        const sheet = (s as any).sheet;
        if (!sheet?.data || !sheet?.editor) return;

        const { r, c } = activeCellPosRef.current;
        const session = formulaRefSessionRef.current;
        session.isActive = text.startsWith('=');
        session.targetR = r;
        session.targetC = c;
        if (!session.hasActiveToken) {
          session.baseText = text;
        }

        if (text.startsWith('=')) {
          const editorEl = container.querySelector('.x-spreadsheet-editor') as HTMLElement | null;
          const isEditing = editorEl && editorEl.style.display !== 'none';
          if (!isEditing) {
            const sOffset = sheet.data.getRect({ sri: r, sci: c, eri: r, eci: c });
            const tOffset = sheet.getTableOffset();
            const sPosition = sOffset.top > tOffset.height / 2 ? 'bottom' : 'top';
            sheet.editor.setOffset(sOffset, sPosition);
            const cell = sheet.data.getCell(r, c) || sheet.data.getSelectedCell();
            sheet.editor.setCell(cell, sheet.data.getSelectedValidator());
          }
          sheet.editor.setText(text);
        }
      };

      // Listen to keystrokes in editor textarea to track operators and argument boundaries
      const handleEditorTextareaInput = () => {
        const currentText = editor?.inputText || '';
        const session = formulaRefSessionRef.current;
        if (currentText.startsWith('=')) {
          session.isActive = true;
          if (isFormulaAwaitingOperand(currentText)) {
            session.baseText = currentText;
            session.hasActiveToken = false;
            hideRefHighlight();
          } else if (!session.hasActiveToken) {
            session.baseText = currentText;
          }
        } else {
          session.isActive = false;
          session.hasActiveToken = false;
          hideRefHighlight();
        }
      };

      editor?.textEl?.el?.addEventListener('input', handleEditorTextareaInput);

      // Wrap selector.set so keyboard arrow navigation into merged cells targets the top-left cell
      const selector = (s as any).sheet?.selector;
      if (selector && typeof selector.set === 'function') {
        const origSelectorSet = selector.set.bind(selector);
        selector.set = function (ri: number, ci: number, indexesUpdated = true) {
          const sheet = (s as any).sheet;
          const merge = sheet?.data?.merges?.getFirstIncludes?.(ri, ci);
          if (merge) {
            origSelectorSet(merge.sri, merge.sci, indexesUpdated);
            return;
          }
          origSelectorSet(ri, ci, indexesUpdated);
        };
      }

      // Top-left "Select All" button (corner above row 1, left of column A)
      const sheetEl = container.querySelector('.x-spreadsheet-sheet') as HTMLElement | null;
      const indexWidth = (s as any).sheet?.data?.cols?.indexWidth || 60;
      const rowHeight = (s as any).sheet?.data?.rows?.height || 26;

      const selectAllBtn = document.createElement('button');
      selectAllBtn.type = 'button';
      selectAllBtn.className = 'x-spreadsheet-select-all-btn';
      selectAllBtn.title = 'Select all cells';
      selectAllBtn.setAttribute('aria-label', 'Select all cells');
      Object.assign(selectAllBtn.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: `${indexWidth}px`,
        height: `${rowHeight}px`,
        zIndex: '12',
        backgroundColor: '#f4f5f8',
        borderRight: '1px solid #e6e6e6',
        borderBottom: '1px solid #e6e6e6',
        borderTop: 'none',
        borderLeft: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        padding: '0 4px 4px 0',
        outline: 'none',
        transition: 'background-color 0.15s ease, border-color 0.15s ease',
      });

      selectAllBtn.innerHTML = `
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg" style="pointer-events: none;">
          <polygon points="8,0 8,8 0,8" fill="#94a3b8" />
        </svg>
      `;

      const updateSelectAllBtnVisual = () => {
        const poly = selectAllBtn.querySelector('polygon');
        if (isAllSelectedRef.current) {
          selectAllBtn.style.backgroundColor = '#dbeafe';
          selectAllBtn.style.borderRightColor = '#93c5fd';
          selectAllBtn.style.borderBottomColor = '#93c5fd';
          if (poly) poly.setAttribute('fill', '#2563eb');
        } else {
          selectAllBtn.style.backgroundColor = '#f4f5f8';
          selectAllBtn.style.borderRightColor = '#e6e6e6';
          selectAllBtn.style.borderBottomColor = '#e6e6e6';
          if (poly) poly.setAttribute('fill', '#94a3b8');
        }
      };

      const updateSelectAllBtnPosition = () => {
        const iw = (s as any).sheet?.data?.cols?.indexWidth || 60;
        const rh = (s as any).sheet?.data?.rows?.height || 26;
        selectAllBtn.style.width = `${iw}px`;
        selectAllBtn.style.height = `${rh}px`;
      };

      selectAllBtn.addEventListener('mouseenter', () => {
        if (!isAllSelectedRef.current) {
          selectAllBtn.style.backgroundColor = '#e2e8f0';
        }
      });

      selectAllBtn.addEventListener('mouseleave', () => {
        if (!isAllSelectedRef.current) {
          selectAllBtn.style.backgroundColor = '#f4f5f8';
        }
      });

      const handleSelectAll = () => {
        const sheet = (s as any).sheet;
        if (!sheet?.data || !sheet?.selector) return;
        const { data, selector, table, toolbar } = sheet;

        selector.set(-1, -1);
        sheet.trigger('cells-selected', data.getCell(0, 0), selector.range);
        toolbar?.reset?.();
        table.render();

        isAllSelectedRef.current = true;
        updateSelectAllBtnVisual();

        selectedRangeRef.current = { sri: 0, sci: 0, eri: data.rows.len - 1, eci: data.cols.len - 1 };

        const startCoord = XLSX.utils.encode_cell({ r: 0, c: 0 });
        const endCoord = XLSX.utils.encode_cell({ r: data.rows.len - 1, c: data.cols.len - 1 });
        const rangeCoord = `${startCoord}:${endCoord}`;
        const firstCell = data.getCell(0, 0);
        const text = firstCell?.text !== undefined ? String(firstCell.text) : '';
        onActiveCellChangeRef.current(rangeCoord, text, 0, 0);
      };

      selectAllBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleSelectAll();
      });

      sheetEl?.appendChild(selectAllBtn);

      // Auto-fit helper implementations
      const autofitColumnIndex = (colIndex: number) => {
        const sheet = (s as any).sheet;
        if (!sheet?.data) return;
        const newWidth = calculateAutofitColumnWidth(sheet.data, colIndex);
        sheet.data.changeData(() => {
          sheet.data.cols.setWidth(colIndex, newWidth);
        });
        sheet.reload();
        sheet.colResizer?.hide();
        onDataChangeRef.current(s.getData());
      };

      const autofitAllColumns = () => {
        const sheet = (s as any).sheet;
        if (!sheet?.data) return;
        const colWidths = calculateAutofitAllColumns(sheet.data);
        sheet.data.changeData(() => {
          for (const [ci, width] of colWidths.entries()) {
            sheet.data.cols.setWidth(ci, width);
          }
        });
        sheet.reload();
        sheet.colResizer?.hide();
        onDataChangeRef.current(s.getData());
      };

      handleSelectAllRef.current = handleSelectAll;
      autofitColumnRef.current = autofitColumnIndex;
      autofitAllColumnsRef.current = autofitAllColumns;

      // Bind change handler
      s.change((data: any) => {
        onDataChangeRef.current(data);

        // Update active cell text if changed
        const { r, c } = activeCellPosRef.current;
        const currentSheetData = s.cell(r, c);
        const cellFormula = (currentSheetData as any)?.formula;
        const cellRawText = currentSheetData?.text !== undefined ? String(currentSheetData.text) : '';
        const text = cellFormula && !cellRawText.startsWith('=') ? `=${cellFormula}` : cellRawText;
        const coord = XLSX.utils.encode_cell({ r, c });
        onActiveCellChangeRef.current(coord, text, r, c);
      });

      // Bind cell selected
      s.on('cell-selected', (cell: any, ri: number, ci: number) => {
        isAllSelectedRef.current = false;
        updateSelectAllBtnVisual();
        const sheet = (s as any).sheet;
        const merge = sheet?.data?.merges?.getFirstIncludes?.(ri, ci);
        const targetR = merge ? merge.sri : ri;
        const targetC = merge ? merge.sci : ci;
        const targetCell = sheet?.data?.getCell?.(targetR, targetC) || cell;
        activeCellPosRef.current = { r: targetR, c: targetC };
        selectedRangeRef.current = merge
          ? { sri: merge.sri, sci: merge.sci, eri: merge.eri, eci: merge.eci }
          : { sri: targetR, sci: targetC, eri: targetR, eci: targetC };
        const coord = merge
          ? `${XLSX.utils.encode_cell({ r: merge.sri, c: merge.sci })}:${XLSX.utils.encode_cell({ r: merge.eri, c: merge.eci })}`
          : XLSX.utils.encode_cell({ r: targetR, c: targetC });
        const targetFormula = (targetCell as any)?.formula;
        const targetRawText = targetCell?.text !== undefined ? String(targetCell.text) : '';
        const text = targetFormula && !targetRawText.startsWith('=') ? `=${targetFormula}` : targetRawText;
        onActiveCellChangeRef.current(coord, text, targetR, targetC);
        onSelectionStatsChangeRef.current(null);
      });

      // Bind multiple cells selected for stats
      s.on('cells-selected', (_cell: any, { sri, sci, eri, eci }: any) => {
        const totalRows = (s as any).sheet?.data?.rows?.len || 100;
        const totalCols = (s as any).sheet?.data?.cols?.len || 26;
        isAllSelectedRef.current = sri === 0 && sci === 0 && eri >= totalRows - 1 && eci >= totalCols - 1;
        updateSelectAllBtnVisual();

        selectedRangeRef.current = { sri, sci, eri, eci };

        const startCoord = XLSX.utils.encode_cell({ r: sri, c: sci });
        const endCoord = XLSX.utils.encode_cell({ r: eri, c: eci });
        const rangeCoord = startCoord === endCoord ? startCoord : `${startCoord}:${endCoord}`;

        const activeCell = s.cell(sri, sci);
        const activeFormula = (activeCell as any)?.formula;
        const activeRawText = activeCell?.text !== undefined ? String(activeCell.text) : '';
        const text = activeFormula && !activeRawText.startsWith('=') ? `=${activeFormula}` : activeRawText;
        onActiveCellChangeRef.current(rangeCoord, text, sri, sci);

        // Calculate selection stats
        let count = 0;
        let numericCount = 0;
        let sum = 0;
        let min = Infinity;
        let max = -Infinity;

        for (let r = sri; r <= eri; r++) {
          for (let c = sci; c <= eci; c++) {
            count++;
            const cObj = s.cell(r, c);
            if (cObj && cObj.text !== undefined && cObj.text !== '') {
              const val = Number(cObj.text);
              if (!isNaN(val)) {
                numericCount++;
                sum += val;
                if (val < min) min = val;
                if (val > max) max = val;
              }
            }
          }
        }

        if (count > 1) {
          onSelectionStatsChangeRef.current({
            count,
            numericCount,
            sum,
            avg: numericCount > 0 ? sum / numericCount : 0,
            min: numericCount > 0 ? min : 0,
            max: numericCount > 0 ? max : 0,
          });
        } else {
          onSelectionStatsChangeRef.current(null);
        }
      });

      // Bind cell edited
      s.on('cell-edited', (text: string, ri: number, ci: number) => {
        const cell = s.cell(ri, ci);
        if (cell) {
          if (!text.startsWith('=')) {
            delete (cell as any).formula;
          } else if (!isFormulaSupportedByGrid(text)) {
            (cell as any).formula = text.slice(1);
          } else {
            delete (cell as any).formula;
          }
        }
        activeCellPosRef.current = { r: ri, c: ci };
        const coord = XLSX.utils.encode_cell({ r: ri, c: ci });
        onActiveCellChangeRef.current(coord, text, ri, ci);
      });

      // Resize observer to adapt spreadsheet canvas
      const handleResize = () => {
        updateSelectAllBtnPosition();
        s.sheet?.reload?.();
      };

      const resizeObserver = new ResizeObserver(() => {
        handleResize();
      });

      resizeObserver.observe(container);
      window.addEventListener('resize', handleResize);

      // Edge-detection auto-scroll when dragging selection or autofill handle
      let isDragging = false;
      let lastClientX = 0;
      let lastClientY = 0;
      let scrollSpeedX = 0;
      let scrollSpeedY = 0;
      let rafId: number | null = null;

      const stopAutoScroll = () => {
        isDragging = false;
        scrollSpeedX = 0;
        scrollSpeedY = 0;
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      };

      const autoScrollTick = () => {
        if (!isDragging) return;
        const overlayer = container.querySelector('.x-spreadsheet-overlayer') as HTMLElement | null;
        const vs = (s.sheet as any)?.verticalScrollbar;
        const hs = (s.sheet as any)?.horizontalScrollbar;
        let didScroll = false;

        if (scrollSpeedY !== 0 && vs && typeof vs.scroll === 'function' && typeof vs.move === 'function') {
          const { top } = vs.scroll();
          const newTop = Math.max(0, top + scrollSpeedY);
          if (newTop !== top) {
            vs.move({ top: newTop });
            didScroll = true;
          }
        }

        if (scrollSpeedX !== 0 && hs && typeof hs.scroll === 'function' && typeof hs.move === 'function') {
          const { left } = hs.scroll();
          const newLeft = Math.max(0, left + scrollSpeedX);
          if (newLeft !== left) {
            hs.move({ left: newLeft });
            didScroll = true;
          }
        }

        if (didScroll && overlayer) {
          overlayer.dispatchEvent(
            new MouseEvent('mousemove', {
              bubbles: true,
              cancelable: true,
              clientX: lastClientX,
              clientY: lastClientY,
              buttons: 1,
            })
          );
        }

        if (isDragging && (scrollSpeedX !== 0 || scrollSpeedY !== 0)) {
          rafId = requestAnimationFrame(autoScrollTick);
        } else {
          rafId = null;
        }
      };

      const handleWindowMouseMove = (e: MouseEvent) => {
        if (!isDragging || e.buttons !== 1) {
          if (isDragging) stopAutoScroll();
          return;
        }

        lastClientX = e.clientX;
        lastClientY = e.clientY;

        const overlayer = container.querySelector('.x-spreadsheet-overlayer') as HTMLElement | null;
        if (!overlayer) return;

        const rect = overlayer.getBoundingClientRect();
        const EDGE_THRESHOLD = 36;
        let newSpeedX = 0;
        let newSpeedY = 0;

        if (e.clientY > rect.bottom - EDGE_THRESHOLD) {
          const dist = Math.max(1, e.clientY - (rect.bottom - EDGE_THRESHOLD));
          newSpeedY = Math.min(30, Math.max(5, Math.round(dist * 0.6)));
        } else if (e.clientY < rect.top + EDGE_THRESHOLD) {
          const dist = Math.max(1, (rect.top + EDGE_THRESHOLD) - e.clientY);
          newSpeedY = -Math.min(30, Math.max(5, Math.round(dist * 0.6)));
        }

        if (e.clientX > rect.right - EDGE_THRESHOLD) {
          const dist = Math.max(1, e.clientX - (rect.right - EDGE_THRESHOLD));
          newSpeedX = Math.min(35, Math.max(5, Math.round(dist * 0.6)));
        } else if (e.clientX < rect.left + EDGE_THRESHOLD) {
          const dist = Math.max(1, (rect.left + EDGE_THRESHOLD) - e.clientX);
          newSpeedX = -Math.min(35, Math.max(5, Math.round(dist * 0.6)));
        }

        scrollSpeedX = newSpeedX;
        scrollSpeedY = newSpeedY;

        if ((scrollSpeedX !== 0 || scrollSpeedY !== 0) && rafId === null) {
          rafId = requestAnimationFrame(autoScrollTick);
        }
      };

      const handleWindowMouseUp = () => {
        stopAutoScroll();
      };

      const handleContainerMouseDown = (e: MouseEvent) => {
        if (e.buttons !== 1) return;
        const target = e.target as HTMLElement | null;
        if (!target) return;

        // Check if drag started on overlayer, autofill handle, or table cell
        const isCanvasArea = target.closest('.x-spreadsheet-overlayer') ||
          target.closest('.x-spreadsheet-table') ||
          target.classList.contains('x-spreadsheet-selector-corner') ||
          target.closest('.x-spreadsheet-selector');

        if (isCanvasArea) {
          isDragging = true;
          lastClientX = e.clientX;
          lastClientY = e.clientY;
        }
      };

      // Detect column border index for auto-fit interactions
      const getColumnBorderIndex = (evt: MouseEvent): number | null => {
        const sheet = (s as any).sheet;
        if (!sheet?.data) return null;
        const target = evt.target as HTMLElement | null;

        // 1. Direct hit on colResizer hover or line element
        if (target?.closest('.x-spreadsheet-resizer.vertical')) {
          const ci = sheet.colResizer?.cRect?.ci;
          if (typeof ci === 'number' && ci >= 0) return ci;
        }

        // 2. Hit on overlayer in the column header row
        const overlayer = container.querySelector('.x-spreadsheet-overlayer') as HTMLElement | null;
        if (overlayer && (target === overlayer || overlayer.contains(target))) {
          const rect = overlayer.getBoundingClientRect();
          const offsetX = evt.clientX - rect.left;
          const offsetY = evt.clientY - rect.top;
          const rowHeight = sheet.data.rows?.height || 26;
          if (offsetY >= 0 && offsetY <= rowHeight) {
            const cRect = sheet.data.getCellRectByXY(offsetX, offsetY);
            if (cRect.ri === -1 && cRect.ci >= 0) {
              // Right edge of column cRect.ci (within 7px)
              const rightEdge = cRect.left + cRect.width;
              if (Math.abs(offsetX - rightEdge) <= 7) {
                return cRect.ci;
              }
              // Left edge of column cRect.ci (within 5px) = right edge of column cRect.ci - 1
              if (cRect.ci > 0 && Math.abs(offsetX - cRect.left) <= 5) {
                return cRect.ci - 1;
              }
            }
          }
        }

        return null;
      };

      let borderMouseDownTime = 0;
      let borderMouseDownX = 0;
      let borderMouseDownY = 0;
      let borderTargetCol: number | null = null;
      let lastBorderClickTime = 0;
      let lastBorderClickCol: number | null = null;

      const handleBorderMouseDown = (e: MouseEvent) => {
        if (e.button !== 0) return;
        const colIndex = getColumnBorderIndex(e);
        if (colIndex !== null) {
          borderMouseDownTime = Date.now();
          borderMouseDownX = e.clientX;
          borderMouseDownY = e.clientY;
          borderTargetCol = colIndex;
        } else {
          borderTargetCol = null;
        }
      };

      const handleBorderMouseUp = (e: MouseEvent) => {
        if (borderTargetCol === null) return;
        const colIndex = borderTargetCol;
        borderTargetCol = null;

        const duration = Date.now() - borderMouseDownTime;
        const dist = Math.hypot(e.clientX - borderMouseDownX, e.clientY - borderMouseDownY);

        // Discard drag gestures (manual column width resize)
        if (duration > 400 || dist > 4) return;

        const now = Date.now();
        const isDoubleClick = (now - lastBorderClickTime < 450) && (lastBorderClickCol === colIndex);

        lastBorderClickTime = now;
        lastBorderClickCol = colIndex;

        if (isAllSelectedRef.current) {
          // When all cells are selected: either a single click or double click resizes all columns
          autofitAllColumns();
        } else if (isDoubleClick) {
          // Double clicking on a column's right border resizes that column
          autofitColumnIndex(colIndex);
        }
      };

      const handleBorderDblClick = (e: MouseEvent) => {
        if (e.button !== 0) return;
        const colIndex = getColumnBorderIndex(e);
        if (colIndex !== null) {
          if (isAllSelectedRef.current) {
            autofitAllColumns();
          } else {
            autofitColumnIndex(colIndex);
          }
        }
      };

      container.addEventListener('mousedown', handleBorderMouseDown, true);
      window.addEventListener('mouseup', handleBorderMouseUp, true);
      container.addEventListener('dblclick', handleBorderDblClick, true);

      container.addEventListener('mousedown', handleContainerMouseDown);
      window.addEventListener('mousemove', handleWindowMouseMove);
      window.addEventListener('mouseup', handleWindowMouseUp);

      // Formula Reference Point-and-Click Interception
      const handleFormulaCaptureMouseDown = (e: MouseEvent) => {
        if (e.button !== 0) return;
        if (document.querySelector('dialog[open]')) return;

        const sheet = (s as any).sheet;
        if (!sheet?.data || !sheet?.editor) return;

        const editorEl = container.querySelector('.x-spreadsheet-editor') as HTMLElement | null;
        const isEditorVisible = editorEl && editorEl.style.display !== 'none';

        // Allow clicking inside editor textarea itself for cursor placement / selection
        if (editorEl && editorEl.contains(e.target as Node)) {
          return;
        }

        // Allow clicking toolbar, bottombar, scrollbars, and resizers
        const target = e.target as HTMLElement | null;
        if (target?.closest('.x-spreadsheet-toolbar, .x-spreadsheet-bottombar, .x-spreadsheet-scrollbar, .x-spreadsheet-resizer')) {
          return;
        }

        const session = formulaRefSessionRef.current;
        const currentText = sheet.editor.inputText || '';

        const isEditingFormula = (isEditorVisible && currentText.startsWith('=')) || session.isActive;
        if (!isEditingFormula) {
          return;
        }

        // Check if formula is awaiting an operand or replacing active reference token
        const awaiting = isFormulaAwaitingOperand(currentText);
        if (!awaiting && !session.hasActiveToken) {
          return;
        }

        const overlayer = container.querySelector('.x-spreadsheet-overlayer') as HTMLElement | null;
        if (!overlayer) return;

        const rect = overlayer.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        const rowHeight = sheet.data.rows?.height || 26;
        const indexWidth = sheet.data.cols?.indexWidth || 60;

        // Ignore clicks on header areas
        if (offsetY <= rowHeight || offsetX <= indexWidth) {
          return;
        }

        const cellRect = sheet.data.getCellRectByXY(offsetX, offsetY);
        const { ri, ci } = cellRect;
        if (ri < 0 || ci < 0) return;

        // If clicking the cell currently being edited, allow focus without self-referencing
        if (ri === session.targetR && ci === session.targetC) {
          return;
        }

        // Intercept event to prevent editor.clear() and keep target cell active!
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        // Ensure editor is visible on target cell
        if (!isEditorVisible && sheet.data) {
          const sOffset = sheet.data.getRect({
            sri: session.targetR,
            sci: session.targetC,
            eri: session.targetR,
            eci: session.targetC,
          });
          const tOffset = sheet.getTableOffset();
          const sPosition = sOffset.top > tOffset.height / 2 ? 'bottom' : 'top';
          sheet.editor.setOffset(sOffset, sPosition);
          const cell = sheet.data.getCell(session.targetR, session.targetC) || sheet.data.getSelectedCell();
          sheet.editor.setCell(cell, sheet.data.getSelectedValidator());
        }

        const merge = sheet.data.merges?.getFirstIncludes?.(ri, ci);
        const sri = merge ? merge.sri : ri;
        const sci = merge ? merge.sci : ci;
        const eri = merge ? merge.eri : ri;
        const eci = merge ? merge.eci : ci;

        // Shift+Click range extension: if user previously selected a reference and now shift-clicks
        if (e.shiftKey && session.hasActiveToken && session.refRange) {
          const anchor = session.dragAnchor || { ri: session.refRange.sri, ci: session.refRange.sci };
          const curSri = Math.min(anchor.ri, sri);
          const curSci = Math.min(anchor.ci, sci);
          const curEri = Math.max(anchor.ri, eri);
          const curEci = Math.max(anchor.ci, eci);

          const rangeCoord = (curSri === curEri && curSci === curEci)
            ? XLSX.utils.encode_cell({ r: curSri, c: curSci })
            : `${XLSX.utils.encode_cell({ r: curSri, c: curSci })}:${XLSX.utils.encode_cell({ r: curEri, c: curEci })}`;

          const updatedFormula = session.baseText + rangeCoord;
          sheet.editor.setText(updatedFormula);

          session.refRange = { sri: curSri, sci: curSci, eri: curEri, eci: curEci };
          updateRefHighlight(session.refRange);

          const targetCoord = XLSX.utils.encode_cell({ r: session.targetR, c: session.targetC });
          onActiveCellChangeRef.current(targetCoord, updatedFormula, session.targetR, session.targetC);
          return;
        }

        if (!session.hasActiveToken) {
          session.baseText = currentText;
        }

        const refCoord = (sri === eri && sci === eci)
          ? XLSX.utils.encode_cell({ r: sri, c: sci })
          : `${XLSX.utils.encode_cell({ r: sri, c: sci })}:${XLSX.utils.encode_cell({ r: eri, c: eci })}`;

        const newFormula = session.baseText + refCoord;
        sheet.editor.setText(newFormula);

        session.hasActiveToken = true;
        session.refRange = { sri, sci, eri, eci };
        session.dragAnchor = { ri, ci };
        session.isDraggingRange = true;

        updateRefHighlight({ sri, sci, eri, eci });

        const targetCoord = XLSX.utils.encode_cell({ r: session.targetR, c: session.targetC });
        onActiveCellChangeRef.current(targetCoord, newFormula, session.targetR, session.targetC);

        const handleDragMouseMove = (moveEvt: MouseEvent) => {
          if (!session.isDraggingRange || moveEvt.buttons !== 1) {
            handleDragMouseUp();
            return;
          }
          const moveOffsetX = moveEvt.clientX - rect.left;
          const moveOffsetY = moveEvt.clientY - rect.top;
          const curCellRect = sheet.data.getCellRectByXY(moveOffsetX, moveOffsetY);
          if (curCellRect.ri < 0 || curCellRect.ci < 0) return;

          const anchor = session.dragAnchor;
          if (!anchor) return;

          const curSri = Math.min(anchor.ri, curCellRect.ri);
          const curSci = Math.min(anchor.ci, curCellRect.ci);
          const curEri = Math.max(anchor.ri, curCellRect.ri);
          const curEci = Math.max(anchor.ci, curCellRect.ci);

          const rangeCoord = (curSri === curEri && curSci === curEci)
            ? XLSX.utils.encode_cell({ r: curSri, c: curSci })
            : `${XLSX.utils.encode_cell({ r: curSri, c: curSci })}:${XLSX.utils.encode_cell({ r: curEri, c: curEci })}`;

          const updatedFormula = session.baseText + rangeCoord;
          sheet.editor.setText(updatedFormula);

          session.refRange = { sri: curSri, sci: curSci, eri: curEri, eci: curEci };
          updateRefHighlight(session.refRange);

          onActiveCellChangeRef.current(targetCoord, updatedFormula, session.targetR, session.targetC);
        };

        const handleDragMouseUp = () => {
          session.isDraggingRange = false;
          window.removeEventListener('mousemove', handleDragMouseMove, true);
          window.removeEventListener('mouseup', handleDragMouseUp, true);

          if (sheet.editor?.textEl?.el) {
            sheet.editor.textEl.el.focus();
          }
        };

        window.addEventListener('mousemove', handleDragMouseMove, true);
        window.addEventListener('mouseup', handleDragMouseUp, true);
      };

      const handleFormulaKeyDownCapture = (e: KeyboardEvent) => {
        if (e.isComposing) return;
        if (document.querySelector('dialog[open]')) return;

        const sheet = (s as any).sheet;
        const ed = sheet?.editor;
        const editorEl = container.querySelector('.x-spreadsheet-editor') as HTMLElement | null;
        const isEditing = editorEl && editorEl.style.display !== 'none';

        if (!isEditing || !ed) return;

        const currentText = ed.inputText || '';
        const session = formulaRefSessionRef.current;

        if ((e.key === 'Enter' || e.key === 'Tab') && !e.ctrlKey && !e.altKey && !e.metaKey) {
          if (currentText.startsWith('=')) {
            const closed = autoCloseParentheses(currentText);
            if (closed !== currentText) {
              ed.setText(closed);
            }
            hideRefHighlight();
            session.isActive = false;
            session.hasActiveToken = false;
            session.refRange = null;
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          hideRefHighlight();
          session.isActive = false;
          session.hasActiveToken = false;
          session.refRange = null;
          ed.setText(session.originalText);
          ed.clear();
          sheet.table?.render?.();
        }
      };

      container.addEventListener('mousedown', handleFormulaCaptureMouseDown, true);
      window.addEventListener('keydown', handleFormulaKeyDownCapture, true);

      // Instant cell editing when Enter is pressed on a selected cell
      const handleGridKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'Enter' || e.shiftKey || e.ctrlKey || e.altKey || e.metaKey || e.isComposing) {
          return;
        }

        // Do not intercept if any modal dialog is currently open
        if (document.querySelector('dialog[open]')) return;

        const activeEl = document.activeElement;
        const sheet = (s as any).sheet;
        const isInsideGrid = container.contains(activeEl) || activeEl === document.body;
        if (!isInsideGrid && !sheet?.focusing) return;

        // If focus is on an input or textarea outside the grid (e.g. FormulaBar, Header filename), do not intercept
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
          if (!container.contains(activeEl)) return;
        }

        // Check if cell editor is already visible/active
        const editorEl = container.querySelector('.x-spreadsheet-editor') as HTMLElement | null;
        const isEditing = editorEl && editorEl.style.display !== 'none';

        // If user is already editing the cell, allow Enter to commit and advance down
        if (isEditing) return;

        // If user pressed Enter on a selected cell, enter edit mode instantly
        e.preventDefault();
        e.stopPropagation();

        if (sheet && sheet.editor && sheet.data) {
          if (sheet.data.settings?.mode === 'read') return;
          const { ri, ci } = sheet.data.selector;
          const merge = sheet.data.merges?.getFirstIncludes?.(ri, ci);
          const targetR = merge ? merge.sri : ri;
          const targetC = merge ? merge.sci : ci;

          // Ensure selector indexes are synced to the top-left of the merge
          if (merge && (sheet.data.selector.ri !== targetR || sheet.data.selector.ci !== targetC)) {
            sheet.data.selector.setIndexes(targetR, targetC);
            if (sheet.selector) sheet.selector.indexes = [targetR, targetC];
          }

          const sOffset = sheet.data.getSelectedRect();
          const tOffset = sheet.getTableOffset();
          const sPosition = sOffset.top > tOffset.height / 2 ? 'bottom' : 'top';
          sheet.editor.setOffset(sOffset, sPosition);
          const cell = sheet.data.getCell(targetR, targetC) || sheet.data.getSelectedCell();
          sheet.editor.setCell(cell, sheet.data.getSelectedValidator());
          sheet.clearClipboard?.();
        }
      };

      window.addEventListener('keydown', handleGridKeyDown, true);

      return () => {
        cancelled = true;
        stopAutoScroll();
        window.removeEventListener('keydown', handleFormulaKeyDownCapture, true);
        container.removeEventListener('mousedown', handleFormulaCaptureMouseDown, true);
        editor?.textEl?.el?.removeEventListener('input', handleEditorTextareaInput);
        if (refHighlightEl.parentNode) {
          refHighlightEl.parentNode.removeChild(refHighlightEl);
        }
        window.removeEventListener('keydown', handleGridKeyDown, true);
        container.removeEventListener('mousedown', handleBorderMouseDown, true);
        window.removeEventListener('mouseup', handleBorderMouseUp, true);
        container.removeEventListener('dblclick', handleBorderDblClick, true);
        container.removeEventListener('mousedown', handleContainerMouseDown);
        window.removeEventListener('mousemove', handleWindowMouseMove);
        window.removeEventListener('mouseup', handleWindowMouseUp);
        resizeObserver.disconnect();
        window.removeEventListener('resize', handleResize);
        if (container) {
          container.innerHTML = '';
        }
        spreadsheetInstanceRef.current = null;
      };
    }, []);

    return (
      <div
        ref={containerRef}
        className="w-full flex-1 overflow-hidden relative bg-white"
        style={{ minHeight: 0 }}
      />
    );
  }
);

SpreadsheetGrid.displayName = 'SpreadsheetGrid';
