import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Printer,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileSpreadsheet,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import type { XSpreadsheetData } from '../utils/spreadsheetConverter';
import {
  PRINT_PAPER_SIZES,
  PRINT_MARGIN_OPTIONS,
  type PrintConfig,
  type CellRange,
  generatePrintPages,
  triggerIframePrint,
} from '../utils/printRenderer';

interface PrintDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: XSpreadsheetData;
  activeSheetIndex: number;
  selectedRange: CellRange | null;
  filename: string;
}

export const PrintDialog: React.FC<PrintDialogProps> = ({
  isOpen,
  onClose,
  data,
  activeSheetIndex,
  selectedRange,
  filename,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Print configuration state initialized on mount
  const [config, setConfig] = useState<PrintConfig>(() => {
    const isMultiCellSelection =
      selectedRange && (selectedRange.sri !== selectedRange.eri || selectedRange.sci !== selectedRange.eci);
    return {
      paperSizeId: 'letter',
      orientation: 'portrait',
      marginId: 'normal',
      customMarginInches: 0.5,
      scope: isMultiCellSelection ? 'selection' : 'active-sheet',
      scaleMode: 'fit-width',
      showGridlines: true,
    };
  });

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(0.65);

  const activeSheet = data[activeSheetIndex] || data[0];
  const activeSheetName = activeSheet?.name || 'Sheet1';

  // Format selection coordinate range if selected
  const selectionLabel = useMemo(() => {
    if (!selectedRange) return null;
    const startCoord = XLSX.utils.encode_cell({ r: selectedRange.sri, c: selectedRange.sci });
    const endCoord = XLSX.utils.encode_cell({ r: selectedRange.eri, c: selectedRange.eci });
    return startCoord === endCoord ? startCoord : `${startCoord}:${endCoord}`;
  }, [selectedRange]);

  // Native <dialog> lifecycle
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  // Generate pages in memory
  const pages = useMemo(() => {
    return generatePrintPages(data, activeSheetIndex, selectedRange, config);
  }, [data, activeSheetIndex, selectedRange, config]);

  // Derive safe page index
  const safeCurrentPage = Math.max(1, Math.min(currentPage, pages.length || 1));
  const currentPageData = pages[safeCurrentPage - 1] || pages[0];

  // Auto-fit zoom on preview container resize
  const handleAutoFitZoom = () => {
    if (!previewContainerRef.current || !currentPageData) return;
    const containerW = previewContainerRef.current.clientWidth - 80;
    const containerH = previewContainerRef.current.clientHeight - 80;
    const scaleW = containerW / currentPageData.widthPx;
    const scaleH = containerH / currentPageData.heightPx;
    const optimal = Math.max(0.3, Math.min(1.0, Math.min(scaleW, scaleH)));
    setZoom(parseFloat(optimal.toFixed(2)));
  };

  const handlePrint = () => {
    triggerIframePrint(pages, config);
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClose={onClose}
      className="outline-none"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-[96vw] max-w-6xl h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Top Header Bar */}
        <div className="h-14 px-6 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">Print settings</span>
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {filename}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Configure page setup and export to PDF or printer</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer ml-1"
              title="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Body: Preview & Sidebar */}
        <div className="flex-1 flex min-h-0 bg-slate-100">
          {/* Left / Center: Interactive Page Preview */}
          <div className="flex-1 flex flex-col min-w-0 relative">
            {/* Preview Toolbar */}
            <div className="h-10 px-4 bg-white/80 backdrop-blur-xs border-b border-slate-200/80 flex items-center justify-between text-xs text-slate-600 z-10 shrink-0">
              {/* Pagination controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={safeCurrentPage <= 1}
                  onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
                  className="p-1 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-medium text-slate-700 px-1">
                  Page {safeCurrentPage} of {pages.length}
                </span>
                <button
                  type="button"
                  disabled={safeCurrentPage >= pages.length}
                  onClick={() => setCurrentPage(Math.min(pages.length, safeCurrentPage + 1))}
                  className="p-1 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Zoom controls */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.25, parseFloat((z - 0.1).toFixed(2))))}
                  className="p-1 rounded-md hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                  title="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="font-mono text-[11px] text-slate-600 w-12 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(1.5, parseFloat((z + 0.1).toFixed(2))))}
                  className="p-1 rounded-md hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                  title="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleAutoFitZoom}
                  className="p-1 rounded-md hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer ml-1"
                  title="Fit to view"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Scrollable Canvas Preview Area */}
            <div
              ref={previewContainerRef}
              className="flex-1 overflow-auto p-8 flex items-center justify-center min-h-0 bg-slate-100/90"
            >
              {currentPageData ? (
                <div
                  className="bg-white shadow-2xl rounded-xs border border-slate-300/80 relative transition-transform duration-100 ease-out origin-center"
                  style={{
                    width: `${currentPageData.widthPx * zoom}px`,
                    height: `${currentPageData.heightPx * zoom}px`,
                    padding: `${currentPageData.paddingPx * zoom}px`,
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      transform: `scale(${zoom})`,
                      transformOrigin: 'top left',
                      width: `${currentPageData.widthPx - 2 * currentPageData.paddingPx}px`,
                      height: `${currentPageData.heightPx - 2 * currentPageData.paddingPx}px`,
                      overflow: 'hidden',
                    }}
                    dangerouslySetInnerHTML={{ __html: currentPageData.html }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                  <FileSpreadsheet className="w-10 h-10 stroke-1" />
                  <p className="text-xs">No printable content found</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Settings Panel */}
          <div className="w-80 sm:w-84 border-l border-slate-200 bg-white p-5 overflow-y-auto shrink-0 flex flex-col gap-5 text-xs text-slate-700 shadow-xs">
            <div className="font-bold text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
              Print Settings
            </div>

            {/* 1. Print Scope */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-800">Print</label>
              <select
                value={config.scope}
                onChange={(e) => setConfig({ ...config, scope: e.target.value as any })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active-sheet">Current sheet ({activeSheetName})</option>
                {selectionLabel && (
                  <option value="selection">Selected cells ({selectionLabel})</option>
                )}
                <option value="workbook">Entire workbook ({data.length} sheets)</option>
              </select>
            </div>

            {/* 2. Paper Size */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-800">Paper size</label>
              <select
                value={config.paperSizeId}
                onChange={(e) => setConfig({ ...config, paperSizeId: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {PRINT_PAPER_SIZES.map((paper) => (
                  <option key={paper.id} value={paper.id}>
                    {paper.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Orientation */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-800">Page orientation</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, orientation: 'portrait' })}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border font-medium cursor-pointer transition-all ${
                    config.orientation === 'portrait'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="w-3.5 h-4.5 border border-current rounded-xs" />
                  <span>Portrait</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConfig({ ...config, orientation: 'landscape' })}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border font-medium cursor-pointer transition-all ${
                    config.orientation === 'landscape'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="w-4.5 h-3.5 border border-current rounded-xs" />
                  <span>Landscape</span>
                </button>
              </div>
            </div>

            {/* 4. Scale / Fit */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-800">Scale</label>
              <select
                value={config.scaleMode}
                onChange={(e) => setConfig({ ...config, scaleMode: e.target.value as any })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="fit-width">Fit to width (Recommended)</option>
                <option value="normal">Normal (100%)</option>
                <option value="fit-page">Fit to page</option>
              </select>
              <p className="text-[11px] text-slate-400">
                {config.scaleMode === 'fit-width' && 'Resizes sheet width to fit page, flows rows vertically.'}
                {config.scaleMode === 'normal' && 'Prints cells at their 100% standard dimensions.'}
                {config.scaleMode === 'fit-page' && 'Scales both width and height to fit on a single page.'}
              </p>
            </div>

            {/* 5. Margins */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-800">Margins</label>
              <select
                value={config.marginId}
                onChange={(e) => setConfig({ ...config, marginId: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {PRINT_MARGIN_OPTIONS.map((margin) => (
                  <option key={margin.id} value={margin.id}>
                    {margin.name}
                  </option>
                ))}
              </select>

              {config.marginId === 'custom' && (
                <div className="flex items-center gap-2 mt-1 bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-600 font-medium whitespace-nowrap">Margin:</span>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="0"
                      max="3"
                      step="0.05"
                      value={config.customMarginInches ?? 0.5}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setConfig((prev) => ({
                          ...prev,
                          customMarginInches: isNaN(val) ? 0 : Math.max(0, Math.min(3, val)),
                        }));
                      }}
                      className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-md text-slate-800 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.5"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-medium pointer-events-none">
                      in
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 6. Formatting Options */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <label className="font-semibold text-slate-800">Formatting</label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={config.showGridlines}
                  onChange={(e) => setConfig({ ...config, showGridlines: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-slate-700">Show gridlines</span>
              </label>
            </div>

            <div className="mt-auto pt-4 border-t border-slate-100 text-[11px] text-slate-400">
              Clicking &ldquo;Print / Save as PDF&rdquo; invokes your native browser printing dialog. Select &ldquo;Save as PDF&rdquo; in the printer destination to generate a PDF file.
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
};
