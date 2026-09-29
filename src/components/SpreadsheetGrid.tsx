import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import 'x-data-spreadsheet';
import * as XLSX from 'xlsx';
import type { XSpreadsheetData } from '../utils/spreadsheetConverter';
import type { SelectionStats } from './FormulaBar';
import { getSpreadsheetFactory, type XSpreadsheetInstance } from '../types/spreadsheet';
import { calculateAutofitColumnWidth, calculateAutofitAllColumns } from '../utils/columnAutofit';

export interface SpreadsheetGridRef {
  loadData: (data: XSpreadsheetData) => void;
  getData: () => XSpreadsheetData;
  setCellText: (rowIndex: number, colIndex: number, text: string) => void;
  undo: () => void;
  redo: () => void;
  clearCurrentSheet: () => void;
  reRender: () => void;
  selectCell: (sheetIndex: number, rowIndex: number, colIndex: number) => void;
  getActiveSheetName: () => string;
  getActiveSheetIndex: () => number;
  selectAll: () => void;
  autofitColumn: (colIndex: number) => void;
  autofitAllColumns: () => void;
}

interface SpreadsheetGridProps {
  initialData: XSpreadsheetData;
  onDataChange: (data: XSpreadsheetData) => void;
  onActiveCellChange: (coord: string, text: string, rowIndex: number, colIndex: number) => void;
  onSelectionStatsChange: (stats: SelectionStats | null) => void;
}

export const SpreadsheetGrid = forwardRef<SpreadsheetGridRef, SpreadsheetGridProps>(
  (
    {
      initialData,
      onDataChange,
      onActiveCellChange,
      onSelectionStatsChange,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const spreadsheetInstanceRef = useRef<XSpreadsheetInstance | null>(null);
    const activeCellPosRef = useRef<{ r: number; c: number }>({ r: 0, c: 0 });
    const isAllSelectedRef = useRef(false);

    // Initial data captured for mount only (per AGENTS.md)
    const initialDataRef = useRef(initialData);

    // Stable references to callbacks updated outside render
    const onDataChangeRef = useRef(onDataChange);
    const onActiveCellChangeRef = useRef(onActiveCellChange);
    const onSelectionStatsChangeRef = useRef(onSelectionStatsChange);

    const handleSelectAllRef = useRef<() => void>(() => {});
    const autofitColumnRef = useRef<(colIndex: number) => void>(() => {});
    const autofitAllColumnsRef = useRef<() => void>(() => {});

    useEffect(() => {
      onDataChangeRef.current = onDataChange;
      onActiveCellChangeRef.current = onActiveCellChange;
      onSelectionStatsChangeRef.current = onSelectionStatsChange;
    });

    // Expose handles to parent
    useImperativeHandle(ref, () => ({
      loadData: (data: XSpreadsheetData) => {
        if (spreadsheetInstanceRef.current) {
          spreadsheetInstanceRef.current.loadData(data);
          onDataChangeRef.current(spreadsheetInstanceRef.current.getData());
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
          spreadsheetInstanceRef.current.cellText(rowIndex, colIndex, text);
          spreadsheetInstanceRef.current.reRender();
          onDataChangeRef.current(spreadsheetInstanceRef.current.getData());
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

      // Load initial data on mount only
      s.loadData(initialDataRef.current);

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
        const text = currentSheetData?.text !== undefined ? String(currentSheetData.text) : '';
        const coord = XLSX.utils.encode_cell({ r, c });
        onActiveCellChangeRef.current(coord, text, r, c);
      });

      // Bind cell selected
      s.on('cell-selected', (cell: any, ri: number, ci: number) => {
        isAllSelectedRef.current = false;
        updateSelectAllBtnVisual();
        activeCellPosRef.current = { r: ri, c: ci };
        const coord = XLSX.utils.encode_cell({ r: ri, c: ci });
        const text = cell?.text !== undefined ? String(cell.text) : '';
        onActiveCellChangeRef.current(coord, text, ri, ci);
        onSelectionStatsChangeRef.current(null);
      });

      // Bind multiple cells selected for stats
      s.on('cells-selected', (_cell: any, { sri, sci, eri, eci }: any) => {
        const totalRows = (s as any).sheet?.data?.rows?.len || 100;
        const totalCols = (s as any).sheet?.data?.cols?.len || 26;
        isAllSelectedRef.current = sri === 0 && sci === 0 && eri >= totalRows - 1 && eci >= totalCols - 1;
        updateSelectAllBtnVisual();

        const startCoord = XLSX.utils.encode_cell({ r: sri, c: sci });
        const endCoord = XLSX.utils.encode_cell({ r: eri, c: eci });
        const rangeCoord = startCoord === endCoord ? startCoord : `${startCoord}:${endCoord}`;

        const activeCell = s.cell(sri, sci);
        const text = activeCell?.text !== undefined ? String(activeCell.text) : '';
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

      return () => {
        cancelled = true;
        stopAutoScroll();
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
