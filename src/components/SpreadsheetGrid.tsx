import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import 'x-data-spreadsheet';
import * as XLSX from 'xlsx';
import type { XSpreadsheetData } from '../utils/spreadsheetConverter';
import type { SelectionStats } from './FormulaBar';

export interface SpreadsheetGridRef {
  loadData: (data: XSpreadsheetData) => void;
  getData: () => XSpreadsheetData;
  setCellText: (rowIndex: number, colIndex: number, text: string) => void;
  undo: () => void;
  redo: () => void;
  clearCurrentSheet: () => void;
  reRender: () => void;
  selectCell: (sheetIndex: number, rowIndex: number, colIndex: number) => void;
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
    const spreadsheetInstanceRef = useRef<any>(null);
    const activeCellPosRef = useRef<{ r: number; c: number }>({ r: 0, c: 0 });

    // Expose handles to parent
    useImperativeHandle(ref, () => ({
      loadData: (data: XSpreadsheetData) => {
        if (spreadsheetInstanceRef.current) {
          spreadsheetInstanceRef.current.loadData(data);
          onDataChange(spreadsheetInstanceRef.current.getData());
        }
      },
      getData: () => {
        if (spreadsheetInstanceRef.current) {
          return spreadsheetInstanceRef.current.getData() as XSpreadsheetData;
        }
        return initialData;
      },
      setCellText: (rowIndex: number, colIndex: number, text: string) => {
        if (spreadsheetInstanceRef.current) {
          spreadsheetInstanceRef.current.cellText(rowIndex, colIndex, text);
          spreadsheetInstanceRef.current.reRender();
          onDataChange(spreadsheetInstanceRef.current.getData());
        }
      },
      undo: () => {
        if (spreadsheetInstanceRef.current?.sheet?.undo) {
          spreadsheetInstanceRef.current.sheet.undo();
        }
      },
      redo: () => {
        if (spreadsheetInstanceRef.current?.sheet?.redo) {
          spreadsheetInstanceRef.current.sheet.redo();
        }
      },
      clearCurrentSheet: () => {
        if (spreadsheetInstanceRef.current?.sheet?.data) {
          spreadsheetInstanceRef.current.sheet.data.rows.clear();
          spreadsheetInstanceRef.current.reRender();
          onDataChange(spreadsheetInstanceRef.current.getData());
        }
      },
      reRender: () => {
        if (spreadsheetInstanceRef.current?.sheet?.reload) {
          spreadsheetInstanceRef.current.sheet.reload();
        }
      },
      selectCell: (sheetIndex: number, rowIndex: number, colIndex: number) => {
        if (spreadsheetInstanceRef.current) {
          // If sheet index is different, switch sheet if possible
          const bottombar = spreadsheetInstanceRef.current.bottombar;
          if (bottombar && bottombar.menu && bottombar.menu.items) {
            const item = bottombar.menu.items[sheetIndex];
            if (item && item.el) {
              item.el.click();
            }
          }

          // Set cell focus
          const colLetter = XLSX.utils.encode_col(colIndex);
          const cellCoord = `${colLetter}${rowIndex + 1}`;
          const cell = spreadsheetInstanceRef.current.cell(rowIndex, colIndex, sheetIndex);
          const text = cell?.text !== undefined ? String(cell.text) : '';
          activeCellPosRef.current = { r: rowIndex, c: colIndex };
          onActiveCellChange(cellCoord, text, rowIndex, colIndex);
        }
      },
    }));

    useEffect(() => {
      if (!containerRef.current) return;

      // Clean existing element if re-running
      containerRef.current.innerHTML = '';

      const createSpreadsheet = (window as any).x_spreadsheet;
      const s = createSpreadsheet(containerRef.current, {
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

      spreadsheetInstanceRef.current = s;

      // Load initial data
      s.loadData(initialData);

      // Bind change handler
      s.change((data: any) => {
        onDataChange(data);

        // Update active cell text if changed
        const { r, c } = activeCellPosRef.current;
        const currentSheetData = (s as any).cell(r, c);
        const text = currentSheetData?.text !== undefined ? String(currentSheetData.text) : '';
        const coord = XLSX.utils.encode_cell({ r, c });
        onActiveCellChange(coord, text, r, c);
      });

      // Bind cell selected
      s.on('cell-selected', (cell: any, ri: number, ci: number) => {
        activeCellPosRef.current = { r: ri, c: ci };
        const coord = XLSX.utils.encode_cell({ r: ri, c: ci });
        const text = cell?.text !== undefined ? String(cell.text) : '';
        onActiveCellChange(coord, text, ri, ci);
        onSelectionStatsChange(null);
      });

      // Bind multiple cells selected for stats
      s.on('cells-selected', (_cell: any, { sri, sci, eri, eci }: any) => {
        const startCoord = XLSX.utils.encode_cell({ r: sri, c: sci });
        const endCoord = XLSX.utils.encode_cell({ r: eri, c: eci });
        const rangeCoord = startCoord === endCoord ? startCoord : `${startCoord}:${endCoord}`;

        const activeCell = (s as any).cell(sri, sci);
        const text = activeCell?.text !== undefined ? String(activeCell.text) : '';
        onActiveCellChange(rangeCoord, text, sri, sci);

        // Calculate selection stats
        let count = 0;
        let numericCount = 0;
        let sum = 0;
        let min = Infinity;
        let max = -Infinity;

        for (let r = sri; r <= eri; r++) {
          for (let c = sci; c <= eci; c++) {
            count++;
            const cObj = (s as any).cell(r, c);
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
          onSelectionStatsChange({
            count,
            numericCount,
            sum,
            avg: numericCount > 0 ? sum / numericCount : 0,
            min: numericCount > 0 ? min : 0,
            max: numericCount > 0 ? max : 0,
          });
        } else {
          onSelectionStatsChange(null);
        }
      });

      // Bind cell edited
      s.on('cell-edited', (text: string, ri: number, ci: number) => {
        activeCellPosRef.current = { r: ri, c: ci };
        const coord = XLSX.utils.encode_cell({ r: ri, c: ci });
        onActiveCellChange(coord, text, ri, ci);
      });

      // Resize observer to adapt spreadsheet canvas
      const handleResize = () => {
        if (s && (s as any).sheet && typeof (s as any).sheet.reload === 'function') {
          (s as any).sheet.reload();
        }
      };

      const resizeObserver = new ResizeObserver(() => {
        handleResize();
      });

      const container = containerRef.current;
      if (container) {
        resizeObserver.observe(container);
      }
      window.addEventListener('resize', handleResize);

      return () => {
        resizeObserver.disconnect();
        window.removeEventListener('resize', handleResize);
        if (container) {
          container.innerHTML = '';
        }
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
