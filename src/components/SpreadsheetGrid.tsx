import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import 'x-data-spreadsheet';
import * as XLSX from 'xlsx';
import type { XSpreadsheetData } from '../utils/spreadsheetConverter';
import type { SelectionStats } from './FormulaBar';
import { getSpreadsheetFactory, type XSpreadsheetInstance } from '../types/spreadsheet';

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

    // Initial data captured for mount only (per AGENTS.md)
    const initialDataRef = useRef(initialData);

    // Stable references to callbacks updated outside render
    const onDataChangeRef = useRef(onDataChange);
    const onActiveCellChangeRef = useRef(onActiveCellChange);
    const onSelectionStatsChangeRef = useRef(onSelectionStatsChange);

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
        activeCellPosRef.current = { r: ri, c: ci };
        const coord = XLSX.utils.encode_cell({ r: ri, c: ci });
        const text = cell?.text !== undefined ? String(cell.text) : '';
        onActiveCellChangeRef.current(coord, text, ri, ci);
        onSelectionStatsChangeRef.current(null);
      });

      // Bind multiple cells selected for stats
      s.on('cells-selected', (_cell: any, { sri, sci, eri, eci }: any) => {
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
        s.sheet?.reload?.();
      };

      const resizeObserver = new ResizeObserver(() => {
        handleResize();
      });

      resizeObserver.observe(container);
      window.addEventListener('resize', handleResize);

      return () => {
        cancelled = true;
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
